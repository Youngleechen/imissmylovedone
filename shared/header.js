// shared/header.js

function injectHeader() {
  // 1. Create the header HTML element
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

    <!-- Call Request Modal -->
    <div id="callRequestModal" class="call-request-modal">
      <div class="call-request-content">
        <div class="call-request-title">Connect for Support</div>
        <div class="call-request-desc">Choose how you'd like to connect with someone who understands your journey.</div>
        <div class="call-request-buttons">
          <button id="oneToOneCall" class="call-request-btn call-btn-primary">
            <i class="fas fa-user"></i> One-on-One Call
          </button>
          <button id="groupCall" class="call-request-btn call-btn-primary">
            <i class="fas fa-users"></i> Group Support (3–5 people)
          </button>
          <button id="cancelCall" class="call-request-btn call-btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Realistic Call Simulation Modal -->
    <div id="callSimulationModal" class="call-simulation-modal">
      <div class="call-simulation-content">
        <div class="call-header">
          <div class="call-avatar">M</div>
          <div class="call-info">
            <div class="call-name">Mary</div>
            <div class="call-status">Calling now…</div>
          </div>
        </div>
        <div class="call-simulation-text">
          <div class="call-message call-received">
            <span class="message-text">…I didn’t know how to breathe after he was gone.</span>
            <span class="message-time">00:03</span>
          </div>
          <div class="call-message call-sent">
            <span class="message-text">I know.</span>
            <span class="message-time">00:05</span>
          </div>
          <div class="call-message call-received">
            <span class="message-text">People say ‘time heals.’ But it doesn’t. It just… changes the shape of the pain.</span>
            <span class="message-time">00:12</span>
          </div>
          <div class="call-message call-sent">
            <span class="message-text">Yeah. I still talk to him. Every morning. Before I get out of bed.</span>
            <span class="message-time">00:17</span>
          </div>
          <div class="call-message call-received">
            <span class="message-text">…I used to think that meant I was losing my mind.</span>
            <span class="message-time">00:22</span>
          </div>
          <div class="call-message call-sent">
            <span class="message-text">You’re not. You’re just still in love with him.</span>
            <span class="message-time">00:26</span>
          </div>
          <div class="call-message call-received">
            <span class="message-text">…I cried for the first time last week. Not because I was sad. Because I remembered how he laughed.</span>
            <span class="message-time">00:33</span>
          </div>
          <div class="call-message call-sent">
            <span class="message-text">That’s not weakness. That’s courage.</span>
            <span class="message-time">00:37</span>
          </div>
        </div>
        <div class="call-actions">
          <button id="endCall" class="call-btn-end">End Call</button>
        </div>
      </div>
    </div>

    <!-- Listener Banner -->
    <div id="listenerBanner" class="call-listener-banner">
      <div class="banner-content">
        <div class="banner-person">Mary, United States</div>
        <div class="banner-location">📍 New York, NY</div>
        <div class="banner-loss">Lost her son, 18, to suicide — 3 days ago</div>
        <div class="banner-time">Requested support 2 minutes ago</div>
        <div class="banner-buttons">
          <button id="acceptCall" class="banner-btn accept-btn">Accept Call</button>
          <button id="declineCall" class="banner-btn decline-btn">Not Now</button>
        </div>
      </div>
    </div>

    <!-- Message Inbox Preview -->
    <div id="messageInbox" class="message-inbox">
      <h2>Your Messages</h2>
      <div class="message-item message-received">
        <div class="message-sender">David (Canada)</div>
        <div class="message-content">I saw your post about your daughter. I lost mine to cancer last year. I didn’t think I’d ever feel anything but numb. But today, I smiled at a song she loved. It didn’t hurt as much. Just… different. I’m here if you want to talk.</div>
        <div class="message-time">1 hour ago</div>
      </div>
      <div class="message-item message-sent">
        <div class="message-sender">You</div>
        <div class="message-content">Thank you, David. That meant more than I can say. I’ve been holding my breath for months. Just reading that… I felt like I could exhale.</div>
        <div class="message-time">45 minutes ago</div>
      </div>
      <div class="message-item message-received">
        <div class="message-sender">Lena (Australia)</div>
        <div class="message-content">I lost my husband to suicide. I didn’t tell anyone for 8 months. I thought I was broken. But now I know — I was just grieving. You’re not alone.</div>
        <div class="message-time">2 hours ago</div>
      </div>
    </div>
  `;

  // 2. Insert the header and its related elements at the beginning of the body
  document.body.insertAdjacentHTML('afterbegin', headerHTML);

  // 3. Add specific CSS styles for the header and its related elements
  const headerStyle = document.createElement('style');
  headerStyle.textContent = `
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

    /* --- MODAL STYLES --- */
    .call-request-modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 1000;
      align-items: center;
      justify-content: center;
    }

    .call-request-content {
      background: white;
      padding: 20px;
      border-radius: 12px;
      width: 90%;
      max-width: 400px;
      text-align: center;
    }

    .call-request-title {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 15px;
      color: #1f2937;
    }

    .call-request-desc {
      color: #718096;
      margin-bottom: 20px;
      line-height: 1.5;
    }

    .call-request-buttons {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .call-request-btn {
      padding: 12px;
      border-radius: 8px;
      border: none;
      font-size: 1rem;
      cursor: pointer;
      font-weight: 600;
    }

    .call-btn-primary {
      background-color: #4f46e5;
      color: white;
    }

    .call-btn-secondary {
      background-color: #e5e7eb;
      color: #374151;
    }

    /* --- BANNER STYLES --- */
    .call-listener-banner {
      display: none;
      position: fixed;
      top: 60px;
      left: 50%;
      transform: translateX(-50%);
      background: #48bb78;
      color: white;
      padding: 18px 20px;
      border-radius: 8px;
      z-index: 999;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-size: 0.95rem;
    }

    .banner-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .banner-person {
      font-weight: 600;
      font-size: 1.1rem;
    }

    .banner-location {
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .banner-loss {
      font-size: 0.9rem;
      margin: 6px 0;
      padding: 6px;
      background: rgba(255,255,255,0.2);
      border-radius: 6px;
      word-break: break-word;
    }

    .banner-time {
      font-size: 0.8rem;
      opacity: 0.8;
    }

    .banner-buttons {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }

    .banner-btn {
      padding: 7px 14px;
      border-radius: 6px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .accept-btn {
      background-color: white;
      color: #48bb78;
    }

    .decline-btn {
      background-color: rgba(255,255,255,0.3);
      color: white;
    }

    /* --- MESSAGE INBOX STYLES --- */
    .message-inbox {
      display: none;
      flex-direction: column;
      gap: 12px;
      margin-top: 15px;
      padding: 15px;
      background: #f8fafc;
      border-radius: 8px;
    }

    .message-item {
      padding: 12px;
      background: white;
      border-radius: 10px;
      max-width: 85%;
      margin-bottom: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .message-sender {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 4px;
    }

    .message-content {
      color: #374151;
      line-height: 1.5;
    }

    .message-time {
      font-size: 0.8rem;
      color: #718096;
      margin-top: 6px;
      text-align: right;
    }

    .message-received {
      align-self: flex-start;
      border-left: 3px solid #5a67d8;
    }

    .message-sent {
      align-self: flex-end;
      background: #e0e7ff;
      border-right: 3px solid #5a67d8;
    }

    /* --- CALL SIMULATION MODAL --- */
    .call-simulation-modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.7);
      z-index: 1001;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .call-simulation-content {
      background: #1a1a2e;
      color: #e6e6e6;
      border-radius: 16px;
      width: 90%;
      max-width: 420px;
      max-height: 80vh;
      overflow-y: auto;
      padding: 24px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.3);
      display: flex;
      flex-direction: column;
    }

    .call-header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      gap: 12px;
    }

    .call-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f093fb, #f5576c);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 1.4rem;
      border: 2px solid #48bb78;
    }

    .call-info {
      flex: 1;
    }

    .call-name {
      font-size: 1.2rem;
      font-weight: 700;
      color: #fff;
    }

    .call-status {
      font-size: 0.85rem;
      color: #48bb78;
      margin-top: 4px;
    }

    .call-simulation-text {
      flex: 1;
      margin-bottom: 20px;
      padding: 12px;
      border-radius: 12px;
      background: rgba(255,255,255,0.05);
      font-size: 0.95rem;
      line-height: 1.6;
    }

    .call-message {
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .call-received {
      align-items: flex-start;
      margin-left: 10px;
    }

    .call-sent {
      align-items: flex-end;
      margin-right: 10px;
    }

    .message-text {
      background: rgba(255,255,255,0.1);
      padding: 10px 14px;
      border-radius: 16px;
      max-width: 75%;
      word-wrap: break-word;
      font-size: 1rem;
    }

    .call-sent .message-text {
      background: #48bb78;
      color: white;
    }

    .message-time {
      font-size: 0.75rem;
      color: #888;
      margin-top: 4px;
      opacity: 0.7;
    }

    .call-actions {
      display: flex;
      justify-content: center;
    }

    .call-btn-end {
      background: #e53e3e;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s;
    }

    .call-btn-end:hover {
      background: #c53030;
    }
  `;
  document.head.appendChild(headerStyle);

  // 4. Load Font Awesome for icons
  const faLink = document.createElement('link');
  faLink.rel = 'stylesheet';
  faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css  ';
  document.head.appendChild(faLink);

  // 5. Add event listeners for header elements
  document.getElementById('loginButton')?.addEventListener('click', function() {
    window.location.href = '/login/';
  });

  // --- Call Modal Logic ---
  const callButton = document.getElementById('callButton');
  const callRequestModal = document.getElementById('callRequestModal');
  const cancelCall = document.getElementById('cancelCall');
  const oneToOneCall = document.getElementById('oneToOneCall');
  const groupCall = document.getElementById('groupCall');

  if (callButton) {
    callButton.addEventListener('click', function() {
      if (callRequestModal) callRequestModal.style.display = 'flex';
    });
  }

  if (cancelCall) {
    cancelCall.addEventListener('click', function() {
      if (callRequestModal) callRequestModal.style.display = 'none';
    });
  }

  if (oneToOneCall) {
    oneToOneCall.addEventListener('click', function() {
      alert('Looking for someone who’s experienced a similar loss…');
      if (callRequestModal) callRequestModal.style.display = 'none';
    });
  }

  if (groupCall) {
    groupCall.addEventListener('click', function() {
      alert('Finding 3–5 people who’ve walked this path…');
      if (callRequestModal) callRequestModal.style.display = 'none';
    });
  }

  // --- CALL SIMULATION MODAL ---
  const callSimulationModal = document.getElementById('callSimulationModal');
  const endCall = document.getElementById('endCall');

  // Trigger the simulation when someone chooses "One-on-One Call"
  if (oneToOneCall) {
    oneToOneCall.addEventListener('click', function() {
      if (callRequestModal) callRequestModal.style.display = 'none';
      if (callSimulationModal) {
        callSimulationModal.style.display = 'flex';
        // Simulate message flow over time
        simulateCallMessages();
      }
    });
  }

  if (endCall) {
    endCall.addEventListener('click', function() {
      if (callSimulationModal) callSimulationModal.style.display = 'none';
      alert('You’ve just had a real moment. You’re not alone. Keep going.');
    });
  }

  // Simulate the call messages appearing one by one
  function simulateCallMessages() {
    const messages = document.querySelectorAll('.call-message');
    let index = 0;

    const showNextMessage = () => {
      if (index < messages.length) {
        messages[index].style.opacity = '1';
        messages[index].style.transform = 'translateX(0)';
        index++;
        setTimeout(showNextMessage, 2500); // 2.5 seconds between messages
      }
    };

    // Hide all messages initially
    messages.forEach(msg => {
      msg.style.opacity = '0';
      msg.style.transform = 'translateX(-20px)';
      msg.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    });

    // Start the sequence after a short delay
    setTimeout(showNextMessage, 1000);
  }

  // --- Message Inbox Logic ---
  const messageButton = document.getElementById('messageButton');
  const messageInbox = document.getElementById('messageInbox');
  const allPostsContainer = document.getElementById('all-posts-container'); // Assumes this exists in the main page
  const sectionTitle = document.getElementById('section-title'); // Assumes this exists in the main page

  if (messageButton && messageInbox && allPostsContainer && sectionTitle) {
    messageButton.addEventListener('click', function() {
      // Hide the main posts container when showing the message inbox
      allPostsContainer.style.display = 'none';
      messageInbox.style.display = 'flex';
      sectionTitle.textContent = 'Your Messages';
    });
  }

  // --- Listener Banner Logic ---
  const acceptCall = document.getElementById('acceptCall');
  const declineCall = document.getElementById('declineCall');
  const listenerBanner = document.getElementById('listenerBanner');

  if (acceptCall && listenerBanner) {
    acceptCall.addEventListener('click', function() {
      listenerBanner.style.display = 'none';
      alert('Connecting you to Mary…\n\nShe’s lost her son to suicide. 3 days ago.\n\nYou’re not alone.');
    });
  }

  if (declineCall && listenerBanner) {
    declineCall.addEventListener('click', function() {
      listenerBanner.style.display = 'none';
    });
  }

  // --- Banner Display Logic (Only for logged-in users) ---
  async function checkAuthAndShowBanner() {
    if (window.supabaseClient) {
      const { data: { user }, error } = await window.supabaseClient.auth.getUser();
      if (user && listenerBanner) {
        // User is logged in, show the banner after 5 seconds
        setTimeout(() => {
          listenerBanner.style.display = 'flex';
        }, 5000);
      }
      // If user is not logged in, the banner remains hidden (display: none by default)
    } else {
      console.error("Supabase client not found in header.js. Cannot check auth state.");
    }
  }

  // Initialize banner logic when DOM is loaded and Supabase client is potentially available
  // Since header.js runs after DOM is loaded, we can call this directly
  // However, Supabase client might be initialized later by the main HTML script
  // So we'll use a small delay or check if the client exists first
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuthAndShowBanner);
  } else {
    // DOM is already loaded
    setTimeout(checkAuthAndShowBanner, 100); // Small delay to ensure Supabase client is initialized by main script
  }
}

// Run the header injection when the DOM is loaded
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', injectHeader);
}
