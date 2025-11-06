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
  const mediaButton = document.getElementById('mediaButton');
  const mediaInput = document.getElementById('mediaInput');
  const uploadProgress = document.getElementById('uploadProgress');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const mediaPreviewContainer = document.getElementById('mediaPreviewContainer');

  // Create media preview container if it doesn't exist
  let mediaPreviewContainerEl = document.createElement('div');
  mediaPreviewContainerEl.id = 'mediaPreviewContainer';
  mediaPreviewContainerEl.style.cssText = `
    margin-top: 12px;
    padding: 8px;
    background: #f9f9f9;
    border-radius: 8px;
    display: none;
  `;
  memoryBody.parentNode.insertBefore(mediaPreviewContainerEl, mediaButton.parentNode.nextSibling);

  // Track uploaded media URL and filename
  let currentMediaUrl = null;
  let currentMediaFilename = null;

  // Check if user is authenticated
  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = 'signin.html';
      return null;
    }
    return user;
  }

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

  // === MEDIA UPLOAD ===
  mediaButton.addEventListener('click', async () => {
    const user = await checkAuth();
    if (!user) return;

    mediaInput.click();
  });

  mediaInput.addEventListener('change', async (e) => {
    const user = await checkAuth();
    if (!user) return;

    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only images and videos are allowed.');
      return;
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size must be under 50MB.');
      return;
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

    // Show upload progress
    if (uploadProgress && progressFill && progressText) {
      uploadProgress.style.display = 'block';
      progressFill.style.width = '0%';
      progressText.textContent = 'Uploading...';
    }

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('memories')
      .upload(fileName, file, {
        upsert: false,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (progressFill) {
            progressFill.style.width = percentCompleted + '%';
          }
          if (progressText) {
            progressText.textContent = `Uploading... ${percentCompleted}%`;
          }
        }
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      alert('Upload failed: ' + uploadError.message);
      if (uploadProgress) {
        uploadProgress.style.display = 'none';
      }
      return;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('memories')
      .getPublicUrl(fileName);

    // Store for preview
    currentMediaUrl = publicUrl;
    currentMediaFilename = file.name;

    // Add media reference to textarea with better formatting
    const currentText = memoryBody.value;
    memoryBody.value = currentText + `\n\n![${file.name}](${publicUrl})\n\n`;
    autoResize();

    // Show preview
    showMediaPreview(publicUrl, file.name, file.type);

    // Hide progress and clear input
    if (uploadProgress) {
      uploadProgress.style.display = 'none';
    }
    mediaInput.value = '';
  });

  // === SHOW MEDIA PREVIEW ===
  function showMediaPreview(url, filename, fileType) {
    mediaPreviewContainerEl.innerHTML = '';

    let previewElement;
    if (fileType.startsWith('image')) {
      previewElement = document.createElement('img');
      previewElement.src = url;
      previewElement.alt = filename;
      previewElement.style.cssText = `
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        margin-bottom: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      `;
    } else if (fileType.startsWith('video')) {
      previewElement = document.createElement('video');
      previewElement.controls = true;
      previewElement.style.cssText = `
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        margin-bottom: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      `;
      const source = document.createElement('source');
      source.src = url;
      source.type = fileType;
      previewElement.appendChild(source);
    }

    const filenameSpan = document.createElement('span');
    filenameSpan.textContent = filename;
    filenameSpan.style.cssText = `
      display: block;
      font-size: 12px;
      color: #4a5568;
      margin-top: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `;

    mediaPreviewContainerEl.appendChild(previewElement);
    mediaPreviewContainerEl.appendChild(filenameSpan);
    mediaPreviewContainerEl.style.display = 'block';
  }

  // === CLEAR MEDIA PREVIEW ===
  function clearMediaPreview() {
    mediaPreviewContainerEl.innerHTML = '';
    mediaPreviewContainerEl.style.display = 'none';
    currentMediaUrl = null;
    currentMediaFilename = null;
  }

async function loadUserPosts() {
  const user = await checkAuth();
  if (!user) return;

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

  postsContainer.innerHTML = data.map(post => {
    let processedBody = post.body;

    // Convert markdown image/video syntax to HTML
    processedBody = processedBody.replace(/!\[([^\]]*)\]\s*\(\s*([^)]+)\s*\)/g, (match, alt, url) => {
      url = url.trim();

      if (url.includes('.mp4') || url.includes('.webm') || url.includes('.mov')) {
        return `<video controls style="max-width:100%; height:auto; border-radius:8px; margin:10px 0;">
                  <source src="${url}" type="video/mp4">
                  Your browser does not support the video tag.
                </video>`;
      } else {
        return `<img src="${url}" alt="${alt || 'Uploaded media'}" style="max-width:100%; height:auto; border-radius:8px; margin:10px 0;">`;
      }
    });

    // Replace newlines with <br> for text formatting
    processedBody = processedBody.replace(/\n/g, '<br>');

    return `
      <div class="post-item" style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <p style="margin: 0; line-height: 1.6;">${processedBody}</p>
        <small style="display: block; color: #718096; font-size: 12px; margin-top: 8px;">
          ${new Date(post.created_at).toLocaleString()}
        </small>
      </div>
    `;
  }).join('');
}
  // === POSTING (with media support) ===
  postButton.addEventListener('click', async () => {
    const user = await checkAuth();
    if (!user) return;

    const body = memoryBody.value.trim();
    if (!body) {
      alert('Please write something first.');
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
      alert('Failed to post: ' + error.message);
      return;
    }

    // Clear textarea and preview
    memoryBody.value = '';
    autoResize();
    clearMediaPreview();

    // Reload posts
    loadUserPosts();
  });

  // Initialize
  checkAuth().then(user => {
    if (user) {
      loadUserPosts();
    }
  });
});

