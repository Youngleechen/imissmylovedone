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
  const mediaButton = document.getElementById('mediaButton');
  const mediaInput = document.getElementById('mediaInput');
  const postsContainer = document.getElementById('postsContainer');

  // State
  let selectedPhoto = null;

  // === AUTO-RESIZE ===
  const autoResize = () => {
    memoryBody.style.height = 'auto';
    const newHeight = Math.min(memoryBody.scrollHeight, 300);
    memoryBody.style.height = newHeight + 'px';
  };

  memoryBody.addEventListener('input', autoResize);
  autoResize();

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

    const wrapper = emojiButton.closest('.thought-actions') || emojiButton.closest('.thought-box');
    if (!wrapper) {
      console.error('Emoji button wrapper not found!');
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

  // === MEDIA UPLOAD LOGGING ===
  mediaButton.addEventListener('click', () => {
    console.log('🖼️ Media button clicked — opening file picker');
    mediaInput.click();
  });

  mediaInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.log('❌ No file selected');
      return;
    }

    selectedPhoto = file;
    console.log('✅ Photo selected:', file.name, `(${file.size} bytes)`, file.type);

    // Clear previous preview
    const existingPreview = document.querySelector('.photo-preview');
    if (existingPreview) existingPreview.remove();

    // Create new preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.src = event.target.result;
      img.style.maxWidth = '100px';
      img.style.maxHeight = '100px';
      img.style.borderRadius = '6px';
      img.style.marginTop = '8px';

      const previewContainer = document.createElement('div');
      previewContainer.className = 'photo-preview';
      previewContainer.appendChild(img);
      document.querySelector('.thought-box').insertBefore(previewContainer, emojiPicker);

      console.log('🖼️ Photo preview rendered in UI');
    };
    reader.readAsDataURL(file);
  });

  // === POSTING WITH REAL AUTH ===
  async function loadUserPosts() {
    console.log('🔍 Loading posts for current user...');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      postsContainer.innerHTML = '<p>Sign in to see your posts.</p>';
      console.log('❌ Not signed in — cannot load posts');
      return;
    }

    console.log('👤 Loading posts for user ID:', user.id);

    const { data, error } = await supabase
      .from('memories')
      .select('body, created_at, media_url')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Load error:', error);
      postsContainer.innerHTML = '<p>Could not load your posts.</p>';
      return;
    }

    console.log('📊 Loaded', data.length, 'posts:', data);

    if (data.length === 0) {
      postsContainer.innerHTML = '<p>You haven’t posted anything yet.</p>';
      return;
    }

    postsContainer.innerHTML = data.map(post => {
      const mediaHtml = post.media_url
        ? `<img src="${post.media_url}" alt="Memory photo" style="max-width:100%;border-radius:8px;margin-top:8px;">`
        : '';

      return `
        <div class="post-item">
          <p>${post.body.replace(/\n/g, '<br>')}</p>
          ${mediaHtml}
          <small class="post-date">${new Date(post.created_at).toLocaleString()}</small>
        </div>
      `;
    }).join('');
  }

  postButton.addEventListener('click', async () => {
    const body = memoryBody.value.trim();
    if (!body && !selectedPhoto) {
      alert('Please write something or add a photo.');
      console.log('❌ Post failed: No text or photo added');
      return;
    }

    console.log('✅ Starting post process...');
    console.log('📝 Text content:', body);
    console.log('🖼️ Photo selected:', selectedPhoto ? `${selectedPhoto.name} (${selectedPhoto.size} bytes)` : 'None');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('You must be signed in to post.');
      console.log('❌ Post failed: User not authenticated');
      return;
    }

    console.log('👤 Signed in as user ID:', user.id);

    // Prepare post data
    const postData = {
      user_id: user.id,
      title: 'Untitled',
      body
    };

    // Upload photo if exists
    if (selectedPhoto) {
      console.log('📤 Uploading photo:', selectedPhoto.name);

      const fileName = `${Date.now()}-${selectedPhoto.name}`;
      console.log('💾 Filename for upload:', fileName);

      try {
        const { data, error } = await supabase.storage
          .from('memories')
          .upload(fileName, selectedPhoto, {
            upsert: true,
            contentType: selectedPhoto.type
          });

        if (error) {
          console.error('❌ Upload failed:', error);
          alert('Failed to upload photo: ' + error.message);
          return;
        }

        console.log('✅ Upload succeeded:', data);

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('memories')
          .getPublicUrl(fileName);

        postData.media_url = publicUrlData.publicUrl;
        console.log('🔗 Public URL generated:', publicUrlData.publicUrl);

      } catch (err) {
        console.error('💥 Unexpected upload error:', err);
        alert('Unexpected error during upload: ' + err.message);
        return;
      }
    }

    // Insert post
    console.log('📥 Inserting post into memories table...');
    console.log('📝 Post data being sent:', postData);
    
    try {
      const { error } = await supabase
        .from('memories')
        .insert(postData);

      if (error) {
        console.error('❌ Database insert failed:', error);
        alert('Failed to save post: ' + error.message);
        return;
      }

      console.log('✅ Post saved successfully!');
      console.log('📌 Post ', postData);

      // Reset UI
      memoryBody.value = '';
      autoResize();
      selectedPhoto = null;
      const preview = document.querySelector('.photo-preview');
      if (preview) preview.remove();

      loadUserPosts();
      console.log('🎉 Post completed and UI refreshed!');

    } catch (err) {
      console.error('💥 Unexpected database error:', err);
      alert('Unexpected error saving post: ' + err.message);
    }
  });

  // Initialize
  loadUserPosts();
});
