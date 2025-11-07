// progress-updater-script.js
import { uploadMedia, displayMediaPreview, clearMediaPreview } from '../test/media.js';

// Initialize Supabase client
const supabase = window.supabaseClient;

// DOM elements
const memoryBody = document.getElementById('memory-body');
const postButton = document.getElementById('postButton');
const postsContainer = document.getElementById('postsContainer');

// Current user (you'll need to implement authentication)
let currentUser = null;

// Get current user session
async function getCurrentUser() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return session?.user || null;
}

// Function to create progress update
async function createProgressUpdate() {
  const content = memoryBody.value.trim();
  
  if (!content) {
    alert('Please enter some progress update content');
    return;
  }

  try {
    // Show upload progress if there are media files
    const mediaFiles = Array.from(document.getElementById('mediaInput').files);
    
    // Upload media files if any
    let mediaUrls = [];
    if (mediaFiles.length > 0) {
      document.getElementById('uploadProgress').style.display = 'block';
      mediaUrls = await uploadMedia(mediaFiles, 'progress-updates'); // Use the correct bucket
      document.getElementById('uploadProgress').style.display = 'none';
    }

    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      alert('Please log in to share progress');
      return;
    }

    // Insert progress update into database
    const { data, error } = await supabase
      .from('progress_updates')
      .insert([{
        user_id: user.id,
        content: content,
        media_urls: mediaUrls,
        created_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error creating progress update:', error);
      alert('Error saving progress update: ' + error.message);
      return;
    }

    console.log('Progress update created:', data);

    // Clear the input and media preview
    memoryBody.value = '';
    clearMediaPreview();
    
    // Reload posts to show the new one
    loadProgressUpdates();

  } catch (error) {
    console.error('Error in createProgressUpdate:', error);
    alert('Error sharing progress: ' + error.message);
  }
}

// Function to load progress updates
async function loadProgressUpdates() {
  try {
    const { data, error } = await supabase
      .from('progress_updates')
      .select(`
        *,
        profiles (username, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading progress updates:', error);
      return;
    }

    // Clear existing posts
    postsContainer.innerHTML = '';

    // Render posts
    data.forEach(post => {
      const postElement = createPostElement(post);
      postsContainer.appendChild(postElement);
    });

  } catch (error) {
    console.error('Error loading progress updates:', error);
  }
}

// Function to create post element
function createPostElement(post) {
  const postDiv = document.createElement('div');
  postDiv.className = 'post';

  const user = post.profiles || { username: 'Unknown User', avatar_url: '' };
  const mediaHtml = post.media_urls && post.media_urls.length > 0 
    ? post.media_urls.map(url => {
        const ext = url.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
          return `<img src="${url}" alt="Progress media" style="max-width: 100%; border-radius: 8px; margin-top: 8px;" />`;
        } else if (['mp4', 'webm', 'ogg'].includes(ext)) {
          return `<video controls style="max-width: 100%; border-radius: 8px; margin-top: 8px;"><source src="${url}" type="video/${ext}">Your browser does not support the video tag.</video>`;
        }
        return `<a href="${url}" target="_blank">View Media</a>`;
      }).join('')
    : '';

  postDiv.innerHTML = `
    <div class="post-header">
      <div class="user-info">
        <img src="${user.avatar_url || '/default-avatar.png'}" alt="Avatar" class="avatar" />
        <div class="user-details">
          <strong>${user.username}</strong>
          <small>${new Date(post.created_at).toLocaleString()}</small>
        </div>
      </div>
    </div>
    <div class="post-content">
      <p>${post.content}</p>
      ${mediaHtml}
    </div>
  `;

  return postDiv;
}

// Event listeners
postButton.addEventListener('click', createProgressUpdate);

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
  // Load existing progress updates
  await loadProgressUpdates();
  
  // Set the correct bucket for progress updates
  window.CURRENT_BUCKET_OVERRIDE = 'progress-updates';
});
