// Supabase credentials (from your project)
const SUPABASE_URL = 'https://ccetnqdqfrsitooestbh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjZXRucWRxZnJzaXRvb2VzdGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTE4MjksImV4cCI6MjA3Nzg4NzgyOX0.1NjRZZrgsPOg-2z_r2kRELWn9IVXNEQNpSxK6CktJRY';

const supabase = window.supabase.createClient(SUPABASE_URL.trim(), SUPABASE_ANON_KEY);

// DOM elements
const textInput = document.getElementById('textInput');
const postButton = document.getElementById('postButton');
const emojiButton = document.getElementById('emojiButton');
const emojiPicker = document.getElementById('emojiPicker');
const postsContainer = document.getElementById('postsContainer');

// === EMOJI PICKER LOGIC ===

// Lazy-load emoji data or use a simple set
function populateEmojiPicker() {
  if (emojiPicker.innerHTML) return; // already loaded

  // A small curated set of supportive/expressive emojis
  const emojis = '❤️🤍💙💔🙏✨🕯️🕊️🌧️🌈☁️🌧️☔️☕️🌱🌼🌙⭐️🌌🕊️🤗🥺😢😭😊🥰';

  let html = '';
  for (const emoji of emojis) {
    if (emoji.trim()) {
      html += `<button type="button" data-emoji="${emoji}">${emoji}</button>`;
    }
  }
  emojiPicker.innerHTML = html;

  // Add click handler
  emojiPicker.addEventListener('click', (e) => {
    if (e.target.matches('button[data-emoji]')) {
      const emoji = e.target.dataset.emoji;
      insertEmojiAtCursor(emoji);
      emojiPicker.classList.remove('show');
    }
  });
}

function insertEmojiAtCursor(emoji) {
  const start = textInput.selectionStart;
  const end = textInput.selectionEnd;
  const text = textInput.value;

  textInput.value = text.slice(0, start) + emoji + text.slice(end);

  // Move cursor after the inserted emoji
  const newCursorPos = start + emoji.length;
  textInput.setSelectionRange(newCursorPos, newCursorPos);
  textInput.focus();

  autoResize();
}

function autoResize() {
  textInput.style.height = 'auto';
  textInput.style.height = Math.min(textInput.scrollHeight, 300) + 'px';
}

textInput.addEventListener('input', autoResize);
autoResize();

// Toggle emoji picker
emojiButton.addEventListener('click', (e) => {
  e.stopPropagation();
  populateEmojiPicker();

  const isShowing = emojiPicker.classList.contains('show');
  emojiPicker.classList.remove('show');

  if (isShowing) return;

  // Position picker above or below input
  const wrapper = textInput.closest('.input-wrapper') || textInput.parentNode;
  const wrapperRect = wrapper.getBoundingClientRect();
  const pickerHeight = 380;
  const spaceBelow = window.innerHeight - wrapperRect.bottom;
  const spaceAbove = wrapperRect.top;

  emojiPicker.style.top = 'auto';
  emojiPicker.style.bottom = 'auto';
  emojiPicker.style.left = '0';
  emojiPicker.style.right = 'auto';
  emojiPicker.style.width = '300px';

  if (spaceBelow >= pickerHeight) {
    emojiPicker.style.top = (wrapperRect.bottom + 8) + 'px';
    emojiPicker.style.left = wrapperRect.left + 'px';
  } else if (spaceAbove >= pickerHeight) {
    emojiPicker.style.bottom = (window.innerHeight - wrapperRect.top + 8) + 'px';
    emojiPicker.style.left = wrapperRect.left + 'px';
  } else {
    // Fallback: bottom of viewport
    emojiPicker.style.top = 'auto';
    emojiPicker.style.bottom = '0';
    emojiPicker.style.left = '0';
    emojiPicker.style.width = '100%';
  }

  setTimeout(() => emojiPicker.classList.add('show'), 10);
});

// Close picker on outside click
document.addEventListener('click', (e) => {
  if (
    !emojiButton.contains(e.target) &&
    !emojiPicker.contains(e.target) &&
    !textInput.contains(e.target)
  ) {
    emojiPicker.classList.remove('show');
  }
});

// === POSTING & AUTH LOGIC ===

async function loadUserPosts() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    postsContainer.innerHTML = '<p>Sign in to see your posts.</p>';
    return;
  }

  const { data, error } = await supabase
    .from('memories')
    .select('body, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Load error:', error);
    postsContainer.innerHTML = '<p>Could not load your posts.</p>';
    return;
  }

  if (data.length === 0) {
    postsContainer.innerHTML = '<p>You haven’t posted anything yet.</p>';
    return;
  }

  postsContainer.innerHTML = data.map(post => `
    <div class="post-item">
      <p>${post.body.replace(/\n/g, '<br>')}</p>
      <small>${new Date(post.created_at).toLocaleString()}</small>
    </div>
  `).join('');
}

postButton.addEventListener('click', async () => {
  const body = textInput.value.trim();
  if (!body) {
    alert('Please write something first.');
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert('You must be signed in to post.');
    return;
  }

  const { error } = await supabase
    .from('memories')
    .insert({
      user_id: user.id,
      title: 'Untitled',
      body
    });

  if (error) {
    console.error('Post error:', error);
    alert(`Failed to save your thought: ${error.message}`);
    return;
  }

  textInput.value = '';
  autoResize();
  loadUserPosts();
});

// Load on start
loadUserPosts();
