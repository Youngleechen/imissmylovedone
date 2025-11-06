const textInput = document.getElementById('textInput');
const emojiButton = document.getElementById('emojiButton');
const postButton = document.getElementById('postButton');
const emojiPicker = document.getElementById('emojiPicker');

// Auto-resize textarea
const autoResize = () => {
  textInput.style.height = 'auto';
  textInput.style.height = Math.min(textInput.scrollHeight, 300) + 'px';
};

textInput.addEventListener('input', autoResize);

// Toggle emoji picker
const toggleEmojiPicker = (e) => {
  e.stopPropagation();
  const isShowing = emojiPicker.classList.contains('show');
  emojiPicker.classList.remove('show');

  if (isShowing) return;

  // Use the textarea as the anchor (more reliable)
  const textareaRect = textInput.getBoundingClientRect();
  const pickerHeight = 380;
  const spaceBelow = window.innerHeight - textareaRect.bottom;
  const spaceAbove = textareaRect.top;

  // Position relative to viewport
  emojiPicker.style.position = 'fixed';
  emojiPicker.style.left = textareaRect.left + 'px';
  emojiPicker.style.right = 'auto';
  emojiPicker.style.width = Math.min(textareaRect.width, 320) + 'px';

  if (spaceBelow >= pickerHeight) {
    // Show below textarea
    emojiPicker.style.top = textareaRect.bottom + 4 + 'px';
    emojiPicker.style.bottom = 'auto';
  } else if (spaceAbove >= pickerHeight) {
    // Show above textarea
    emojiPicker.style.bottom = spaceBelow + textareaRect.height + 4 + 'px';
    emojiPicker.style.top = 'auto';
  } else {
    // Default: below (even if clipped)
    emojiPicker.style.top = textareaRect.bottom + 4 + 'px';
    emojiPicker.style.bottom = 'auto';
  }

  // Apply visibility after positioning
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

  const newCursorPos = start + emoji.length;
  textInput.setSelectionRange(newCursorPos, newCursorPos);
  textInput.focus();
  emojiPicker.classList.remove('show');
});

// Post button functionality
postButton.addEventListener('click', () => {
  const message = textInput.value.trim();
  if (message) {
    console.log('Posted:', message);
    // TODO: Replace with actual post logic
    textInput.value = '';
    autoResize();
  } else {
    textInput.focus();
  }
});

// Close picker on outside click
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
