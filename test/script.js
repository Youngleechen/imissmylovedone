const textInput = document.getElementById('textInput');
const emojiButton = document.getElementById('emojiButton');
const emojiPicker = document.getElementById('emojiPicker');

const autoResize = () => {
  textInput.style.height = 'auto';
  textInput.style.height = Math.min(textInput.scrollHeight, 300) + 'px';
};

textInput.addEventListener('input', autoResize);

const toggleEmojiPicker = (e) => {
  e.stopPropagation();
  const isShowing = emojiPicker.classList.contains('show');
  emojiPicker.classList.remove('show');

  if (isShowing) return;

  const wrapper = emojiButton.closest('.input-wrapper');
  const wrapperRect = wrapper.getBoundingClientRect();
  const pickerHeight = 380;
  const spaceBelow = window.innerHeight - wrapperRect.bottom;
  const spaceAbove = wrapperRect.top;

  emojiPicker.style.top = 'auto';
  emojiPicker.style.bottom = 'auto';
  emojiPicker.style.right = '0';

  if (spaceBelow >= pickerHeight) {
    emojiPicker.style.top = (wrapperRect.height + 8) + 'px';
  } else if (spaceAbove >= pickerHeight) {
    emojiPicker.style.bottom = (wrapperRect.height + 8) + 'px';
  } else {
    emojiPicker.style.top = (wrapperRect.height + 8) + 'px';
  }

  setTimeout(() => emojiPicker.classList.add('show'), 10);
};

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

document.addEventListener('click', (e) => {
  if (
    !emojiButton.contains(e.target) &&
    !emojiPicker.contains(e.target) &&
    !textInput.contains(e.target)
  ) {
    emojiPicker.classList.remove('show');
  }
});

autoResize();