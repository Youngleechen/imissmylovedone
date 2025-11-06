// === SUPABASE SETUP ===
const supabaseUrl = 'YOUR_SUPABASE_URL'; // Replace with your project URL
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your anon key
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey); // ✅ Semicolon added

// === DOM ELEMENTS ===
const textInput = document.getElementById('textInput'); // ✅ Semicolon
const postButton = document.getElementById('postButton'); // ✅ Semicolon
const postsContainer = document.getElementById('postsContainer'); // ✅ Semicolon

// === HELPERS ===
const autoResize = () => {
  textInput.style.height = 'auto';
  textInput.style.height = Math.min(textInput.scrollHeight, 300) + 'px';
}; // ✅ Semicolon

const addPostToUI = (content) => {
  const postEl = document.createElement('div');
  postEl.className = 'post-item';
  postEl.textContent = content;
  postsContainer.insertBefore(postEl, postsContainer.firstChild);
}; // ✅ Semicolon

// === POST HANDLER ===
postButton.addEventListener('click', async () => {
  const content = textInput.value.trim();
  if (!content) {
    textInput.focus();
    return;
  }

  const {  { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    alert('Please sign in to share a memory.');
    return;
  }

  // Optimistic UI update
  addPostToUI(content);
  textInput.value = '';
  autoResize();

  // Save to Supabase
  const { error } = await supabase.from('memories').insert({
    user_id: user.id,
    body: content,
    is_public: true
  });

  if (error) {
    // Roll back UI on failure
    postsContainer.removeChild(postsContainer.firstChild);
    console.error('Save failed:', error);
    alert('Could not save your memory. Please try again.');
    textInput.value = content;
    autoResize();
  }
}); // ✅ Semicolon

// === LOAD EXISTING MEMORIES ===
const loadMyMemories = async () => {
  const {  { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from('memories')
    .select('body')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Failed to load memories:', error);
    return;
  }

  postsContainer.innerHTML = '';
  data.forEach(mem => addPostToUI(mem.body));
}; // ✅ Semicolon

// === INIT ===
autoResize(); // ✅ Semicolon
loadMyMemories(); // ✅ Semicolon
