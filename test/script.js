const textInput = document.getElementById('textInput');
const emojiButton = document.getElementById('emojiButton');
const emojiPicker = document.getElementById('emojiPicker');

// Auto-resize textarea
const autoResize = () => {
  textInput.style.height = 'auto';
  textInput.style.height = Math.min(textInput.scrollHeight, 300) + 'px';
};

textInput.addEventListener('input', autoResize);

// Toggle emoji picker with smart positioning
const toggleEmojiPicker = (e) => {
  e.stopPropagation();
  const isShowing = emojiPicker.classList.contains('show');

  // Always hide first
  emojiPicker.classList.remove('show');

  if (isShowing) return;

  // Position logic: try below first, else above
  const wrapper = emojiButton.closest('.input-wrapper');
  const wrapperRect = wrapper.getBoundingClientRect();
  const pickerHeight = 380; // approx height of emoji picker
  const spaceBelow = window.innerHeight - wrapperRect.bottom;
  const spaceAbove = wrapperRect.top;

  // Reset styles
  emojiPicker.style.top = 'auto';
  emojiPicker.style.bottom = 'auto';
  emojiPicker.style.left = 'auto';
  emojiPicker.style.right = '0';

  if (spaceBelow >= pickerHeight) {
    // Enough space below
    emojiPicker.style.top = (wrapperRect.height + 8) + 'px';
  } else if (spaceAbove >= pickerHeight) {
    // Show above
    emojiPicker.style.bottom = (wrapperRect.height + 8) + 'px';
    emojiPicker.style.top = 'auto';
  } else {
    // Not enough space? Just show below and let viewport scroll
    emojiPicker.style.top = (wrapperRect.height + 8) + 'px';
  }

  // Now show it
  setTimeout(() => emojiPicker.classList.add('show'), 10);
};

emojiButton.addEventListener('click', toggleEmojiPicker);

// Insert emoji at cursor
emojiPicker.addEventListener('emoji-click', (e) => {
  const emoji = e.detail.unicode;
  const start = textInput.selectionStart;
  const end = textInput.selectionEnd;
  const text = textInput.value;

  textInput.value = text.slice(0, start) + emoji + text.slice(end);
  autoResize();

  // Move cursor after emoji
  const newCursorPos = start + emoji.length;
  textInput.setSelectionRange(newCursorPos, newCursorPos);
  textInput.focus();

  emojiPicker.classList.remove('show');
});

// Close on outside click
document.addEventListener('click', (e) => {
  if (
    !emojiButton.contains(e.target) &&
    !emojiPicker.contains(e.target) &&
    !textInput.contains(e.target)
  ) {
    emojiPicker.classList.remove('show');
  }
});

// Initial resize
autoResize();