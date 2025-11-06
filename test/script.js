const textInput = document.getElementById('textInput');
const emojiButton = document.getElementById('emojiButton');
const postButton = document.getElementById('postButton');
const emojiPicker = document.getElementById('emojiPicker');
const postsContainer = document.getElementById('postsContainer');

// Auto-resize textarea
const autoResize = () => {
  textInput.style.height = 'auto';
  textInput.style.height = Math.min(textInput.scrollHeight, 300) + 'px';
};

textInput.addEventListener('input', autoResize);

// Toggle emoji picker
const toggleEmojiPicker = (e) => {
  e.stopPropagation();
  emojiPicker.classList.remove('show');
  if (emojiPicker.classList.contains('show')) return;

  const wrapper = emojiButton.closest('.input-wrapper');
  const wrapperRect = wrapper.getBoundingClientRect();
  const pickerHeight = 380;
  const spaceBelow = window.innerHeight - wrapperRect.bottom;
  const spaceAbove = wrapperRect.top;

  emojiPicker.style.top = 'auto';
  emojiPicker.style.bottom = 'auto';
  emojiPicker.style.right = '0';

  if (spaceBelow >= pickerHeight) {
    emojiPicker.style.top = (wrapper.offsetHeight + 12) + 'px';
  } else if (spaceAbove >= pickerHeight) {
    emojiPicker.style.bottom = (wrapper.offsetHeight + 12) + 'px';
    emojiPicker.style.top = 'auto';
  } else {
    emojiPicker.style.top = (wrapper.offsetHeight + 12) + 'px';
  }

  setTimeout(() => emojiPicker.classList.add('show'), 10);
};

emojiButton.addEventListener('click', toggleEmojiPicker);

// Insert emoji
emojiPicker.addEventListener('emoji-click', (e) => {
  const emoji = e.detail.unicode;
  const start = textInput.selectionStart;
  const end = textInput.selectionEnd;
  const text = textInput.value;

  textInput.value = text.slice(0, start) + emoji + text.slice(end);
  autoResize();

  const newCursorPos = start + emoji.length;
  textInput.setSelectionRange(newCursorPos, newCursorPos);
  textInput.focus();

  emojiPicker.classList.remove('show');
});

// Close picker on outside click
document.addEventListener('click', (e) => {
  if (
    !emojiButton.contains(e.target) &&
    !emojiPicker.contains(e.target) &&
    !textInput.contains(e.target) &&
    !postButton.contains(e.target)
  ) {
    emojiPicker.classList.remove('show');
  }
});

// Handle posting
postButton.addEventListener('click', () => {
  const content = textInput.value.trim();
  if (content) {
    // Create post element
    const postEl = document.createElement('div');
    postEl.className = 'post-item';
    postEl.textContent = content;

    // Add to top of posts (newest first)
    postsContainer.insertBefore(postEl, postsContainer.firstChild);

    // Clear input
    textInput.value = '';
    autoResize();
  }
  textInput.focus();
});

autoResize();
