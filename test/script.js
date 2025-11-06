// === SUPABASE SETUP ===
// 🔑 Replace these with your actual Supabase project URL and anon key
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

// === DOM ELEMENTS ===
const textInput = document.getElementById('textInput');
const postButton = document.getElementById('postButton');
const postsContainer = document.getElementById('postsContainer');

// === HELPERS ===
const autoResize = () => {
  textInput.style.height = 'auto';
  textInput.style.height = Math.min(textInput.scrollHeight, 300) + 'px';
};

const addPostToUI = (content) => {
  const postEl = document.createElement('div');
  postEl.className = 'post-item';
  postEl.textContent = content;
  postsContainer.insertBefore(postEl, postsContainer.firstChild);
};

// === POST HANDLER ===
postButton.addEventListener('click', async () => {
  const content = textInput.value.trim();
  if (!content) {
    textInput.focus();
    return;
  }

  // ✅ Correct destructuring: { data: { user }, error }
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    alert('Please sign in to share a memory.');
    return;
  }

  // Optimistic UI update
  addPostToUI(content);
  textInput.value = '';
  autoResize();

  // Save to Supabase memories table
  const { error } = await supabase.from('memories').insert({
    user_id: user.id,
    body: content,
    is_public: true
  });

  if (error) {
    // Roll back UI on failure
    postsContainer.removeChild(postsContainer.firstChild);
    console.error('Failed to save memory:', error);
    alert('Could not save your memory. Please try again.');
    textInput.value = content;
    autoResize();
  }
});

// === LOAD EXISTING MEMORIES ===
const loadMyMemories = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from('memories')
    .select('body')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Could not load memories:', error);
    return;
  }

  postsContainer.innerHTML = '';
  data.forEach((mem) => addPostToUI(mem.body));
};

// === INIT ===
autoResize();
loadMyMemories();
