// progress-updater-script.js
import { clearMediaPreviews } from './media.js';

document.addEventListener('DOMContentLoaded', async () => {
  const supabase = window.supabaseClient;
  const postButton = document.getElementById('postButton');
  const memoryBody = document.getElementById('memory-body');

  if (postButton) {
    postButton.addEventListener('click', async (e) => {
      e.preventDefault();
      await handlePostProgress(supabase);
    });
  }

  // Load existing progress updates
  await loadProgressUpdates(supabase);

  // Initialize emoji picker
  initializeEmojiPicker();
});

async function handlePostProgress(supabase) {
  const user = await checkAuth();
  if (!user) return;

  const memoryBody = document.getElementById('memory-body');
  const content = memoryBody.value.trim();

  if (!content) {
    alert('Please enter some progress to share.');
    return;
  }

  // Show upload progress if there are media files
  const uploadProgress = document.getElementById('uploadProgress');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  
  if (window.currentMediaFiles && window.currentMediaFiles.length > 0) {
    if (uploadProgress) {
      uploadProgress.style.display = 'block';
      progressFill.style.width = '100%';
      progressText.textContent = 'Saving progress update...';
    }
  }

  try {
    // Get media URLs if any
    const mediaUrls = window.currentMediaFiles ? window.currentMediaFiles.map(file => file.url) : [];

    // Insert progress update into the progress_updates table
    const { data: progressData, error: insertError } = await supabase
      .from('progress_updates')
      .insert([{
        user_id: user.id,
        content: content,
        media_urls: mediaUrls.length > 0 ? mediaUrls : null,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      alert('Failed to save progress update: ' + insertError.message);
      return;
    }

    console.log('Progress update saved:', progressData);

    // Clear the form
    memoryBody.value = '';
    clearMediaPreviews();

    // Hide progress
    if (uploadProgress) {
      uploadProgress.style.display = 'none';
    }

    // Reload progress updates to show the new one
    await loadProgressUpdates(supabase);

  } catch (error) {
    console.error('Error posting progress:', error);
    alert('An error occurred while saving your progress update.');
  }
}

async function loadProgressUpdates(supabase) {
  try {
    const { data: updates, error } = await supabase
      .from('progress_updates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Load error:', error);
      return;
    }

    displayProgressUpdates(updates || []);
  } catch (error) {
    console.error('Error loading progress updates:', error);
  }
}

function displayProgressUpdates(updates) {
  const container = document.getElementById('postsContainer');
  if (!container) return;

  container.innerHTML = '';

  if (updates.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No progress updates yet. Be the first to share!</p>';
    return;
  }

  updates.forEach(update => {
    const updateElement = createProgressUpdateElement(update);
    container.appendChild(updateElement);
  });
}

function createProgressUpdateElement(update) {
  const div = document.createElement('div');
  div.className = 'post-item';
  div.style.cssText = `
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  `;

  let mediaHtml = '';
  if (update.media_urls && update.media_urls.length > 0) {
    mediaHtml = `
      <div class="media-container" style="margin-top: 12px;">
        ${update.media_urls.map((url, index) => {
          const isVideo = url.includes('.mp4') || url.includes('.webm') || url.includes('.mov');
          return `
            <div style="display: inline-block; margin: 5px; position: relative;">
              ${isVideo ? 
                `<video controls style="max-width: 200px; max-height: 200px; border-radius: 8px; object-fit: cover;">
                   <source src="${url}" type="video/mp4">
                 </video>` :
                `<img src="${url}" alt="Progress media" style="max-width: 200px; max-height: 200px; border-radius: 8px; object-fit: cover; cursor: pointer;" onclick="openGallery('${update.id}', '${encodeURIComponent(JSON.stringify(update.media_urls))}', ${index})">`
              }
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  div.innerHTML = `
    <div class="post-header" style="margin-bottom: 8px;">
      <strong style="color: #2d3748;">Your Progress</strong>
      <span style="color: #718096; font-size: 12px; margin-left: 8px;">${new Date(update.created_at).toLocaleString()}</span>
    </div>
    <div class="post-content" style="color: #4a5568; line-height: 1.5; white-space: pre-wrap;">${update.content}</div>
    ${mediaHtml}
  `;

  return div;
}

function initializeEmojiPicker() {
  const emojiButton = document.getElementById('emojiButton');
  const emojiPicker = document.getElementById('emojiPicker');
  const memoryBody = document.getElementById('memory-body');

  if (emojiButton && emojiPicker && memoryBody) {
    const picker = document.createElement('emoji-picker');
    emojiPicker.appendChild(picker);

    emojiButton.addEventListener('click', () => {
      emojiPicker.style.display = emojiPicker.style.display === 'block' ? 'none' : 'block';
    });

    picker.addEventListener('emoji-click', (e) => {
      const { detail: { emoji } } = e;
      memoryBody.value += emoji;
      memoryBody.focus();
    });
  }
}

async function checkAuth() {
  const { data: { user } } = await window.supabaseClient.auth.getUser();
  if (!user) {
    window.location.href = '../signin.html';
    return null;
  }
  return user;
}
