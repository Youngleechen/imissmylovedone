document.addEventListener('DOMContentLoaded', async () => {
  const supabase = window.supabaseClient;
  const pasteArea = document.getElementById('pasteArea');
  const previewContainer = document.getElementById('previewContainer');
  const uploadButton = document.getElementById('uploadButton');
  const progressContainer = document.getElementById('progressContainer');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const urlsContainer = document.getElementById('urlsContainer');

  // Track clipboard images
  let clipboardImages = [];

  // Focus the paste area so Ctrl+V works immediately
  pasteArea.addEventListener('click', () => {
    pasteArea.focus();
  });

  // Handle paste event
  document.addEventListener('paste', async (event) => {
    const items = event.clipboardData?.items || [];
    const user = await checkAuth();
    if (!user) return;

    for (let item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (!file) continue;

        // Validate file type and size
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          alert(`Unsupported image type: ${file.type}`);
          continue;
        }
        if (file.size > 50 * 1024 * 1024) {
          alert(`Image exceeds 50MB limit.`);
          continue;
        }

        // Create a blob URL for preview
        const imageUrl = URL.createObjectURL(file);

        // Add to clipboard images array
        clipboardImages.push({ file, imageUrl });

        // Show preview
        showPreview(imageUrl, file.name);

        // Enable upload button
        uploadButton.disabled = false;
      }
    }

    // Prevent default paste behavior
    event.preventDefault();
  });

  // Helper: Show image preview
  function showPreview(url, filename) {
    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item';

    const img = document.createElement('img');
    img.src = url;
    img.alt = filename;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '×';
    removeBtn.className = 'remove-btn';
    removeBtn.onclick = () => {
      removePreview(previewItem, url);
    };

    previewItem.appendChild(img);
    previewItem.appendChild(removeBtn);
    previewContainer.appendChild(previewItem);
  }

  // Helper: Remove preview
  function removePreview(previewItem, url) {
    previewItem.remove();
    clipboardImages = clipboardImages.filter(item => item.imageUrl !== url);
    if (clipboardImages.length === 0) {
      uploadButton.disabled = true;
    }
  }

  // Upload handler
  uploadButton.addEventListener('click', async () => {
    if (clipboardImages.length === 0) return;

    const user = await checkAuth();
    if (!user) return;

    // Show progress container
    progressContainer.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = 'Preparing...';

    try {
      for (const [index, { file, imageUrl }] of clipboardImages.entries()) {
        progressText.textContent = `Uploading ${file.name}...`;

        // Generate unique filename
        const fileExt = file.name.split('.').pop() || 'png';
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

        // Upload to Supabase storage
        const { error: uploadError } = await supabase.storage
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
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('dev-updates-media')
          .getPublicUrl(fileName);

        // Add to URL list
        addUrlToDisplay(publicUrl);

        // Clean up blob URL
        URL.revokeObjectURL(imageUrl);
      }

      // Reset state
      clipboardImages = [];
      previewContainer.innerHTML = '';
      uploadButton.disabled = true;
      progressText.textContent = 'All images uploaded successfully!';
      setTimeout(() => {
        progressContainer.style.display = 'none';
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
      progressContainer.style.display = 'none';
    }
  });

  // Helper: Add URL to display
  function addUrlToDisplay(url) {
    const urlItem = document.createElement('div');
    urlItem.className = 'url-item';

    const urlLink = document.createElement('a');
    urlLink.href = url;
    urlLink.target = '_blank';
    urlLink.rel = 'noopener noreferrer';
    urlLink.textContent = url;
    urlLink.style.color = '#2b6cb0';
    urlLink.style.textDecoration = 'underline';

    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy';
    copyBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(url);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
        }, 2000);
      } catch (err) {
        alert('Failed to copy URL. Please copy manually.');
      }
    };

    urlItem.appendChild(urlLink);
    urlItem.appendChild(copyBtn);
    urlsContainer.appendChild(urlItem);

    // Scroll to bottom
    urlsContainer.scrollTop = urlsContainer.scrollHeight;
  }

  // Auth check
  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      if (confirm('You must be signed in to upload images. Redirect to sign-in?')) {
        window.location.href = '../signin.html'; // Adjust path as needed
      }
      return null;
    }
    return user;
  }

  // Initial auth check
  checkAuth().catch(console.error);
});
