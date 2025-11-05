// Import shared Supabase instance
import { supabase } from '../shared/utils.js';

// DOM elements
const authCheck = document.getElementById('auth-check');
const appEl = document.getElementById('app');
const displayNameEl = document.getElementById('display-name');
const lifelineBtn = document.getElementById('lifeline-btn');
const memoryForm = document.getElementById('memory-form');
const memoriesList = document.getElementById('memories-list');
const logoutBtn = document.getElementById('logout-btn');

// Emoji elements
const memoryBody = document.getElementById('memory-body');
const emojiButton = document.getElementById('emojiButton');
const emojiPicker = document.getElementById('emojiPicker');

// Auto-resize textarea
const autoResize = () => {
  memoryBody.style.height = 'auto';
  memoryBody.style.height = Math.min(memoryBody.scrollHeight, 300) + 'px';
};
memoryBody.addEventListener('input', autoResize);
autoResize();

// Toggle emoji picker
const toggleEmojiPicker = (e) => {
  e.stopPropagation();
  const isShowing = emojiPicker.classList.contains('show');
  emojiPicker.classList.remove('show');

  if (isShowing) return;

  const wrapper = emojiButton.closest('.form-group');
  const wrapperRect = wrapper.getBoundingClientRect();
  const pickerHeight = 380;
  const spaceBelow = window.innerHeight - wrapperRect.bottom;
  const spaceAbove = wrapperRect.top;

  emojiPicker.style.top = 'auto';
  emojiPicker.style.bottom = 'auto';
  emojiPicker.style.left = 'auto';
  emojiPicker.style.right = '0';

  if (spaceBelow >= pickerHeight) {
    emojiPicker.style.top = (wrapperRect.height + 8) + 'px';
  } else if (spaceAbove >= pickerHeight) {
    emojiPicker.style.bottom = (wrapperRect.height + 8) + 'px';
    emojiPicker.style.top = 'auto';
  } else {
    emojiPicker.style.top = (wrapperRect.height + 8) + 'px';
  }

  setTimeout(() => emojiPicker.classList.add('show'), 10);
};

emojiButton.addEventListener('click', toggleEmojiPicker);

// Insert emoji at cursor
emojiPicker.addEventListener('emoji-click', (e) => {
  const emoji = e.detail.unicode;
  const start = memoryBody.selectionStart;
  const end = memoryBody.selectionEnd;
  const text = memoryBody.value;

  memoryBody.value = text.slice(0, start) + emoji + text.slice(end);
  autoResize();

  const newCursorPos = start + emoji.length;
  memoryBody.setSelectionRange(newCursorPos, newCursorPos);
  memoryBody.focus();

  emojiPicker.classList.remove('show');
});

// Close picker on outside click
document.addEventListener('click', (e) => {
  if (
    !emojiButton.contains(e.target) &&
    !emojiPicker.contains(e.target) &&
    !memoryBody.contains(e.target)
  ) {
    emojiPicker.classList.remove('show');
  }
});

// Auth & App logic
async function checkUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    authCheck.innerHTML = `<p>You are not signed in. <a href="../login/">Go to login</a></p>`;
    return;
  }

  authCheck.classList.add('hidden');
  appEl.classList.remove('hidden');

  const { data: profile } = await supabase
    .from('users')
    .select('display_name')
    .eq('id', user.id)
    .single();

  if (!profile?.display_name) {
    const name = prompt("Welcome. What name would you like others to see?");
    const displayName = name?.trim() || "Anonymous";
    await supabase
      .from('users')
      .upsert({ id: user.id, display_name: displayName }, { onConflict: 'id' });
    displayNameEl.textContent = displayName;
  } else {
    displayNameEl.textContent = profile.display_name;
  }

  loadMemories();
  setupLifeline(user.id);
}

async function setupLifeline(userId) {
  await supabase
    .from('users')
    .update({ is_online: true, last_active: new Date().toISOString() })
    .eq('id', userId);

  lifelineBtn.addEventListener('click', async () => {
    const isOnline = lifelineBtn.classList.contains('online');
    const newState = !isOnline;
    await supabase
      .from('users')
      .update({ is_online: newState })
      .eq('id', userId);

    if (newState) {
      lifelineBtn.className = 'lifeline-btn online';
      lifelineBtn.innerHTML = '✅ Lifeline On';
    } else {
      lifelineBtn.className = 'lifeline-btn';
      lifelineBtn.innerHTML = '🕯️ Lifeline Off';
    }
  });

  window.addEventListener('beforeunload', async () => {
    await supabase
      .from('users')
      .update({ is_online: false })
      .eq('id', userId);
  });
}

async function loadMemories() {
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) {
    memoriesList.innerHTML = `<p class="error">Could not load memories.</p>`;
    return;
  }

  if (data.length === 0) {
    memoriesList.innerHTML = `<p>No memories shared yet. Be the first.</p>`;
    return;
  }

  memoriesList.innerHTML = data.map(m => `
    <div class="memory">
      <h3 class="memory-title">${m.title}</h3>
      <p class="memory-body">${(m.body || '').replace(/\n/g, '<br>')}</p>
    </div>
  `).join('');
}

memoryForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('memory-title').value.trim();
  const body = memoryBody.value.trim();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from('memories').insert({
    user_id: user.id,
    title: title,
    body: body,
    is_public: true
  });

  if (error) {
    alert('Failed to post memory: ' + error.message);
  } else {
    memoryForm.reset();
    memoryBody.style.height = 'auto';
    autoResize();
    loadMemories();
  }
});

logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = '/';
});

// Start the app
checkUser();
