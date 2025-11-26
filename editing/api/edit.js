<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EditGPT</title>
  <style>
    :root {
      --primary: #10a37f;
      --secondary: #8a2be2;
      --dark: #1e1f29;
      --light: #f8f9ff;
      --gray: #6c757d;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: var(--dark);
      background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
      min-height: 100vh;
      padding: 20px;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    
    header {
      text-align: center;
      padding: 2rem 0;
    }
    
    h1 {
      font-size: 2.5rem;
      background: linear-gradient(45deg, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }
    
    .subtitle {
      color: var(--gray);
      margin-bottom: 2rem;
    }
    
    .editor-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }
    
    @media (max-width: 768px) {
      .editor-container {
        grid-template-columns: 1fr;
      }
    }
    
    .card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      padding: 1.5rem;
      transition: transform 0.3s ease;
    }
    
    .card:hover {
      transform: translateY(-5px);
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #eee;
    }
    
    textarea {
      width: 100%;
      height: 300px;
      padding: 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-family: inherit;
      font-size: 1rem;
      resize: vertical;
      transition: border-color 0.3s;
    }
    
    textarea:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(16, 163, 127, 0.2);
    }
    
    .instruction-input {
      margin-bottom: 1rem;
    }
    
    .btn {
      background: linear-gradient(45deg, var(--primary), var(--secondary));
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 163, 127, 0.3);
    }
    
    .btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
    
    .result-container {
      margin-top: 2rem;
    }
    
    .status {
      padding: 0.5rem;
      border-radius: 8px;
      margin-top: 0.5rem;
      font-size: 0.9rem;
    }
    
    .status.error {
      background-color: #ffebee;
      color: #b71c1c;
      border: 1px solid #ffcdd2;
    }
    
    .status.success {
      background-color: #e8f5e9;
      color: #2e7d32;
      border: 1px solid #c8e6c9;
    }
    
    footer {
      text-align: center;
      padding: 2rem 0;
      color: var(--gray);
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>EditGPT</h1>
      <p class="subtitle">AI-powered text editing using OpenAI's Edits API</p>
    </header>

    <div class="editor-container">
      <div class="card">
        <div class="card-header">
          <h2>Original Text</h2>
          <div class="word-count" id="input-count">0 words</div>
        </div>
        <textarea id="input-text" placeholder="Paste your text here...">The quick brown fox jump over the lazy dog. It's a classic exempel of a sentence containing all the letters of the alphabet.</textarea>
      </div>

      <div class="card">
        <div class="card-header">
          <h2>Instruction</h2>
          <span>Be specific</span>
        </div>
        <input type="text" id="instruction" class="instruction-input" 
               value="Fix spelling and grammar errors">
        <button id="edit-btn" class="btn">✨ Apply Edit</button>
        <div class="status" id="status" style="display:none;"></div>
      </div>
    </div>

    <div class="card result-container">
      <div class="card-header">
        <h2>Edited Result</h2>
        <button id="copy-btn" class="btn" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
          📋 Copy
        </button>
      </div>
      <div id="result" class="result-text" style="min-height: 200px; padding: 1rem; line-height: 1.6;">
        The result will appear here after editing...
      </div>
    </div>

    <footer>
      <p>Powered by OpenAI • Secured with Vercel Serverless Functions</p>
    </footer>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const inputText = document.getElementById('input-text');
      const instructionInput = document.getElementById('instruction');
      const editBtn = document.getElementById('edit-btn');
      const resultDiv = document.getElementById('result');
      const statusDiv = document.getElementById('status');
      const copyBtn = document.getElementById('copy-btn');
      const inputCount = document.getElementById('input-count');

      // Initialize word count
      updateWordCount();

      // Event listeners
      inputText.addEventListener('input', updateWordCount);
      editBtn.addEventListener('click', handleEdit);
      copyBtn.addEventListener('click', copyResult);

      function updateWordCount() {
        const text = inputText.value.trim();
        const wordCount = text ? text.split(/\s+/).filter(word => word.length > 0).length : 0;
        inputCount.textContent = `${wordCount} word${wordCount !== 1 ? 's' : ''}`;
      }

      async function handleEdit() {
        const input = inputText.value.trim();
        const instruction = instructionInput.value.trim();
        
        if (!input || !instruction) {
          showStatus('Please provide both text and an instruction', 'error');
          return;
        }

        editBtn.disabled = true;
        editBtn.innerHTML = '<span>✨ Editing...</span>';
        statusDiv.style.display = 'none';
        resultDiv.textContent = 'Processing...';

        try {
          const response = await fetch('/api/edit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ input, instruction })
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Edit failed');
          }

          const { editedText } = await response.json();
          resultDiv.textContent = editedText;
          showStatus('Edit successful!', 'success');
        } catch (error) {
          console.error('Edit failed:', error);
          resultDiv.textContent = 'Error occurred during editing. Please try again.';
          showStatus(`Error: ${error.message}`, 'error');
        } finally {
          editBtn.disabled = false;
          editBtn.innerHTML = '✨ Apply Edit';
        }
      }

      function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        statusDiv.style.display = 'block';
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
          setTimeout(() => {
            statusDiv.style.display = 'none';
          }, 5000);
        }
      }

      async function copyResult() {
        try {
          await navigator.clipboard.writeText(resultDiv.textContent);
          copyBtn.innerHTML = '✅ Copied!';
          setTimeout(() => {
            copyBtn.innerHTML = '📋 Copy';
          }, 2000);
        } catch (err) {
          console.error('Copy failed:', err);
          showStatus('Copy failed. Please select text manually.', 'error');
        }
      }
    });
  </script>
</body>
</html>
