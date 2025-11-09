// progress-updater-script.js - Dedicated for posting progress updates

document.addEventListener('DOMContentLoaded', async () => {
  const supabase = window.supabaseClient;
  const updateBody = document.getElementById('update-body');
  const emojiButton = document.getElementById('emojiButton');
  const emojiPicker = document.getElementById('emojiPicker');
  const postButton = document.getElementById('postButton');
  const updatesContainer = document.getElementById('updatesContainer');
  const mediaButton = document.getElementById('mediaButton');
  const mediaInput = document.getElementById('mediaInput');
  const uploadProgress = document.getElementById('uploadProgress');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const mediaPreviewContainer = document.getElementById('mediaPreviewContainer');

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

  // Track media files for this session (for new posts)
  let currentMediaFiles = [];

  // NEW: Track edited post and media
  let currentEditPostId = null;
  let currentEditMedia = []; // {url, name, type, isExisting: true/false, isDeleted: true/false}
  let newMediaFiles = []; // For newly added files in edit mode

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '../signin.html'; // Adjust path as needed
      return null;
    }
    return user;
  }

  // Auto-resize textarea
  const autoResize = () => {
    updateBody.style.height = 'auto';
    const newHeight = Math.min(updateBody.scrollHeight, 300);
    updateBody.style.height = newHeight + 'px';
  };
  updateBody.addEventListener('input', autoResize);
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
        const start = updateBody.selectionStart;
        const end = updateBody.selectionEnd;
        const text = updateBody.value;
        updateBody.value = text.slice(0, start) + emoji + text.slice(end);
        autoResize();
        const newCursorPos = start + emoji.length;
        updateBody.setSelectionRange(newCursorPos, newCursorPos);
        updateBody.focus();
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
      !updateBody.contains(e.target)
    ) {
      emojiPicker.classList.remove('show');
    }
  });

  // Media upload handler (for new posts)
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
    for (const currentFile of files) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
      if (!allowedTypes.includes(currentFile.type)) {
        alert(`File ${currentFile.name} is not an allowed type.`);
        return;
      }
      if (currentFile.size > 50 * 1024 * 1024) {
        alert(`File ${currentFile.name} exceeds 50MB limit.`);
        return;
      }
    }

    // Process each file
    for (const currentFile of files) {
      const fileExt = currentFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

      // Show upload progress
      if (uploadProgress && progressFill && progressText) {
        uploadProgress.style.display = 'block';
        progressFill.style.width = '0%';
        progressText.textContent = `Uploading ${currentFile.name}...`;
      }

      // Upload to dev-updates-media bucket
      const { error: uploadError } = await supabase.storage
        .from('dev-updates-media')
        .upload(fileName, currentFile, {
          upsert: false,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            if (progressFill) {
              progressFill.style.width = percentCompleted + '%';
            }
            if (progressText) {
              progressText.textContent = `Uploading ${currentFile.name}... ${percentCompleted}%`;
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
        .from('dev-updates-media')
        .getPublicUrl(fileName);

      // Add to media files array
      currentMediaFiles.push({
        url: publicUrl,
        name: currentFile.name,
        type: currentFile.type
      });

      // Show preview
      showMediaPreview(publicUrl, currentFile.name, currentFile.type);
    }

    // Hide progress
    if (uploadProgress) {
      uploadProgress.style.display = 'none';
    }
    mediaInput.value = '';
  });

  // NEW: Handle pasted images
  updateBody.addEventListener('paste', async (e) => {
    const user = await checkAuth();
    if (!user) return;

    const items = e.clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault(); // Prevent default paste behavior
        
        const imageFile = items[i].getAsFile();
        if (!imageFile) continue;

        // Validate file type and size
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(imageFile.type)) {
          alert('Pasted item is not an allowed image type.');
          continue;
        }
        
        if (imageFile.size > 50 * 1024 * 1024) {
          alert('Pasted image exceeds 50MB limit.');
          continue;
        }

        // Generate filename and upload
        const fileExt = imageFile.type.split('/')[1];
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

        // Show upload progress
        if (uploadProgress && progressFill && progressText) {
          uploadProgress.style.display = 'block';
          progressFill.style.width = '0%';
          progressText.textContent = 'Uploading pasted image...';
        }

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('dev-updates-media')
          .upload(fileName, imageFile, {
            upsert: false,
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              if (progressFill) progressFill.style.width = percentCompleted + '%';
              if (progressText) progressText.textContent = `Uploading pasted image... ${percentCompleted}%`;
            }
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          alert('Upload failed: ' + uploadError.message);
          if (uploadProgress) uploadProgress.style.display = 'none';
          return;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('dev-updates-media')
          .getPublicUrl(fileName);

        // Add to media files array
        currentMediaFiles.push({
          url: publicUrl,
          name: 'Pasted Image',
          type: imageFile.type
        });

        // Show preview
        showMediaPreview(publicUrl, 'Pasted Image', imageFile.type);
        
        // Hide progress
        if (uploadProgress) uploadProgress.style.display = 'none';
      }
    }
  });

  // Helper: Show media preview (for new posts)
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

  // Helper: Remove media preview (for new posts)
  function removeMediaPreview(previewItem, url) {
    previewItem.remove();
    currentMediaFiles = currentMediaFiles.filter(item => item.url !== url);
    if (currentMediaFiles.length === 0) {
      mediaPreviewContainer.style.display = 'none';
    }
  }

  // Post handler (for new posts)
  postButton.addEventListener('click', async () => {
    const user = await checkAuth();
    if (!user) return;

    let body = updateBody.value.trim();

    // Append media markdown
    for (const media of currentMediaFiles) {
      body += `\n\n![${media.name}](${media.url})`;
    }

    if (!body) {
      alert('Please write something or attach media first.');
      return;
    }

    // ✅ CORRECTED: Use 'author_id' to match your Supabase table
    const { error } = await supabase
      .from('development_updates') // ✅ NEW TABLE
      .insert({
        author_id: user.id,       // ✅ Matches your column name
        title: 'Progress Update',
        body,
        created_at: new Date().toISOString()
      });

    if (error) {
      alert('Failed to post: ' + error.message);
      return;
    }

    // Clear state
    updateBody.value = '';
    autoResize();
    currentMediaFiles = [];
    mediaPreviewContainer.innerHTML = '';
    mediaPreviewContainer.style.display = 'none';

    // Reload updates
    loadUpdates();
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

      // Upload new file
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

      if (editUploadProgress) {
        editUploadProgress.style.display = 'block';
        editProgressFill.style.width = '0%';
        editProgressText.textContent = `Uploading ${file.name}...`;
      }

      const { error: uploadError } = await supabase.storage
        .from('dev-updates-media')
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
        .from('dev-updates-media')
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
      .from('development_updates')
      .update({ body })
      .eq('id', currentEditPostId)
      .eq('author_id', user.id); // Ensure user owns the post

    if (error) {
      alert('Failed to update: ' + error.message);
      return;
    }

    editModal.style.display = 'none';
    loadUpdates(); // Reload posts to reflect changes
  });

  deleteEditButton.addEventListener('click', async () => {
    if (!currentEditPostId) return;

    if (!confirm('Are you sure you want to delete this post?')) return;

    const user = await checkAuth();
    if (!user) return;

    const { error } = await supabase
      .from('development_updates')
      .delete()
      .eq('id', currentEditPostId)
      .eq('author_id', user.id); // Ensure user owns the post

    if (error) {
      alert('Failed to delete: ' + error.message);
      return;
    }

    editModal.style.display = 'none';
    loadUpdates(); // Reload posts
  });

  // Load updates
  async function loadUpdates() {
    const user = await checkAuth();
    if (!user) return;

    const { data, error } = await supabase
      .from('development_updates')
      .select('id, body, created_at')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Load error:', error);
      updatesContainer.innerHTML = '<p>Could not load your updates.</p>';
      return;
    }

    if (data.length === 0) {
      updatesContainer.innerHTML = '<p>You haven’t posted any progress updates yet.</p>';
      return;
    }

    updatesContainer.innerHTML = data.map(post => {
      const mediaMatches = [...post.body.matchAll(/!\[([^\]]*)\]\s*\(\s*([^)]+)\s*\)/g)];
      
      let mediaHtml = '';
      let bodyHtml = '';
      
      if (mediaMatches.length > 0) {
        let mediaGridHtml = '<div class="media-grid" style="position: relative; width: 100%; height: 300px; margin: 10px 0;">';
        
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
              `<img src="${firstUrl}" alt="${firstAlt}" style="width: 100%; height: 100%; object-fit: cover;">
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
              <div class="second-thumbnail" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                ${isSecondVideo ? 
                  `<video muted playsinline style="width: 100%; height: 100%; object-fit: cover;">
                     <source src="${secondUrl}" type="video/mp4">
                   </video>` :
                  `<img src="${secondUrl}" alt="Additional media" style="width: 100%; height: 100%; object-fit: cover;">
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
        
        mediaHtml = mediaGridHtml;
        bodyHtml = textOnlyBody;
      } else {
        bodyHtml = post.body.replace(/\n/g, '<br>');
      }

      // NEW: Add edit/delete buttons
      return `
        <div class="post-item" style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <p style="margin: 0; line-height: 1.6;">${bodyHtml}</p>
          ${mediaHtml}
          <small style="display: block; color: #718096; font-size: 12px; margin-top: 8px;">
            ${new Date(post.created_at).toLocaleString()}
          </small>
          <!-- NEW: Edit/Delete Buttons -->
          <div style="margin-top: 10px;">
            <button onclick="openEditModal('${post.id}', \`${post.body.replace(/`/g, '&#96;')}\`)" style="background: #4299e1; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">Edit</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Initialize
  checkAuth().then(user => {
    if (user) {
      loadUpdates();
    }
  });

  // --- GALLERY FUNCTIONS ---
  // Reused from main app, but scoped to this page
   let currentGalleryState = null;

  window.openGallery = function(postId, encodedMediaUrlsJson, startIndex = 0) {
    const mediaUrls = JSON.parse(decodeURIComponent(encodedMediaUrlsJson));

    currentGalleryState = {
      mediaUrls: mediaUrls,
      currentIndex: startIndex
    };

    const galleryHtml = `
      <div id="gallery-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; flex-direction: column;">
        <div class="gallery-container" style="position: relative; max-width: 90vw; max-height: 85vh; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;">
          <!-- Close Button -->
          <button onclick="window.closeGallery()" style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.8); border: none; border-radius: 50%; width: 40px; height: 40px; font-size: 24px; cursor: pointer; color: #333; z-index: 10000; box-shadow: 0 2px 4px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; transition: background 0.2s ease;" onmouseover="this.style.background='rgba(255,255,255,1)';" onmouseout="this.style.background='rgba(255,255,255,0.8)';">×</button>

          <div id="gallery-swiper" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; flex: 1;">
            ${currentGalleryState.mediaUrls.map((url, index) => {
              const isVideo = url.includes('.mp4') || url.includes('.webm') || url.includes('.mov');
              return `
                <div class="gallery-slide" style="position: absolute; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease;" data-index="${index}">
                  ${isVideo ? 
                    `<video controls style="max-width: 90vw; max-height: 80vh; width: auto; height: auto;">
                       <source src="${url}" type="video/mp4">
                     </video>` :
                    `<img src="${url}" alt="Gallery item" style="max-width: 90vw; max-height: 80vh; object-fit: contain;">
                   `
                  }
                </div>
              `;
            }).join('')}
          </div>

          <button id="gallery-prev" onclick="galleryPrev()" style="position: absolute; left: 20px; background: rgba(255,255,255,0.2); border: none; border-radius: 50%; width: 50px; height: 50px; font-size: 24px; cursor: pointer; color: white; z-index: 10000;">‹</button>
          <button id="gallery-next" onclick="galleryNext()" style="position: absolute; right: 20px; background: rgba(255,255,255,0.2); border: none; border-radius: 50%; width: 50px; height: 50px; font-size: 24px; cursor: pointer; color: white; z-index: 10000;">›</button>

          <div id="gallery-counter" style="position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%); color: white; font-size: 16px; z-index: 10000;">
            <span id="current-index">${currentGalleryState.currentIndex + 1}</span> / ${currentGalleryState.mediaUrls.length}
          </div>
        </div>

        <!-- Thumbnail Strip -->
        <div id="thumbnail-strip" style="display: flex; gap: 10px; padding: 15px 0; max-width: 90vw; overflow-x: auto; justify-content: center; align-items: center;">
          ${currentGalleryState.mediaUrls.map((url, index) => {
            const isVideo = url.includes('.mp4') || url.includes('.webm') || url.includes('.mov');
            return `
              <div 
                class="thumbnail-item" 
                style="width: 60px; height: 60px; border-radius: 8px; overflow: hidden; cursor: pointer; border: ${index === currentGalleryState.currentIndex ? '3px solid white' : '3px solid transparent'}; transition: border 0.3s;"
                onclick="galleryGoToIndex(${index})"
              >
                ${isVideo ? 
                  `<video muted playsinline style="width: 100%; height: 100%; object-fit: cover;">
                     <source src="${url}" type="video/mp4">
                   </video>` :
                  `<img src="${url}" alt="Thumbnail ${index + 1}" style="width: 100%; height: 100%; object-fit: cover;">
                 `
                }
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', galleryHtml);
    
    showGallerySlide(currentGalleryState.currentIndex);

    const swiper = document.getElementById('gallery-swiper');
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      handleSwipe(startX, startY, endX, endY);
    };

    const handleMouseDown = (e) => {
      startX = e.clientX;
      startY = e.clientY;
    };

    const handleMouseUp = (e) => {
      endX = e.clientX;
      endY = e.clientY;
      handleSwipe(startX, startY, endX, endY);
    };

    swiper.addEventListener('touchstart', handleTouchStart);
    swiper.addEventListener('touchend', handleTouchEnd);
    swiper.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Close gallery when clicking outside
    const overlay = document.getElementById('gallery-overlay');
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        window.closeGallery();
      }
    });

    // Close gallery when pressing ESC
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        window.closeGallery();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // Define closeGallery globally so it can be called from anywhere
    window.closeGallery = function() {
      const overlay = document.getElementById('gallery-overlay');
      if (overlay) {
        // Clean up event listeners
        if (swiper) {
          swiper.removeEventListener('touchstart', handleTouchStart);
          swiper.removeEventListener('touchend', handleTouchEnd);
          swiper.removeEventListener('mousedown', handleMouseDown);
        }
        window.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('keydown', handleKeyDown);

        // Remove the overlay
        overlay.remove();
      }
      currentGalleryState = null;
    };
  };

  function handleSwipe(startX, startY, endX, endY) {
    const threshold = 50;
    const verticalThreshold = 30;

    const diffX = startX - endX;
    const diffY = startY - endY;

    if (Math.abs(diffX) > threshold && Math.abs(diffY) < verticalThreshold) {
      if (diffX > 0) {
        galleryNext();
      } else {
        galleryPrev();
      }
    }
  }

  function showGallerySlide(index) {
    if (!currentGalleryState || index < 0 || index >= currentGalleryState.mediaUrls.length) return;

    const slides = document.querySelectorAll('.gallery-slide');
    slides.forEach((slide, i) => {
      slide.style.opacity = i === index ? '1' : '0';
    });
    
    const counterElement = document.getElementById('current-index');
    if (counterElement) {
      counterElement.textContent = index + 1;
    }

    currentGalleryState.currentIndex = index;
    updateThumbnailBorders();
  }

  function updateThumbnailBorders() {
    const thumbnailItems = document.querySelectorAll('.thumbnail-item');
    thumbnailItems.forEach((item, index) => {
      item.style.border = index === currentGalleryState.currentIndex ? '3px solid white' : '3px solid transparent';
    });
  }

  window.galleryGoToIndex = function(index) {
    if (!currentGalleryState) return;
    showGallerySlide(index);
  };

  window.galleryNext = function() {
    if (!currentGalleryState) return;
    const newIndex = (currentGalleryState.currentIndex + 1) % currentGalleryState.mediaUrls.length;
    showGallerySlide(newIndex);
  };

  window.galleryPrev = function() {
    if (!currentGalleryState) return;
    const newIndex = (currentGalleryState.currentIndex - 1 + currentGalleryState.mediaUrls.length) % currentGalleryState.mediaUrls.length;
    showGallerySlide(newIndex);
  };

  // Ensure closeGallery is always available globally
  window.closeGallery = function() {
    const overlay = document.getElementById('gallery-overlay');
    if (overlay) {
      overlay.remove();
    }
    currentGalleryState = null;
  };
  // Make openEditModal available globally for inline onclick
  window.openEditModal = openEditModal;
});
