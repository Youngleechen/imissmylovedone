document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('thoughtInput');
  const sendButton = document.getElementById('sendButton');

  // Optional: Enable Send button only when there's text
  input.addEventListener('input', () => {
    sendButton.disabled = !input.value.trim();
  });

  sendButton.addEventListener('click', () => {
    const text = input.value.trim();
    if (text) {
      // For now: just log it (you’ll replace this with your posting logic later)
      console.log('Shared:', text);
      alert('Your thought has been shared. 💜'); // temporary feedback
      input.value = '';
      sendButton.disabled = true;
    }
  });

  // Optional: Emoji picker (basic — you can expand later)
  document.getElementById('emojiButton').addEventListener('click', () => {
    // In the future, you could open a real emoji picker
    // For now, just focus the input
    input.focus();
  });
});