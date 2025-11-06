// Initialize Supabase with your known project credentials
const SUPABASE_URL = 'https://ccetnqdqfrsitooestbh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjZXRucWRxZnJzaXRvb2VzdGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTE4MjksImV4cCI6MjA3Nzg4NzgyOX0.1NjRZZrgsPOg-2z_r2kRELWn9IVXNEQNpSxK6CktJRY';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const textInput = document.getElementById('textInput');
const postButton = document.getElementById('postButton');
const postsContainer = document.getElementById('postsContainer');

// Load user's posts on page load
loadUserPosts();

postButton.addEventListener('click', async () => {
  const body = textInput.value.trim();
  if (!body) {
    alert('Please write something first.');
    return;
  }

  // ✅ Fixed: Correct destructuring
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert('You must be signed in to post.');
    return;
  }

  const { error } = await supabase
    .from('memories')
    .insert({
      user_id: user.id,
      title: 'Untitled', // Safe fallback
      body,
      is_public: true
    });

  if (error) {
    console.error('Post error:', error);
    alert(`Failed to save your thought: ${error.message}`);
    return;
  }

  textInput.value = '';
  loadUserPosts();
});

async function loadUserPosts() {
  // ✅ Fixed: Correct destructuring
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    postsContainer.innerHTML = '<p>Sign in to see your posts.</p>';
    return;
  }

  const { data, error } = await supabase
    .from('memories')
    .select('title, body, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Load error:', error);
    postsContainer.innerHTML = '<p>Could not load your posts.</p>';
    return;
  }

  if (data.length === 0) {
    postsContainer.innerHTML = '<p>You haven’t posted anything yet.</p>';
    return;
  }

  postsContainer.innerHTML = data.map(post => `
    <div class="post-item">
      <h4>${post.title}</h4>
      <p>${post.body.replace(/\n/g, '<br>')}</p>
      <small>${new Date(post.created_at).toLocaleString()}</small>
    </div>
  `).join('');
}
