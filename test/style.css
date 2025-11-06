* {
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 2rem;
  background: #f8f9fa;
  margin: 0;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  min-height: 100vh;
}

.input-wrapper {
  position: relative;
  width: 100%;
  max-width: 600px;
}

#textInput {
  width: 100%;
  min-height: 100px;
  padding: 16px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 12px;
  resize: none;
  outline: none;
  transition: border-color 0.2s;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  color: #333;
}

#textInput::placeholder {
  color: #999;
  font-style: italic;
}

#textInput:focus {
  border-color: #4a6cf7;
  box-shadow: 0 2px 8px rgba(74, 108, 247, 0.2);
}

#emojiButton {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: transparent;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  color: #888;
  padding: 4px;
  border-radius: 6px;
}

#emojiButton:hover {
  color: #4a6cf7;
  background: #f0f4ff;
}

#emojiPicker {
  position: absolute;
  right: 0;
  z-index: 1000;
  box-shadow: 0 6px 16px rgba(0,0,0,0.15);
  border-radius: 12px;
  overflow: hidden;
  transform: translateY(8px);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.2s, transform 0.2s, visibility 0.2s;
  /* Ensure it's hidden on load */
  display: none;
}

#emojiPicker.show {
  display: block;
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translateY(0);
}

@media (max-width: 640px) {
  .input-wrapper {
    width: 95vw;
  }
}