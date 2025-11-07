// progress-updater-script.js
document.addEventListener('DOMContentLoaded', async () => {
  const supabase = window.supabaseClient;
  const memoryBody = document.getElementById('memory-body');
  const postButton = document.getElementById('postButton');
  const postsContainer = document.getElementById('postsContainer');

  async function checkAuth() {
    const {  { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = 'signin.html';
      return null;
    }
    return user;
  }

  const autoResize = () => {
    memoryBody.style.height = 'auto';
    const newHeight = Math.min(memoryBody.scrollHeight, 300);
    memoryBody.style.height = newHeight + 'px';
  };
  memoryBody.addEventListener('input', autoResize);
  autoResize();

  // Post handler (NEW - talks to 'progress_updates' table)
  postButton.addEventListener('click', async () => {
    console.log('1. Post button clicked!'); // Debug log
    const user = await checkAuth();
    console.log('2. User:', user); // Debug log
    if (!user) {
      console.log('3. No user, returning'); // Debug log
      return;
    }

    let body = memoryBody.value.trim();
    console.log('4. Body text:', body); // Debug log

    // Append media markdown (managed by media.js)
    for (const media of window.currentMediaFiles) {
      console.log('5. Adding media:', media); // Debug log
      body += `\n\n![${media.name}](${media.url})`;
    }
    console.log('6. Final body with media:', body); // Debug log

    if (!body) {
      console.log('7. No body content, showing alert'); // Debug log
      alert('Please write something or attach media first.');
      return;
    }

    console.log('8. About to insert into progress_updates table'); // Debug log
    console.log('8a. Insert data:', {
      user_id: user.id,
      title: 'Progress Update',
      body: body
    }); // Debug log

    // INSERT INTO progress_updates table
    const { data, error } = await supabase
      .from('progress_updates') // ← NEW TABLE
      .insert({
        user_id: user.id,
        title: 'Progress Update',
        body
      });

    if (error) {
      console.error('9. Insert error:', error); // Debug log
      alert('Failed to post progress: ' + error.message);
      return;
    }

    console.log('10. Insert successful:', data); // Debug log

    // Clear state
    memoryBody.value = '';
    autoResize();
    if (typeof window.clearMediaPreviews === 'function') {
      window.clearMediaPreviews();
    }

    console.log('11. About to reload posts'); // Debug log
    // Reload posts
    loadUserProgress();
    console.log('12. Posts reloaded'); // Debug log
  });

  // Load progress posts (NEW - from 'progress_updates' table)
  async function loadUserProgress() {
    console.log('LoadUserProgress called'); // Debug log
    const user = await checkAuth();
    console.log('LoadUserProgress user:', user); // Debug log
    if (!user) return;

    console.log('About to fetch from progress_updates table'); // Debug log
    const { data, error } = await supabase
      .from('progress_updates') // ← NEW TABLE
      .select('id, body, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Load progress error:', error); // Debug log
      postsContainer.innerHTML = '<p>Could not load your progress updates.</p>';
      return;
    }

    console.log('Fetched data:', data); // Debug log

    if (data.length === 0) {
      postsContainer.innerHTML = '<p>You haven’t shared any progress yet.</p>';
      return;
    }

    // Reuse the same rendering logic from original script (with minor text changes)
    postsContainer.innerHTML = data.map(post => {
      const mediaMatches = [...post.body.matchAll(/!\[([^\]]*)\]\s*\(\s*([^)]+)\s*\)/g)];
      
      if (mediaMatches.length > 0) {
        let mediaGridHtml = '<div class="media-grid" style="position: relative; width: 100%; height: 300px; margin: 10px 0;">';
        
        const firstMedia = mediaMatches[0];
        const firstAlt = firstMedia[1] || 'Progress Media';
        const firstUrl = firstMedia[2].trim();
        const isFirstVideo = firstUrl.includes('.mp4') || firstUrl.includes('.webm') || firstUrl.includes('.mov');
        
        mediaGridHtml += `
          <div class="media-grid-item large" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; cursor: pointer;" onclick="openGallery('${post.id}', '${encodeURIComponent(JSON.stringify(mediaMatches.map(m => m[2])))}', 0)">
            ${isFirstVideo ? 
              `<video muted playsinline style="width: 100%; height: 100%; object-fit: cover;">
                 <source src="${firstUrl}" type="video/mp4">
               </video>` :
              `<img src="${firstUrl}" alt="${firstAlt}" style="width: 100%; height: 100%; object-fit: cover;">`
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
                  `<img src="${secondUrl}" alt="Additional media" style="width: 100%; height: 100%; object-fit: cover;">`
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
              Progress update on ${new Date(post.created_at).toLocaleString()}
            </small>
          </div>
        `;
      } else {
        let processedBody = post.body.replace(/\n/g, '<br>');
        return `
          <div class="post-item" style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="margin: 0; line-height: 1.6;">${processedBody}</p>
            <small style="display: block; color: #718096; font-size: 12px; margin-top: 8px;">
              Progress update on ${new Date(post.created_at).toLocaleString()}
            </small>
          </div>
        `;
      }
    }).join('');
  }

  // Initialize
  console.log('About to check auth and load posts'); // Debug log
  checkAuth().then(user => {
    console.log('Initial auth check result:', user); // Debug log
    if (user) {
      console.log('User authenticated, loading posts'); // Debug log
      loadUserProgress();
    }
  });
});
