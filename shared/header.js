// shared/header.js

function injectHeader() {
  // Create header HTML
  const headerHTML = `
    <div class="header">
      <div class="logo">
        <i class="fas fa-heart-circle"></i> Healing
      </div>
      <div class="user-menu">
        <button class="action-btn" id="messageButton" style="background: none; border: none; padding: 8px; cursor: pointer;">
          <i class="fas fa-envelope"></i>
        </button>
        <button class="action-btn" id="callButton" style="background: none; border: none; padding: 8px; cursor: pointer;">
          <i class="fas fa-phone"></i>
        </button>
        <div class="user-avatar" id="userAvatar">U</div>
        <button id="loginButton" class="login-btn">Login</button>
      </div>
    </div>
  `;

  // Insert header at the top of the body
  document.body.insertAdjacentHTML('afterbegin', headerHTML);

  // Add CSS styles
  const style = document.createElement('style');
  style.textContent = `
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .logo {
      font-size: 1.2rem;
      font-weight: 700;
      color: #5a67d8;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .user-menu {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .user-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(45deg, #5a67d8, #9f7aea);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 1.1rem;
      cursor: pointer;
    }
    .login-btn {
      background-color: #4f46e5;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      margin-left: 12px;
    }
    .action-btn {
      background: none;
      border: none;
      padding: 8px;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  // Load Font Awesome for icons
  const faLink = document.createElement('link');
  faLink.rel = 'stylesheet';
  faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
  document.head.appendChild(faLink);

  // Add login button functionality
  document.getElementById('loginButton')?.addEventListener('click', function() {
    window.location.href = '/login/';
  });

  // Add message button functionality (optional placeholder)
  document.getElementById('messageButton')?.addEventListener('click', function() {
    alert('Message inbox would open here');
  });

  // Add call button functionality (optional placeholder)
  document.getElementById('callButton')?.addEventListener('click', function() {
    alert('Call system would open here');
  });
}

// Run when DOM is loaded
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', injectHeader);
}
