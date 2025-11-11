// script.js - Main application logic (Memories)

document.addEventListener('DOMContentLoaded', async () => {
  const supabase = window.supabaseClient; // ✅ Use global client
  const memoryBody = document.getElementById('memory-body');
  const emojiButton = document.getElementById('emojiButton');
  const emojiPicker = document.getElementById('emojiPicker');
  const postButton = document.getElementById('postButton');
  const postsContainer = document.getElementById('postsContainer');

  // Global state for current media files (managed by media.js)
  window.currentMediaFiles = [];

  // === EDIT MODAL ELEMENTS ===
  const editModal = document.getElementById('editModal');
  const editBody = document.getElementById('editBody');
  const closeEditModal = document.getElementById('closeEditModal');
  const editMediaContainer = document.getElementById('editMediaContainer');
  const addMoreMediaButton = document.getElementById('addMoreMediaButton');
  const addMoreMediaInput = document.getElementById('addMoreMediaInput');
  const saveEditButton = document.getElementById('saveEditButton');
  const deleteEditButton = document.getElementById('deleteEditButton');
  const editUploadProgress = document.getElementById('editUploadProgress');
  const editProgressFill = document.getElementById('editProgressFill');
  const editProgressText = document.getElementById('editProgressText');

  // Edit state
  let currentEditPostId = null;
  let currentEditMedia = [];
  let newMediaFiles = [];

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

  // Post handler
  postButton.addEventListener('click', async () => {
    const user = await checkAuth();
    if (!user) return;

    let body = memoryBody.value.trim();

    // Append media markdown from global state (managed by media.js)
    for (const media of window.currentMediaFiles) {
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
    window.currentMediaFiles = []; // Reset media files

    // Clear previews via media.js
    if (typeof window.clearMediaPreviews === 'function') {
      window.clearMediaPreviews();
    }

    // Reload posts
    loadUserPosts();
  });

  // === EDIT MODAL HANDLERS ===

  closeEditModal.addEventListener('click', () => {
    editModal.style.display = 'none';
    currentEditPostId = null;
    currentEditMedia = [];
    newMediaFiles = [];
  });

  addMoreMediaButton.addEventListener('click', async () => {
    const user = await checkAuth();
    if (!user) return;
    addMoreMediaInput.click();
  });

  addMoreMediaInput.addEventListener('change', async (e) => {
    const user = await checkAuth();
    if (!user) return;

    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Override bucket for memories
    window.CURRENT_BUCKET_OVERRIDE = 'memories';

    for (const file of files) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} is not an allowed type.`);
        continue;
      }
      if (file.size > 50 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 50MB limit.`);
        continue;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

      if (editUploadProgress) {
        editUploadProgress.style.display = 'block';
        editProgressFill.style.width = '0%';
        editProgressText.textContent = `Uploading ${file.name}...`;
      }

      const { error: uploadError } = await supabase.storage
        .from('memories')
        .upload(fileName, file, {
          upsert: false,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            if (editProgressFill) editProgressFill.style.width = `${percentCompleted}%`;
            if (editProgressText) editProgressText.textContent = `Uploading ${file.name}... ${percentCompleted}%`;
          }
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        alert('Upload failed: ' + uploadError.message);
        if (editUploadProgress) editUploadProgress.style.display = 'none';
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from('memories').getPublicUrl(fileName);

      newMediaFiles.push({ url: publicUrl, name: file.name, type: file.type });
      addMediaPreviewToEdit(publicUrl, file.name, file.type, false);
    }

    if (editUploadProgress) editUploadProgress.style.display = 'none';
    addMoreMediaInput.value = '';
    window.CURRENT_BUCKET_OVERRIDE = null; // Reset override
  });

  function addMediaPreviewToEdit(url, filename, fileType, isExisting) {
    const previewItem = document.createElement('div');
    previewItem.className = 'media-preview-item';
    previewItem.style.cssText = `
      position: relative;
      display: inline-block;
      margin: 5px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      background: white;
      padding: 5px;
    `;

    let previewElement;
    if (fileType.startsWith('image')) {
      previewElement = document.createElement('img');
      previewElement.src = url;
      previewElement.alt = filename;
      previewElement.style.cssText = `
        max-width: 90px;
        max-height: 90px;
        object-fit: contain;
        border-radius: 4px;
      `;
    } else if (fileType.startsWith('video')) {
      previewElement = document.createElement('video');
      previewElement.muted = true;
      previewElement.playsInline = true;
      previewElement.style.cssText = `
        max-width: 90px;
        max-height: 90px;
        object-fit: contain;
        border-radius: 4px;
      `;
      const source = document.createElement('source');
      source.src = url;
      source.type = fileType;
      previewElement.appendChild(source);
    }

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
      previewItem.remove();
      if (isExisting) {
        const existing = currentEditMedia.find(m => m.url === url);
        if (existing) existing.isDeleted = true;
      } else {
        newMediaFiles = newMediaFiles.filter(f => f.url !== url);
      }
    };

    previewItem.appendChild(previewElement);
    previewItem.appendChild(removeBtn);
    editMediaContainer.appendChild(previewItem);
  }

  function getMediaType(url) {
    if (url.match(/\.(mp4|webm|mov)$/i)) return 'video/mp4';
    return 'image/jpeg';
  }

  // Make openEditModal globally available for inline onclick
  window.openEditModal = function(postId, body) {
    currentEditPostId = postId;

    // Extract text only (remove media markdown)
    let textOnly = body.replace(/!\[([^\]]*)\]\s*\(\s*([^)]+)\s*\)/g, '').trim();
    editBody.value = textOnly;

    // Extract media
    const mediaMatches = [...body.matchAll(/!\[([^\]]*)\]\s*\(\s*([^)]+)\s*\)/g)];
    currentEditMedia = mediaMatches.map(m => ({
      url: m[2].trim(),
      name: m[1] || 'Media',
      isExisting: true,
      isDeleted: false
    }));
    newMediaFiles = [];

    // Clear and render previews
    editMediaContainer.innerHTML = '';
    currentEditMedia.forEach(m => {
      addMediaPreviewToEdit(m.url, m.name, getMediaType(m.url), true);
    });

    editModal.style.display = 'flex';
  };

  saveEditButton.addEventListener('click', async () => {
    if (!currentEditPostId) return;
    const user = await checkAuth();
    if (!user) return;

    let body = editBody.value.trim();
    const allMedia = [
      ...currentEditMedia.filter(m => !m.isDeleted),
      ...newMediaFiles
    ];

    allMedia.forEach(m => {
      body += `\n\n![${m.name || 'Media'}](${m.url})`;
    });

    const { error } = await supabase
      .from('memories')
      .update({ body })
      .eq('id', currentEditPostId)
      .eq('user_id', user.id);

    if (error) {
      alert('Failed to update: ' + error.message);
      return;
    }

    editModal.style.display = 'none';
    loadUserPosts();
  });

  deleteEditButton.addEventListener('click', async () => {
    if (!currentEditPostId) return;
    if (!confirm('Are you sure you want to delete this memory?')) return;

    const user = await checkAuth();
    if (!user) return;

    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', currentEditPostId)
      .eq('user_id', user.id);

    if (error) {
      alert('Failed to delete: ' + error.message);
      return;
    }

    editModal.style.display = 'none';
    loadUserPosts();
  });

  // Load posts
  async function loadUserPosts() {
    const user = await checkAuth();
    if (!user) return;

    const { data, error } = await supabase
      .from('memories')
      .select('id, body, created_at')
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
      const mediaMatches = [...post.body.matchAll(/!\[([^\]]*)\]\s*\(\s*([^)]+)\s*\)/g)];

      if (mediaMatches.length > 0) {
        let mediaGridHtml = '<div class="media-grid" style="position: relative; width: 100%; height: 300px; margin: 10px 0; background: white;">';

        const firstMedia = mediaMatches[0];
        const firstAlt = firstMedia[1] || 'Media';
        const firstUrl = firstMedia[2].trim();
        const isFirstVideo = firstUrl.includes('.mp4') || firstUrl.includes('.webm') || firstUrl.includes('.mov');

        mediaGridHtml += `
          <div class="media-grid-item large" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; cursor: pointer;" onclick="openGallery('${post.id}', '${encodeURIComponent(JSON.stringify(mediaMatches.map(m => m[2])))}', 0)">
            ${isFirstVideo ?
              `<video muted playsinline style="width: 100%; height: 100%; object-fit: cover;">
                 <source src="${firstUrl}" type="video/mp4">
               </video>` :
              `<img src="${firstUrl}" alt="${firstAlt}" style="width: 100%; height: 100%; object-fit: contain; object-position: center; display: block; background: white;" onload="adjustImageFit(this)">
             `
            }
          </div>
        `;

        if (mediaMatches.length > 1) {
          const secondMedia = mediaMatches[1];
          const secondUrl = secondMedia[2].trim();
          const isSecondVideo = secondUrl.includes('.mp4') || secondUrl.includes('.webm') || secondUrl.includes('.mov');

          mediaGridHtml += `
            <div class="media-grid-overlay" style="position: absolute; bottom: 10px; right: 10px; width: 80px; height: 80px; cursor: pointer;" onclick="openGallery('${post.id}', '${encodeURIComponent(JSON.stringify(mediaMatches.map(m => m[2])))}', 1)">
              <div class="second-thumbnail" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.3); background: white;">
                ${isSecondVideo ?
                  `<video muted playsinline style="width: 100%; height: 100%; object-fit: cover;">
                     <source src="${secondUrl}" type="video/mp4">
                   </video>` :
                  `<img src="${secondUrl}" alt="Additional media" style="width: 100%; height: 100%; object-fit: contain; object-position: center; display: block; background: white;" onload="adjustThumbnailFit(this)">
                 `
                }
              </div>
              <div class="more-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <div class="more-text" style="color: white; font-size: 16px; font-weight: bold;">+${mediaMatches.length - 1}</div>
              </div>
            </div>
          `;
        }

        mediaGridHtml += '</div>';

        let textOnlyBody = post.body.replace(/!\[([^\]]*)\]\s*\(\s*([^)]+)\s*\)/g, '');
        textOnlyBody = textOnlyBody.replace(/\n/g, '<br>');

        return `
          <div class="post-item" style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="margin: 0; line-height: 1.6;">${textOnlyBody}</p>
            ${mediaGridHtml}
            <small style="display: block; color: #718096; font-size: 12px; margin-top: 8px;">
              ${new Date(post.created_at).toLocaleString()}
            </small>
            <div style="margin-top: 10px;">
              <button onclick="openEditModal('${post.id}', \`${post.body.replace(/`/g, '&#96;')}\`)" style="background: #4299e1; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">Edit</button>
            </div>
          </div>
        `;
      } else {
        let processedBody = post.body.replace(/\n/g, '<br>');
        return `
          <div class="post-item" style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="margin: 0; line-height: 1.6;">${processedBody}</p>
            <small style="display: block; color: #718096; font-size: 12px; margin-top: 8px;">
              ${new Date(post.created_at).toLocaleString()}
            </small>
            <div style="margin-top: 10px;">
              <button onclick="openEditModal('${post.id}', \`${post.body.replace(/`/g, '&#96;')}\`)" style="background: #4299e1; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">Edit</button>
            </div>
          </div>
        `;
      }
    }).join('');
  }

  // Image fit helpers (already in your script)
  window.adjustImageFit = function(img) {
    if (img.complete) {
      applyFitBasedOnAspectRatio(img);
    } else {
      img.onload = function() {
        img.onload = null;
        applyFitBasedOnAspectRatio(img);
      };
    }
  };

  window.adjustThumbnailFit = function(img) {
    if (img.complete) {
      applyFitBasedOnAspectRatio(img);
    } else {
      img.onload = function() {
        img.onload = null;
        applyFitBasedOnAspectRatio(img);
      };
    }
  };

  function applyFitBasedOnAspectRatio(img) {
    if (img.naturalWidth && img.naturalHeight) {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      if (aspectRatio < 1) {
        img.style.objectFit = 'contain';
      } else if (aspectRatio > 1.2) {
        img.style.objectFit = 'cover';
      } else {
        img.style.objectFit = 'contain';
      }
    } else {
      img.style.objectFit = 'contain';
    }
  }

  // Initialize
  checkAuth().then(user => {
    if (user) {
      loadUserPosts();
    }
  });
});
