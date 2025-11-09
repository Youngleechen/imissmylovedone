document.addEventListener('DOMContentLoaded', async () => {
  const supabase = window.supabaseClient;
  const updateBody = document.getElementById('update-body');
  const mediaButton = document.getElementById('mediaButton');
  const mediaInput = document.getElementById('mediaInput');
  const postButton = document.getElementById('postButton');
  const uploadProgress = document.getElementById('uploadProgress');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const mediaPreviewContainer = document.getElementById('mediaPreviewContainer');

  // Track media files for this session
  let currentMediaFiles = [];

  // ✅ Add console log to verify script loaded
  console.log('✅ Clipboard uploader script loaded.');

  async function checkAuth() {
    console.log('🔍 Checking auth...');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ No user signed in.');
      alert('You must be signed in to upload. Redirecting to sign-in...');
      window.location.href = '../signin.html';
      return null;
    }
    console.log('✅ Authenticated as:', user.id);
    return user;
  }

  // Media upload handler (for button click)
  mediaButton.addEventListener('click', async () => {
    console.log('📎 Media button clicked.');
    const user = await checkAuth();
    if (!user) return;
    mediaInput.click();
  });

  mediaInput.addEventListener('change', async (e) => {
    console.log('📁 File input changed. Files:', e.target.files);
    const user = await checkAuth();
    if (!user) return;

    const files = Array.from(e.target.files);
    if (!files.length) {
      console.log('❌ No files selected.');
      return;
    }

    await processFiles(files, user);
    mediaInput.value = '';
  });

  // ✅ NEW: Listen for paste on the entire document
  document.addEventListener('paste', async (e) => {
    console.log('📋 PASTE EVENT FIRED!');

    // Only proceed if textarea is focused
    if (document.activeElement !== updateBody) {
      console.log('❌ Paste ignored: active element is not the textarea.');
      return;
    }

    console.log('✅ Textarea is focused. Processing paste...');

    const user = await checkAuth();
    if (!user) return;

    const items = e.clipboardData?.items || [];
    console.log('📋 Clipboard items:', items);

    const imageFiles = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`📄 Item ${i}: type=${item.type}, kind=${item.kind}`);

      if (item.type.startsWith('image/')) {
        console.log(`🖼️ Found image item: ${item.type}`);
        const file = item.getAsFile();
        if (file) {
          console.log(`✅ Got file: ${file.name}, size=${file.size} bytes`);
          imageFiles.push(file);
        } else {
          console.log('⚠️ Could not get file from clipboard item.');
        }
      }
    }

    if (imageFiles.length > 0) {
      console.log(`✅ Detected ${imageFiles.length} image(s) to upload.`);
      await processFiles(imageFiles, user);
      e.preventDefault(); // Prevent default paste behavior
    } else {
      console.log('❌ No images found in clipboard.');
    }
  });

  // Centralized file processing function
  async function processFiles(files, user) {
    console.log('📦 Starting to process files...');

    // Validate all files first
    for (const currentFile of files) {
      console.log(`🔎 Validating file: ${currentFile.name}, type=${currentFile.type}, size=${currentFile.size}`);

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
      if (!allowedTypes.includes(currentFile.type)) {
        console.error(`❌ Unsupported type: ${currentFile.type}`);
        alert(`File ${currentFile.name} is not an allowed type.`);
        return;
      }
      if (currentFile.size > 50 * 1024 * 1024) {
        console.error(`❌ File too large: ${currentFile.size} bytes`);
        alert(`File ${currentFile.name} exceeds 50MB limit.`);
        return;
      }
      console.log(`✅ File ${currentFile.name} passed validation.`);
    }

    // Process each file
    for (const currentFile of files) {
      console.log(`📤 Uploading file: ${currentFile.name}`);

      const fileExt = currentFile.name.split('.').pop() || 'png';
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

      // Show upload progress
      if (uploadProgress && progressFill && progressText) {
        uploadProgress.style.display = 'block';
        progressFill.style.width = '0%';
        progressText.textContent = `Uploading ${currentFile.name}...`;
      }

      // Upload to dev-updates-media bucket
      console.log(`🌐 Uploading to Supabase: ${fileName}`);
      const { error: uploadError } = await supabase.storage
        .from('dev-updates-media')
        .upload(fileName, currentFile, {
          upsert: false,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`📊 Upload progress: ${percentCompleted}% for ${currentFile.name}`);
            if (progressFill) {
              progressFill.style.width = percentCompleted + '%';
            }
            if (progressText) {
              progressText.textContent = `Uploading ${currentFile.name}... ${percentCompleted}%`;
            }
          }
        });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
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

      console.log(`✅ Upload successful. Public URL: ${publicUrl}`);

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
    console.log('✅ All files processed.');
  }

  // Helper: Show media preview
  function showMediaPreview(url, filename, fileType) {
    console.log(`🖼️ Showing preview for: ${filename} (${url})`);

    const previewItem = document.createElement('div');
    previewItem.className = 'media-preview-item';

    let previewElement;
    if (fileType.startsWith('image')) {
      previewElement = document.createElement('img');
      previewElement.src = url;
      previewElement.alt = filename;
    } else if (fileType.startsWith('video')) {
      previewElement = document.createElement('video');
      previewElement.controls = false;
      const source = document.createElement('source');
      source.src = url;
      source.type = fileType;
      previewElement.appendChild(source);
    }

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '×';
    removeBtn.className = 'remove-btn';
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      removeMediaPreview(previewItem, url);
    };

    previewItem.appendChild(previewElement);
    previewItem.appendChild(removeBtn);
    mediaPreviewContainer.appendChild(previewItem);
    mediaPreviewContainer.style.display = 'block';
  }

  // Helper: Remove media preview
  function removeMediaPreview(previewItem, url) {
    console.log(`🗑️ Removing preview for URL: ${url}`);
    previewItem.remove();
    currentMediaFiles = currentMediaFiles.filter(item => item.url !== url);
    if (currentMediaFiles.length === 0) {
      mediaPreviewContainer.style.display = 'none';
    }
  }

  // Post handler (for testing only)
  postButton.addEventListener('click', async () => {
    console.log('📨 Post button clicked.');
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

    console.log('📝 Posting body:', body);

    const { error } = await supabase
      .from('development_updates')
      .insert({
        author_id: user.id,
        title: 'Test Update',
        body,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('❌ Failed to post:', error);
      alert('Failed to post: ' + error.message);
      return;
    }

    console.log('✅ Post successful!');
    alert('Post successful! Check your Supabase table.');

    // Clear state
    updateBody.value = '';
    currentMediaFiles = [];
    mediaPreviewContainer.innerHTML = '';
    mediaPreviewContainer.style.display = 'none';
  });

  // Initial auth check
  checkAuth().catch(console.error);
});
