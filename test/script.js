document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Supabase
  const supabase = window.supabase.createClient(
    'https://ccetnqdqfrsitooestbh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjZXRucWRxZnJzaXRvb2VzdGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTE4MjksImV4cCI6MjA3Nzg4NzgyOX0.1NjRZZrgsPOg-2z_r2kRELWn9IVXNEQNpSxK6CktJRY'
  );

  // DOM elements
  const memoryBody = document.getElementById('memory-body');
  const emojiButton = document.getElementById('emojiButton');
  const emojiPicker = document.getElementById('emojiPicker');
  const postButton = document.getElementById('postButton');
  const postsContainer = document.getElementById('postsContainer');

  // Auto-resize textarea
  const autoResize = () => {
    memoryBody.style.height = 'auto';
    const newHeight = Math.min(memoryBody.scrollHeight, 300);
    memoryBody.style.height = newHeight + 'px';
  };

  memoryBody.addEventListener('input', autoResize);
  autoResize(); // initial

  // Emoji picker
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

    // ✅ FIXED: Use existing parent containers (no .form-group needed)
    const wrapper = emojiButton.closest('.thought-actions') || emojiButton.closest('.thought-box');
    if (!wrapper) {
      console.error('Could not find wrapper for emoji picker');
      return;
    }

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
    } else {
      emojiPicker.style.top = (wrapperRect.height + 8) + 'px';
    }

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

  // Load & post
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

  // Initial load
  loadUserPosts();
});
