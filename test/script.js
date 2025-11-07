// --- REMOVED GLOBAL DECLARATION ---
// window.galleryCurrentIndex = 0; // This is now handled within the gallery state object

// --- NEW GLOBAL VARIABLE ---
// Object to hold the current gallery state (media URLs, current index)
let currentGalleryState = null;

// --- FIXED GALLERY FUNCTIONS ---
/**
 * Opens the gallery overlay.
 * @param {string} postId - The ID of the post (not used directly here, but passed from the HTML).
 * @param {string} encodedMediaUrlsJson - The JSON string containing media URLs, URL-encoded.
 * @param {number} [startIndex=0] - The index of the media item to start viewing (default is 0).
 */
window.openGallery = function(postId, encodedMediaUrlsJson, startIndex = 0) {
  // Parse the media URLs once when the gallery opens
  const mediaUrls = JSON.parse(decodeURIComponent(encodedMediaUrlsJson));

  // Store the state for easy access by other functions
  currentGalleryState = {
    mediaUrls: mediaUrls,
    currentIndex: startIndex // Use the provided startIndex (default to 0)
  };

  // Create gallery HTML with swiping capability and thumbnails
  const galleryHtml = `
    <div id="gallery-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; flex-direction: column;">
      <div class="gallery-container" style="position: relative; max-width: 90vw; max-height: 85vh; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;">
        <button onclick="closeGallery()" style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.2); border: none; border-radius: 50%; width: 40px; height: 40px; font-size: 24px; cursor: pointer; color: white; z-index: 10000;">×</button>

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
  
  // Initialize gallery display based on the starting index
  showGallerySlide(currentGalleryState.currentIndex);
  
  // Add swipe/touch support
  const swiper = document.getElementById('gallery-swiper');
  let startX = 0; // Local variable within the openGallery scope
  let startY = 0; // For potential vertical swipe rejection
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
  // Listen for mouseup on the window to capture release even if outside swiper
  window.addEventListener('mouseup', handleMouseUp);

  // Optional: Remove listeners when gallery closes
  const cleanupListeners = () => {
    swiper.removeEventListener('touchstart', handleTouchStart);
    swiper.removeEventListener('touchend', handleTouchEnd);
    swiper.removeEventListener('mousedown', handleMouseDown);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  // Add cleanup to closeGallery
  const originalCloseGallery = window.closeGallery;
  window.closeGallery = function() {
    cleanupListeners();
    if (originalCloseGallery) originalCloseGallery();
    const overlay = document.getElementById('gallery-overlay');
    if (overlay) overlay.remove();
    // Reset the state when closed
    currentGalleryState = null;
  };
};

/**
 * Handles the swipe logic based on start and end coordinates.
 * @param {number} startX - Starting X coordinate.
 * @param {number} startY - Starting Y coordinate.
 * @param {number} endX - Ending X coordinate.
 * @param {number} endY - Ending Y coordinate.
 */
function handleSwipe(startX, startY, endX, endY) {
  const threshold = 50; // Minimum distance to consider a swipe
  const verticalThreshold = 30; // Threshold to ignore vertical movement

  const diffX = startX - endX;
  const diffY = startY - endY;

  // Check if the horizontal movement is significant enough and vertical movement is low enough
  if (Math.abs(diffX) > threshold && Math.abs(diffY) < verticalThreshold) {
    if (diffX > 0) {
      galleryNext(); // Swipe left - go to next image
    } else {
      galleryPrev(); // Swipe right - go to previous image
    }
  }
}

/**
 * Displays the slide at the given index.
 * @param {number} index - The index of the slide to show.
 */
function showGallerySlide(index) {
  if (!currentGalleryState || index < 0 || index >= currentGalleryState.mediaUrls.length) return;

  const slides = document.querySelectorAll('.gallery-slide');
  slides.forEach((slide, i) => {
    slide.style.opacity = i === index ? '1' : '0';
  });
  
  // Update the counter display
  const counterElement = document.getElementById('current-index');
  if (counterElement) {
    counterElement.textContent = index + 1;
  }

  // Update the state's current index
  currentGalleryState.currentIndex = index;

  // Update thumbnail borders
  updateThumbnailBorders();
}

/**
 * Updates the border of thumbnail items to reflect the current image
 */
function updateThumbnailBorders() {
  const thumbnailItems = document.querySelectorAll('.thumbnail-item');
  thumbnailItems.forEach((item, index) => {
    item.style.border = index === currentGalleryState.currentIndex ? '3px solid white' : '3px solid transparent';
  });
}

/**
 * Navigates to the specified image index
 * @param {number} index - The index of the image to navigate to
 */
window.galleryGoToIndex = function(index) {
  if (!currentGalleryState || index < 0 || index >= currentGalleryState.mediaUrls.length) return;
  showGallerySlide(index);
};

/**
 * Navigates to the next image in the gallery.
 */
window.galleryNext = function() {
  if (!currentGalleryState) return;
  const newIndex = (currentGalleryState.currentIndex + 1) % currentGalleryState.mediaUrls.length;
  showGallerySlide(newIndex);
};

/**
 * Navigates to the previous image in the gallery.
 */
window.galleryPrev = function() {
  if (!currentGalleryState) return;
  const newIndex = (currentGalleryState.currentIndex - 1 + currentGalleryState.mediaUrls.length) % currentGalleryState.mediaUrls.length;
  showGallerySlide(newIndex);
};

/**
 * Closes the gallery overlay and cleans up event listeners.
 */
window.closeGallery = function() {
  // Cleanup logic is now handled in openGallery
  // This function can still exist as a placeholder if called elsewhere
  const overlay = document.getElementById('gallery-overlay');
  if (overlay) overlay.remove();
  currentGalleryState = null; // Clear the state
};
