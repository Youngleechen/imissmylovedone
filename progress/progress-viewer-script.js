// progress-viewer-script.js - Read-only display of progress updates

document.addEventListener('DOMContentLoaded', async () => {
  const supabase = window.supabaseClient;
  const updatesContainer = document.getElementById('updatesContainer');

  async function checkAuth() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '../signin.html'; // Adjust path as needed
        return null;
      }
      return user;
    } catch (error) {
      console.error('Auth check failed:', error);
      window.location.href = '../signin.html';
      return null;
    }
  }

  // Load updates
  async function loadUpdates() {
    const user = await checkAuth();
    if (!user) return;

    const { data, error } = await supabase
      .from('development_updates') // ✅ Your table
      .select(`
        id, 
        body, 
        created_at,
        users(username)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Load error:', error);
      updatesContainer.innerHTML = '<p>Could not load updates.</p>';
      return;
    }

    if (data.length === 0) {
      updatesContainer.innerHTML = '<p>No progress updates have been posted yet.</p>';
      return;
    }

    updatesContainer.innerHTML = data.map(post => {
      // Extract media URLs from post body
      const mediaMatches = [...post.body.matchAll(/!\[([^\]]*)\]\s*\(\s*([^)]+)\s*\)/g)];
      
      if (mediaMatches.length > 0) {
        let mediaGridHtml = '<div class="media-grid" style="position: relative; width: 100%; height: 300px; margin: 10px 0;">';
        
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
              `<img src="${firstUrl}" alt="${firstAlt}" style="width: 100%; height: 100%; object-fit: cover;">
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

        // Remove media markdown from text body
        let textOnlyBody = post.body.replace(/!\[([^\]]*)\]\s*\(\s*([^)]+)\s*\)/g, '');
        textOnlyBody = textOnlyBody.replace(/\n/g, '<br>');
        
        return `
          <div class="post-item" style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="font-weight: bold; color: #2d3748; margin-bottom: 8px; font-size: 14px;">
              By: ${post.users?.username || 'Unknown User'}
            </div>
            <p style="margin: 0; line-height: 1.6;">${textOnlyBody}</p>
            ${mediaGridHtml}
            <small style="display: block; color: #718096; font-size: 12px; margin-top: 8px;">
              ${new Date(post.created_at).toLocaleString()}
            </small>
          </div>
        `;
      } else {
        // Handle posts without media
        let processedBody = post.body.replace(/\n/g, '<br>');
        return `
          <div class="post-item" style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="font-weight: bold; color: #2d3748; margin-bottom: 8px; font-size: 14px;">
              By: ${post.users?.username || 'Unknown User'}
            </div>
            <p style="margin: 0; line-height: 1.6;">${processedBody}</p>
            <small style="display: block; color: #718096; font-size: 12px; margin-top: 8px;">
              ${new Date(post.created_at).toLocaleString()}
            </small>
          </div>
        `;
      }
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
          <button onclick="closeGallery()" style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.8); border: none; border-radius: 50%; width: 40px; height: 40px; font-size: 24px; cursor: pointer; color: #333; z-index: 10000; box-shadow: 0 2px 4px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; transition: background 0.2s ease;" onmouseover="this.style.background='rgba(255,255,255,1)';" onmouseout="this.style.background='rgba(255,255,255,0.8)';">×</button>

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

    // Simple & robust close function
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

  window.closeGallery = function() {
    const overlay = document.getElementById('gallery-overlay');
    if (overlay) overlay.remove();
    currentGalleryState = null;
  };
});
