document.addEventListener('DOMContentLoaded', async () => {
  const supabase = window.supabase.createClient(
    'https://ccetnqdqfrsitooestbh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjZXRucWRxZnJzaXRvb2VzdGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTE4MjksImV4cCI6MjA3Nzg4NzgyOX0.1NjRZZrgsPOg-2z_r2kRELWn9IVXNEQNpSxK6CktJRY'
  );

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

  // Track multiple media files
  let currentMediaFiles = [];

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = 'signin.html';
      return null;
    }
    return user;
  }

  // Auto-resize textarea
  const autoResize = () => {
    memoryBody.style.height = 'auto';
    const newHeight = Math.min(memoryBody.scrollHeight, 300);
    memoryBody.style.height = newHeight + 'px';
  };
  memoryBody.addEventListener('input', autoResize);
  autoResize();

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

  document.addEventListener('click', (e) => {
    if (
      !emojiButton.contains(e.target) &&
      !emojiPicker.contains(e.target) &&
      !memoryBody.contains(e.target)
    ) {
      emojiPicker.classList.remove('show');
    }
  });

  // Media upload handler
  mediaButton.addEventListener('click', async () => {
    const user = await checkAuth();
    if (!user) return;
    mediaInput.click();
  });

  mediaInput.addEventListener('change', async (e) => {
    const user = await checkAuth();
    if (!user) return;

    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Validate all files
    for (const file of files) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} is not an allowed type.`);
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 50MB limit.`);
        return;
      }
    }

    // Process each file
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

      // Show upload progress
      if (uploadProgress && progressFill && progressText) {
        uploadProgress.style.display = 'block';
        progressFill.style.width = '0%';
        progressText.textContent = `Uploading ${file.name}...`;
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
              progressText.textContent = `Uploading ${file.name}... ${percentCompleted}%`;
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

      // Add to media files array
      currentMediaFiles.push({
        url: publicUrl,
        name: file.name,
        type: file.type
      });

      // Show preview
      showMediaPreview(publicUrl, file.name, file.type);
    }

    // Hide progress
    if (uploadProgress) {
      uploadProgress.style.display = 'none';
    }
    mediaInput.value = '';
  });

  function showMediaPreview(url, filename, fileType) {
    const previewItem = document.createElement('div');
    previewItem.className = 'media-preview-item';
    previewItem.style.cssText = `
      position: relative;
      display: inline-block;
      margin: 5px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;

    let previewElement;
    if (fileType.startsWith('image')) {
      previewElement = document.createElement('img');
      previewElement.src = url;
      previewElement.alt = filename;
      previewElement.style.cssText = `
        max-width: 100px;
        height: 100px;
        object-fit: cover;
        border-radius: 8px;
      `;
    } else if (fileType.startsWith('video')) {
      previewElement = document.createElement('video');
      previewElement.controls = false;
      previewElement.style.cssText = `
        max-width: 100px;
        height: 100px;
        object-fit: cover;
        border-radius: 8px;
      `;
      const source = document.createElement('source');
      source.src = url;
      source.type = fileType;
      previewElement.appendChild(source);
    }

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '×';
    removeBtn.style.cssText = `
      position: absolute;
      top: 5px;
      right: 5px;
      background: rgba(0,0,0,0.7);
      color: white;
      border: none;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      cursor: pointer;
      font-weight: bold;
    `;
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      removeMediaPreview(previewItem, url);
    };

    previewItem.appendChild(previewElement);
    previewItem.appendChild(removeBtn);
    mediaPreviewContainer.appendChild(previewItem);
    mediaPreviewContainer.style.display = 'block';
  }

  function removeMediaPreview(previewItem, url) {
    previewItem.remove();
    currentMediaFiles = currentMediaFiles.filter(item => item.url !== url);
    if (currentMediaFiles.length === 0) {
      mediaPreviewContainer.style.display = 'none';
    }
  }

  // Load posts
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

      // Convert markdown media syntax to HTML
      processedBody = processedBody.replace(/!\[([^\]]*)\]\s*\(\s*([^)]+)\s*\)/g, (match, alt, url) => {
        const cleanUrl = url.trim();
        const safeUrl = cleanUrl.replace(/"/g, '&quot;').replace(/'/g, '&#39;');

        if (safeUrl.includes('.mp4') || safeUrl.includes('.webm') || safeUrl.includes('.mov')) {
          return `<video controls style="max-width:100%; height:auto; border-radius:8px; margin:10px 0;">
                    <source src="${safeUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                  </video>`;
        } else {
          return `<img src="${safeUrl}" alt="${alt || 'Uploaded media'}" style="max-width:100%; height:auto; border-radius:8px; margin:10px 0;">`;
        }
      });

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

  // Post handler
  postButton.addEventListener('click', async () => {
    const user = await checkAuth();
    if (!user) return;

    let body = memoryBody.value.trim();

    // Append media markdown
    for (const media of currentMediaFiles) {
      body += `\n\n![${media.name}](${media.url})`;
    }

    if (!body) {
      alert('Please write something or attach media first.');
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

    // Clear state
    memoryBody.value = '';
    autoResize();
    currentMediaFiles = [];
    mediaPreviewContainer.innerHTML = '';
    mediaPreviewContainer.style.display = 'none';

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
