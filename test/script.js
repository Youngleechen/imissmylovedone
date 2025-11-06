// DOM elements (emoji-related may be null if commented out in HTML)
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

// Emoji toggle logic (only if emoji elements exist)
const toggleEmojiPicker = (e) => {
  e.stopPropagation();
  if (!emojiPicker) return;

  emojiPicker.classList.remove('show');
  const isNowShowing = emojiPicker.classList.contains('show');
  if (isNowShowing) return;

  if (!emojiButton) return;

  const wrapper = emojiButton.closest('.input-wrapper');
  const wrapperRect = wrapper.getBoundingClientRect();
  const pickerHeight = 380;
  const spaceBelow = window.innerHeight - wrapperRect.bottom;
  const spaceAbove = wrapperRect.top;

  emojiPicker.style.top = 'auto';
  emojiPicker.style.bottom = 'auto';
  emojiPicker.style.left = 'auto';
  emojiPicker.style.right = '0';

  if (spaceBelow >= pickerHeight) {
    emojiPicker.style.top = (wrapper.offsetHeight + 12) + 'px';
  } else if (spaceAbove >= pickerPickerHeight) {
    emojiPicker.style.bottom = (wrapper.offsetHeight + 12) + 'px';
    emojiPicker.style.top = 'auto';
  } else {
    emojiPicker.style.top = (wrapper.offsetHeight + 12) + 'px';
  }

  setTimeout(() => {
    if (emojiPicker) emojiPicker.classList.add('show');
  }, 10);
};

// Conditionally attach emoji events
if (emojiButton && emojiPicker) {
  emojiButton.addEventListener('click', toggleEmojiPicker);

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
}

// Close emoji picker on outside click (if it exists)
document.addEventListener('click', (e) => {
  if (
    textInput.contains(e.target) ||
    postButton.contains(e.target) ||
    (emojiButton && emojiButton.contains(e.target)) ||
    (emojiPicker && emojiPicker.contains(e.target))
  ) {
    return;
  }
  if (emojiPicker) {
    emojiPicker.classList.remove('show');
  }
});

// Post functionality
postButton.addEventListener('click', () => {
  const content = textInput.value.trim();
  if (content) {
    const postEl = document.createElement('div');
    postEl.className = 'post-item';
    postEl.textContent = content;

    // Add new post to the top
    postsContainer.insertBefore(postEl, postsContainer.firstChild);

    // Clear and refocus
    textInput.value = '';
    autoResize();
  }
  textInput.focus();
});

// Initialize
autoResize();
