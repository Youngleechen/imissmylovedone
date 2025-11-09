// clipboard-uploader-script.js
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const updateBody = document.getElementById('update-body');
  const mediaButton = document.getElementById('mediaButton');
  const postButton = document.getElementById('postButton');
  const mediaInput = document.getElementById('mediaInput');
  const uploadProgress = document.getElementById('uploadProgress');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const mediaPreviewContainer = document.getElementById('mediaPreviewContainer');

  // State
  let currentMediaFiles = [];

  // Helper function to check authentication
  async function checkAuth() {
    const { data: { session }, error } = await window.supabaseClient.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }

    if (session && session.user) {
      // Return the actual authenticated user's ID
      return { id: session.user.id };
    } else {
      console.warn('No authenticated user found');
      alert('Please log in to continue');
      return null;
    }
  }

  // Show media preview
  function showMediaPreview(url, name, type) {
    if (!mediaPreviewContainer) {
      console.error('mediaPreviewContainer not found');
      return;
    }

    mediaPreviewContainer.style.display = 'block';

    const previewItem = document.createElement('div');
    previewItem.className = 'media-preview-item';
    previewItem.dataset.url = url;

    let mediaElement;
    if (type.startsWith('image/')) {
      mediaElement = document.createElement('img');
      mediaElement.src = url;
      mediaElement.alt = name;
    } else {
      mediaElement = document.createElement('video');
      mediaElement.src = url;
      mediaElement.controls = true;
      mediaElement.style.width = '100px';
      mediaElement.style.height = '100px';
      mediaElement.style.objectFit = 'cover';
    }

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '×';
    removeBtn.onclick = () => {
      currentMediaFiles = currentMediaFiles.filter(file => file.url !== url);
      previewItem.remove();
      if (currentMediaFiles.length === 0) {
        mediaPreviewContainer.style.display = 'none';
      }
    };

    previewItem.appendChild(mediaElement);
    previewItem.appendChild(removeBtn);
    mediaPreviewContainer.appendChild(previewItem);
  }

  // Handle file selection
  mediaButton.addEventListener('click', () => {
    mediaInput.click();
  });

  mediaInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const user = await checkAuth();
    if (!user) {
      alert('Authentication required');
      return;
    }

    for (const file of files) {
      // Validate file type and size
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm', 'video/ogg'
      ];
      if (!allowedTypes.includes(file.type)) {
        alert(`File type not allowed: ${file.type}`);
        continue;
      }

      if (file.size > 50 * 1024 * 1024) {
        alert('File exceeds 50MB limit');
        continue;
      }

      // Generate filename and upload
      const fileExt = file.type.split('/')[1];
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

      // Show upload progress
      uploadProgress.style.display = 'block';
      progressFill.style.width = '0%';
      progressText.textContent = `Uploading ${file.name}...`;

      // Upload to storage
      const { error: uploadError } = await window.supabaseClient.storage
        .from('dev-updates-media')
        .upload(fileName, file, {
          upsert: false,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            progressFill.style.width = percentCompleted + '%';
            progressText.textContent = `Uploading ${file.name}... ${percentCompleted}%`;
          }
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        alert('Upload failed: ' + uploadError.message);
        uploadProgress.style.display = 'none';
        return;
      }

      // Get public URL
      const {  { publicUrl } } = window.supabaseClient.storage
        .from('dev-updates-media')
        .getPublicUrl(fileName);

      // Add to media files array
      currentMediaFiles.push({
        url: publicUrl,
        name: file.name,
        type: file.type
      });

      // Show preview
      showMediaPreview(publicUrl, file.name, file.type);
      uploadProgress.style.display = 'none';
    }
  });

  // Handle pasted images
  updateBody.addEventListener('paste', async (e) => {
    console.log('Paste event detected!');
    console.log('Clipboard items:', e.clipboardData?.items);

    // Re-initialize mediaPreviewContainer if it's null
    if (!mediaPreviewContainer) {
      console.log('Re-initializing mediaPreviewContainer...');
      const tempContainer = document.getElementById('mediaPreviewContainer');
      if (tempContainer) {
        mediaPreviewContainer = tempContainer;
        console.log('mediaPreviewContainer re-initialized successfully');
      } else {
        console.error('mediaPreviewContainer still not found!');
        return;
      }
    }

    const items = e.clipboardData.items;
    if (!items) {
      console.warn('No clipboard items found');
      return;
    }

    let hasImage = false;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        hasImage = true;
        console.log('Found image in clipboard:', items[i].type);
        break;
      }
    }

    if (!hasImage) {
      console.log('No images found in clipboard, proceeding normally');
      return;
    }

    const user = await checkAuth();
    if (!user) {
      console.warn('Paste failed: No authenticated user found');
      return;
    }

    // *** CRITICAL CHECK: Ensure supabaseClient is defined ***
    if (!window.supabaseClient) {
      console.error('Supabase client is not initialized!');
      alert('Supabase client is not initialized. Please check your setup.');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();

        const imageFile = items[i].getAsFile();
        if (!imageFile) {
          console.warn('Could not get image file from clipboard item');
          continue;
        }

        console.log('Processing pasted image:', imageFile.name, imageFile.type, imageFile.size);

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(imageFile.type)) {
          alert('Pasted item is not an allowed image type.');
          continue;
        }

        if (imageFile.size > 50 * 1024 * 1024) {
          alert('Pasted image exceeds 50MB limit.');
          continue;
        }

        const fileExt = imageFile.type.split('/')[1];
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

        if (uploadProgress && progressFill && progressText) {
          uploadProgress.style.display = 'block';
          progressFill.style.width = '0%';
          progressText.textContent = 'Uploading pasted image...';
        }

        try {
          // Upload to storage
          const { error: uploadError } = await window.supabaseClient.storage
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
          const { data: { publicUrl } } = window.supabaseClient.storage
            .from('dev-updates-media')
            .getPublicUrl(fileName);

          if (!publicUrl) {
            console.error('Failed to get public URL');
            alert('Failed to get public URL for the uploaded image.');
            if (uploadProgress) uploadProgress.style.display = 'none';
            return;
          }

          // Add to media files array
          currentMediaFiles.push({
            url: publicUrl,
            name: 'Pasted Image',
            type: imageFile.type
          });

          // Show preview
          try {
            showMediaPreview(publicUrl, 'Pasted Image', imageFile.type);
            console.log('Preview added successfully for pasted image');
          } catch (previewError) {
            console.error('Error showing preview:', previewError);
            alert('Failed to show preview for pasted image.');
          }

          // Hide progress
          if (uploadProgress) uploadProgress.style.display = 'none';

        } catch (uploadError) {
          console.error('Unexpected upload error:', uploadError);
          alert('An unexpected error occurred during upload: ' + uploadError.message);
          if (uploadProgress) uploadProgress.style.display = 'none';
        }
      }
    }
  });

  // Post button handler (updated to save to Supabase)
  postButton.addEventListener('click', async () => {
    const content = updateBody.value.trim();

    // Combine text content with media URLs in markdown format
    let postBody = content;
    if (currentMediaFiles.length > 0) {
      currentMediaFiles.forEach(file => {
        postBody += `\n![${file.name}](${file.url})`;
      });
    }

    // Check if there's content to post
    if (!postBody) {
      alert('Please enter some content or add media before posting');
      return;
    }

    // Get authenticated user
    const user = await checkAuth();
    if (!user) {
      alert('Authentication required to post');
      return;
    }

    // Show posting progress
    uploadProgress.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = 'Posting...';

    try {
      // Insert post into development_updates table
      const { data, error } = await window.supabaseClient
        .from('development_updates')
        .insert([{
          author_id: user.id,
          title: 'Progress Update',
          body: postBody
        }]);

      if (error) {
        console.error('Post error:', error);
        alert('Failed to post: ' + error.message);
      } else {
        console.log('Post created successfully:', data);
        alert('Post published successfully!');

        // Clear the form
        updateBody.value = '';
        currentMediaFiles = [];
        mediaPreviewContainer.style.display = 'none';
        mediaPreviewContainer.innerHTML = '';
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An unexpected error occurred: ' + err.message);
    } finally {
      // Hide progress
      uploadProgress.style.display = 'none';
    }
  });
});
