// Initialize Supabase
const supabase = window.supabase.createClient(
  'https://ccetnqdqfrsitooestbh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjZXRucWRxZnJzaXRvb2VzdGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTE4MjksImV4cCI6MjA3Nzg4NzgyOX0.1NjRZZrgsPOg-2z_r2kRELWn9IVXNEQNpSxK6CktJRY'
);

// DOM Elements
const memoryBody = document.getElementById('memory-body');
const emojiButton = document.getElementById('emojiButton');
const emojiPicker = document.getElementById('emojiPicker');
const postButton = document.getElementById('postButton');
const postsContainer = document.getElementById('postsContainer');

// === AUTO-RESIZE (height only — let CSS handle everything else) ===
const autoResize = () => {
  // Reset height to auto to get scrollHeight
  memoryBody.style.height = 'auto';
  // Set new height, capped at 300px
  const newHeight = Math.min(memoryBody.scrollHeight, 300);
  memoryBody.style.height = newHeight + 'px';
};

// Apply auto-resize on input
memoryBody.addEventListener('input', autoResize);

// === EMOJI PICKER ===
let pickerInstance = null;

emojiButton.addEventListener('click', (e) => {
  e.stopPropagation();

  if (!pickerInstance) {
    pickerInstance = document.createElement('emoji-picker');
    pickerInstance.setAttribute('id', 'actual-emoji-picker');
    emojiPicker.appendChild(pickerInstance);

    pickerInstance.addEventListener('emoji-click', (event) => {
      const emoji = event.detail.unicode;
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
  }

  const isShowing = emojiPicker.classList.contains('show');
  emojiPicker.classList.remove('show');

  if (isShowing) return;

  const rect = emojiButton.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const pickerHeight = 380;

  emojiPicker.style.top = spaceBelow >= pickerHeight
    ? (rect.height + 8) + 'px'
    : 'auto';
  emojiPicker.style.bottom = spaceBelow < pickerHeight
    ? (rect.height + 8) + 'px'
    : 'auto';

  emojiPicker.classList.add('show');
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

// === POSTING & LOADING ===
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
      <small class="post-date">${new Date(post.created_at).toLocaleString()}</small>
    </div>
  `).join('');
}

postButton.addEventListener('click', async () => {
  const body = memoryBody.value.trim();
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
    .insert({ user_id: user.id, title: 'Untitled', body });

  if (error) {
    alert('Failed to post: ' + error.message);
    return;
  }

  memoryBody.value = '';
  autoResize();
  loadUserPosts();
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  autoResize(); // Set initial height
  loadUserPosts();
});
