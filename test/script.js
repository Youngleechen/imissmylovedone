// media.js - All media handling logic: upload, preview, display, and gallery

// Exported functions for script.js to use
export function initializeMediaHandlers(supabase) {
  const mediaButton = document.getElementById('mediaButton');
  const mediaInput = document.getElementById('mediaInput');
  const uploadProgress = document.getElementById('uploadProgress');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const mediaPreviewContainer = document.getElementById('mediaPreviewContainer');

  // Track media files globally so script.js can access them
  window.currentMediaFiles = [];

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

    // Determine bucket based on current page context
    const bucketName = getCurrentBucketName();
    console.log('Using bucket:', bucketName); // Debug line

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

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName) // ← DYNAMIC BUCKET
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
        .from(bucketName) // ← DYNAMIC BUCKET
        .getPublicUrl(fileName);

      // Add to media files array
      window.currentMediaFiles.push({
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
}

// ✅ NEW: Dynamic bucket selection function with override support
function getCurrentBucketName() {
  // Check for override first
  if (window.CURRENT_BUCKET_OVERRIDE) {
    console.log('Using overridden bucket:', window.CURRENT_BUCKET_OVERRIDE);
    return window.CURRENT_BUCKET_OVERRIDE;
  }

  const currentPath = window.location.pathname;
  
  // Map page paths to bucket names
  const bucketMap = {
    '/test/index.html': 'memories',
    '/test/': 'memories', // default for test folder
    '/progress-updater/': 'progress-updates',
    '/development-updater/': 'dev-updates-media',
    '/admin/': 'admin-media',
    // Add more as needed
  };

  // Check for exact matches first
  if (bucketMap[currentPath]) {
    return bucketMap[currentPath];
  }

  // Check for partial path matches
  for (const [path, bucket] of Object.entries(bucketMap)) {
    if (currentPath.includes(path.replace('/', '')) || currentPath.startsWith(path)) {
      return bucket;
    }
  }

  // Default bucket if no match found
  console.log('No matching path found, using default bucket: memories');
  return 'memories'; // or throw error if you prefer
}

// Helper function to show media preview
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
      object-fit: cover; /* Will be adjusted by adjustPreviewImageFit */
      border-radius: 8px;
    `;
    // Apply aspect ratio adjustment
    previewElement.onload = function() {
      adjustPreviewImageFit(previewElement);
    };
  } else if (fileType.startsWith('video')) {
    previewElement = document.createElement('video');
    previewElement.controls = false;
    previewElement.style.cssText = `
      max-width: 100px;
      height: 100px;
      object-fit: cover; /* Will be adjusted by adjustPreviewImageFit */
      border-radius: 8px;
    `;
    // Apply aspect ratio adjustment when metadata is loaded
    previewElement.onloadedmetadata = function() {
      adjustPreviewImageFit(previewElement);
    };
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

// Helper function to remove media preview
function removeMediaPreview(previewItem, url) {
  previewItem.remove();
  window.currentMediaFiles = window.currentMediaFiles.filter(item => item.url !== url);
  if (window.currentMediaFiles.length === 0) {
    mediaPreviewContainer.style.display = 'none';
  }
}

// Helper function to clear all media previews and reset state
export function clearMediaPreviews() {
  const mediaPreviewContainer = document.getElementById('mediaPreviewContainer');
  mediaPreviewContainer.innerHTML = '';
  mediaPreviewContainer.style.display = 'none';
  window.currentMediaFiles = [];
}

// Function to detect image/video aspect ratio and adjust fit for preview
function adjustPreviewImageFit(element) {
  // Clear the event listener to prevent multiple calls
  element.onload = null;
  element.onloadedmetadata = null;

  let width, height;
  if (element.tagName === 'IMG') {
    width = element.naturalWidth;
    height = element.naturalHeight;
  } else if (element.tagName === 'VIDEO') {
    width = element.videoWidth;
    height = element.videoHeight;
  }

  if (width && height) {
    const aspectRatio = width / height;
    if (aspectRatio < 1) { // Portrait (height > width)
      element.style.objectFit = 'contain';
    } else { // Landscape or square
      element.style.objectFit = 'cover';
    }
  }
}

// --- GALLERY FUNCTIONS ---
// These are now part of media.js since they manage media display.

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
        <!-- Red Close Button Added Here -->
        <button id="gallery-close" onclick="closeGallery()" style="position: absolute; top: 20px; right: 20px; background: #e53e3e; border: none; border-radius: 50%; width: 40px; height: 40px; font-size: 20px; cursor: pointer; color: white; z-index: 10001; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">✕</button>
        
        <div id="gallery-swiper" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; flex: 1;">
          ${currentGalleryState.mediaUrls.map((url, index) => {
            const isVideo = url.includes('.mp4') || url.includes('.webm') || url.includes('.mov');
            return `
              <div class="gallery-slide" style="position: absolute; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease;" data-index="${index}">
                ${isVideo ? 
                  `<video controls style="max-width: 90vw; max-height: 80vh; width: auto; height: auto; object-fit: contain;" onload="adjustGalleryImageFit(this)">
                     <source src="${url}" type="video/mp4">
                   </video>` :
                  `<img src="${url}" alt="Gallery item" style="max-width: 90vw; max-height: 80vh; object-fit: contain;" onload="adjustGalleryImageFit(this)">
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
                `<video muted playsinline style="width: 100%; height: 100%; object-fit: cover;" onload="adjustThumbnailFit(this)">
                   <source src="${url}" type="video/mp4">
                 </video>` :
                `<img src="${url}" alt="Thumbnail ${index + 1}" style="width: 100%; height: 100%; object-fit: cover;" onload="adjustThumbnailFit(this)">
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
      closeGallery();
    }
  });

  // Close gallery when pressing ESC
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeGallery();
    }
  };
  document.addEventListener('keydown', handleKeyDown);

  // SIMPLE & ROBUST CLOSE FUNCTION
  window.closeGallery = function(event) {
    if (event) {
      event.stopPropagation();
    }
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
  if (!currentGalleryState || index < 0 || index >= currentGalleryState.mediaUrls.length) return;
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

// Function to detect image/video aspect ratio and adjust fit for gallery images
function adjustGalleryImageFit(img) {
  // Clear the event listener to prevent multiple calls
  img.onload = null;
  img.onloadedmetadata = null;

  let width, height;
  if (img.tagName === 'IMG') {
    width = img.naturalWidth;
    height = img.naturalHeight;
  } else if (img.tagName === 'VIDEO') {
    width = img.videoWidth;
    height = img.videoHeight;
  }

  if (width && height) {
    const aspectRatio = width / height;
    if (aspectRatio < 1) { // Portrait (height > width)
      img.style.objectFit = 'contain';
    } else { // Landscape or square
      img.style.objectFit = 'cover';
    }
  }
}

// Function to detect aspect ratio for thumbnail images
function adjustThumbnailFit(img) {
  // Clear the event listener to prevent multiple calls
  img.onload = null;
  img.onloadedmetadata = null;

  let width, height;
  if (img.tagName === 'IMG') {
    width = img.naturalWidth;
    height = img.naturalHeight;
  } else if (img.tagName === 'VIDEO') {
    width = img.videoWidth;
    height = img.videoHeight;
  }

  if (width && height) {
    const aspectRatio = width / height;
    if (aspectRatio < 1) { // Portrait (height > width)
      img.style.objectFit = 'contain';
    } else { // Landscape or square
      img.style.objectFit = 'cover';
    }
  }
}

// Auth helper (moved here to avoid duplication)
async function checkAuth() {
  const {  { user } } = await window.supabaseClient.auth.getUser(); // ✅ CORRECTED
  if (!user) {
    window.location.href = 'signin.html';
    return null;
  }
  return user;
}

// Initialize when this module loads
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize media handlers using the global client
  initializeMediaHandlers(window.supabaseClient);
});

// Export aspect ratio functions for use in other modules
export function adjustImageFit(img) {
  // Clear the event listener to prevent multiple calls
  img.onload = null;
  img.onloadedmetadata = null;

  let width, height;
  if (img.tagName === 'IMG') {
    width = img.naturalWidth;
    height = img.naturalHeight;
  } else if (img.tagName === 'VIDEO') {
    width = img.videoWidth;
    height = img.videoHeight;
  }

  if (width && height) {
    const aspectRatio = width / height;
    if (aspectRatio < 1) { // Portrait (height > width)
      img.style.objectFit = 'contain';
    } else { // Landscape or square
      img.style.objectFit = 'cover';
    }
  }
}

export function adjustThumbnailFit(img) {
  // Clear the event listener to prevent multiple calls
  img.onload = null;
  img.onloadedmetadata = null;

  let width, height;
  if (img.tagName === 'IMG') {
    width = img.naturalWidth;
    height = img.naturalHeight;
  } else if (img.tagName === 'VIDEO') {
    width = img.videoWidth;
    height = img.videoHeight;
  }

  if (width && height) {
    const aspectRatio = width / height;
    if (aspectRatio < 1) { // Portrait (height > width)
      img.style.objectFit = 'contain';
    } else { // Landscape or square
      img.style.objectFit = 'cover';
    }
  }
}
