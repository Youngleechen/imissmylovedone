// === SUPABASE SETUP ===
const supabaseUrl = 'https://imissmylovedone.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaXNzbXlsb3ZlZG9uZSIsImtleSI6ImRhdGEtYW5vbiIsImV4cCI6MTczMjQxOTQwMH0.Nk8L2oE8pD7HqyW4fCnKd6r7TgPjJ7eZsO1m5J5dK4c';
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

  // ✅ CORRECT DESTRUCTURING: data contains the user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
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
