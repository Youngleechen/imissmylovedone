// script.js - Main application logic

document.addEventListener('DOMContentLoaded', async () => {
  const supabase = window.supabaseClient; // ✅ Use global client
  const memoryBody = document.getElementById('memory-body');
  const emojiButton = document.getElementById('emojiButton');
  const emojiPicker = document.getElementById('emojiPicker');
  const postButton = document.getElementById('postButton');
  const postsContainer = document.getElementById('postsContainer');

  // Global state for current media files (managed by media.js)
  window.currentMediaFiles = [];

  // NEW: Edit modal elements
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

  // NEW: Track edited post and media
  let currentEditPostId = null;
  let currentEditMedia = []; // {url, name, type, isExisting: true/false, isDeleted: true/false}
  let newMediaFiles = []; // For newly added files in edit mode

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

    // 👇 Explicitly clear the preview container via media.js
    if (typeof window.clearMediaPreviews === 'function') {
      window.clearMediaPreviews();
    }

    // Reload posts
    loadUserPosts();
  });

  // NEW: Edit Modal Functions
  closeEditModal.addEventListener('click', () => {
    editModal.style.display = 'none';
    currentEditPostId = null;
    currentEditMedia = [];
    newMediaFiles = [];
  });

  addMoreMediaButton.addEventListener('click', () => {
    addMoreMediaInput.click();
  });

  addMoreMediaInput.addEventListener('change', async (e) => {
    const user = await checkAuth();
    if (!user) return;

    const files = Array.from(e.target.files);
    if (!files.length) return;

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

      // Upload new file to memories bucket
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

      if (editUploadProgress) {
        editUploadProgress.style.display = 'block';
        editProgressFill.style.width = '0%';
        editProgressText.textContent = `Uploading ${file.name}...`;
      }

      const { error: uploadError } = await supabase.storage
        .from('memories') // Use correct bucket name
        .upload(fileName, file, {
          upsert: false,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            if (editProgressFill) editProgressFill.style.width = percentCompleted + '%';
            if (editProgressText) editProgressText.textContent = `Uploading ${file.name}... ${percentCompleted}%`;
          }
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        alert('Upload failed: ' + uploadError.message);
        if (editUploadProgress) editUploadProgress.style.display = 'none';
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('memories') // Use correct bucket name
        .getPublicUrl(fileName);

      newMediaFiles.push({ url: publicUrl, name: file.name, type: file.type });
      addMediaPreviewToEdit(publicUrl, file.name, file.type, false);
    }

    if (editUploadProgress) editUploadProgress.style.display = 'none';
    addMoreMediaInput.value = '';
  });

  function addMediaPreviewToEdit(url, filename, fileType, isExisting) {
    // Create a unique ID for this preview element to avoid duplication
    const previewId = `edit-media-${Date.now()}-${Math.random().toString(36).substr(2,9)}`;
    
    const previewItem = document.createElement('div');
    previewItem.id = previewId;
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
      removeMediaPreviewFromEdit(previewItem, url, isExisting);
    };

    previewItem.appendChild(previewElement);
    previewItem.appendChild(removeBtn);
    editMediaContainer.appendChild(previewItem);
  }

  function removeMediaPreviewFromEdit(previewItem, url, isExisting) {
    previewItem.remove();
    if (isExisting) {
      const existingMedia = currentEditMedia.find(m => m.url === url);
      if (existingMedia) existingMedia.isDeleted = true;
    } else {
      newMediaFiles = newMediaFiles.filter(f => f.url !== url);
    }
  }

  async function openEditModal(postId, currentBody) {
    const user = await checkAuth();
    if (!user) return;

    currentEditPostId = postId;
    
    // ✅ FIX 1: Extract only text content for editing, remove media markdown
    let textOnlyBody = currentBody.replace(/!\[([^\]]*)\]\s*\(\s*([^)]+)\s*\)/g, '');
    editBody.value = textOnlyBody.trim(); // Set only the text content

    // Extract and populate existing media
    const mediaMatches = [...currentBody.matchAll(/!\[([^\]]*)\]\s*\(\s*([^)]+)\s*\)/g)];
    currentEditMedia = mediaMatches.map(m => ({ 
      url: m[2], 
      name: m[1] || 'Media', 
      isExisting: true, 
      isDeleted: false 
    }));
    newMediaFiles = [];

    // ✅ FIX 2: Clear the container before adding previews to prevent duplicates
    editMediaContainer.innerHTML = '';

    // Add previews for existing media
    currentEditMedia.forEach(media => {
      addMediaPreviewToEdit(media.url, media.name, getMediaType(media.url), true);
    });

    editModal.style.display = 'flex';
  }

  function getMediaType(url) {
    if (url.includes('.mp4') || url.includes('.webm') || url.includes('.mov')) return 'video/mp4';
    return 'image/jpeg'; // Default to image
  }

  saveEditButton.addEventListener('click', async () => {
    if (!currentEditPostId) return;

    const user = await checkAuth();
    if (!user) return;

    let body = editBody.value.trim();
    const allMedia = [
      ...currentEditMedia.filter(m => !m.isDeleted),
      ...newMediaFiles
    ];

    // Append non-deleted media to body
    for (const media of allMedia) {
      body += `\n\n![${media.name || 'Media'}](${media.url})`;
    }

    const { error } = await supabase
      .from('memories')
      .update({ body })
      .eq('id', currentEditPostId)
      .eq('user_id', user.id); // Ensure user owns the post

    if (error) {
      alert('Failed to update: ' + error.message);
      return;
    }

    editModal.style.display = 'none';
    loadUserPosts(); // Reload posts to reflect changes
  });

  deleteEditButton.addEventListener('click', async () => {
    if (!currentEditPostId) return;

    if (!confirm('Are you sure you want to delete this post?')) return;

    const user = await checkAuth();
    if (!user) return;

    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', currentEditPostId)
      .eq('user_id', user.id); // Ensure user owns the post

    if (error) {
      alert('Failed to delete: ' + error.message);
      return;
    }

    editModal.style.display = 'none';
    loadUserPosts(); // Reload posts
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
      // Extract media URLs from post body
      const mediaMatches = [...post.body.matchAll(/!\[([^\]]*)\]\s*\(\s*([^)]+)\s*\)/g)];
      
      if (mediaMatches.length > 0) {
        let mediaGridHtml = '<div class="media-grid" style="position: relative; width: 100%; height: 300px; margin: 10px 0; background: white;">';
        
        // Show first media item as large
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
        
        // If there are more media items, show the +N overlay
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

        // Remove media markdown from text body
        let textOnlyBody = post.body.replace(/!\[([^\]]*)\]\s*\(\s*([^)]+)\s*\)/g, '');
        textOnlyBody = textOnlyBody.replace(/\n/g, '<br>');
        
        return `
          <div class="post-item" style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="margin: 0; line-height: 1.6;">${textOnlyBody}</p>
            ${mediaGridHtml}
            <small style="display: block; color: #718096; font-size: 12px; margin-top: 8px;">
              ${new Date(post.created_at).toLocaleString()}
            </small>
            <!-- NEW: Edit/Delete Buttons -->
            <div style="margin-top: 10px;">
              <button onclick="openEditModal('${post.id}', \`${post.body.replace(/`/g, '&#96;')}\`)" style="background: #4299e1; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 5px;">Edit</button>
              <button onclick="deletePost('${post.id}')" style="background: #e53e3e; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">Delete</button>
            </div>
          </div>
        `;
      } else {
        // Handle posts without media
        let processedBody = post.body.replace(/\n/g, '<br>');
        return `
          <div class="post-item" style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="margin: 0; line-height: 1.6;">${processedBody}</p>
            <small style="display: block; color: #718096; font-size: 12px; margin-top: 8px;">
              ${new Date(post.created_at).toLocaleString()}
            </small>
            <!-- NEW: Edit/Delete Buttons -->
            <div style="margin-top: 10px;">
              <button onclick="openEditModal('${post.id}', \`${post.body.replace(/`/g, '&#96;')}\`)" style="background: #4299e1; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 5px;">Edit</button>
              <button onclick="deletePost('${post.id}')" style="background: #e53e3e; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">Delete</button>
            </div>
          </div>
        `;
      }
    }).join('');
  }

  // NEW: Delete post function
  async function deletePost(postId) {
    const user = await checkAuth();
    if (!user) return;

    if (!confirm('Are you sure you want to delete this post?')) return;

    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', postId)
      .eq('user_id', user.id); // Ensure user owns the post

    if (error) {
      alert('Failed to delete: ' + error.message);
      return;
    }

    // Reload posts
    loadUserPosts();
  }

  // Function to detect image aspect ratio and adjust fit
  window.adjustImageFit = function(img) {
    if (img.complete) {
      // Image already loaded
      applyFitBasedOnAspectRatio(img);
    } else {
      // Wait for image to load
      img.onload = function() {
        img.onload = null; // Prevent multiple calls
        applyFitBasedOnAspectRatio(img);
      };
    }
  };

  window.adjustThumbnailFit = function(img) {
    if (img.complete) {
      // Image already loaded
      applyFitBasedOnAspectRatio(img);
    } else {
      // Wait for image to load
      img.onload = function() {
        img.onload = null; // Prevent multiple calls
        applyFitBasedOnAspectRatio(img);
      };
    }
  };

  function applyFitBasedOnAspectRatio(img) {
    if (img.naturalWidth && img.naturalHeight) {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      if (aspectRatio < 1) { // Portrait (height > width)
        img.style.objectFit = 'contain';
      } else if (aspectRatio > 1.2) { // Landscape (width > height by more than 20%)
        img.style.objectFit = 'cover';
      } else { // Square or nearly square
        img.style.objectFit = 'contain';
      }
    } else {
      // Default to contain for images that can't determine aspect ratio
      img.style.objectFit = 'contain';
    }
  }

  // Make functions available globally for inline onclick
  window.openEditModal = openEditModal;
  window.deletePost = deletePost;

  // Initialize
  checkAuth().then(user => {
    if (user) {
      loadUserPosts();
    }
  });
});
