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
          <div class="call-avatar" id="localUserAvatar">Y</div>
          <div class="call-info">
            <div class="call-name">You</div>
            <div class="call-status" id="callStatus">Connecting...</div>
          </div>
        </div>
        
        <!-- Waiting Screen -->
        <div id="waitingScreen" class="waiting-screen">
          <div class="waiting-icon">
            <i class="fas fa-sync fa-spin"></i>
          </div>
          <div class="waiting-text">Looking for someone who understands your loss...</div>
          <div class="waiting-progress">
            <div class="progress-bar">
              <div class="progress-fill" id="progressFill"></div>
            </div>
          </div>
          <div class="waiting-tips">
            <p>Remember: You're not alone. Someone who's walked this path is waiting to connect with you.</p>
          </div>
        </div>

        <!-- Participants Screen -->
        <div id="participantsScreen" class="participants-screen" style="display: none;">
          <div class="call-participants">
            <div class="participant" id="participant-0">
              <div class="participant-avatar">Y</div>
              <div class="participant-name">You</div>
              <div class="participant-status">Connected</div>
            </div>
            <!-- Other participants will be added here dynamically -->
          </div>
        </div>

        <!-- Active Call Screen (Visual Only - No Text) -->
        <div id="activeCallScreen" class="active-call-screen" style="display: none;">
          <div class="visual-call-indicator">
            <div class="audio-wave">
              <div class="wave-dot"></div>
              <div class="wave-dot"></div>
              <div class="wave-dot"></div>
              <div class="wave-dot"></div>
              <div class="wave-dot"></div>
            </div>
            <div class="call-visuals">
              <div class="call-visual-item">
                <div class="visual-avatar">M</div>
                <div class="visual-name">Mary</div>
                <div class="visual-status">Speaking...</div>
              </div>
              <div class="call-visual-item">
                <div class="visual-avatar">D</div>
                <div class="visual-name">David</div>
                <div class="visual-status">Listening...</div>
              </div>
              <div class="call-visual-item">
                <div class="visual-avatar">L</div>
                <div class="visual-name">Lena</div>
                <div class="visual-status">Listening...</div>
              </div>
            </div>
          </div>
        </div>

        <div class="call-timer" id="callTimer">00:00</div>
        
        <div class="call-actions">
          <button id="endCall" class="call-btn-end">
            <i class="fas fa-phone-slash"></i> End Call
          </button>
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
      
      <!-- David's Message -->
      <div class="message-item message-received" data-conversation-id="david">
        <div class="message-sender">David (Canada)</div>
        <div class="message-content">I saw your post about your daughter. I lost mine to cancer last year. I didn't think I'd ever feel anything but numb. But today, I smiled at a song she loved. It didn't hurt as much. Just… different. I'm here if you want to talk.</div>
        <div class="message-time">1 hour ago</div>
      </div>
      
      <!-- Your Reply to David -->
      <div class="message-item message-sent" data-conversation-id="david">
        <div class="message-sender">You</div>
        <div class="message-content">Thank you, David. That meant more than I can say. I've been holding my breath for months. Just reading that… I felt like I could exhale.</div>
        <div class="message-time">45 minutes ago</div>
      </div>
      
      <!-- Lena's Message -->
      <div class="message-item message-received" data-conversation-id="lena">
        <div class="message-sender">Lena (Australia)</div>
        <div class="message-content">I lost my husband to suicide. I didn't tell anyone for 8 months. I thought I was broken. But now I know — I was just grieving. You're not alone.</div>
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
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .message-item:hover {
      transform: translateY(-2px);
    }

    .message-sender {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 4px;
    }

    .message-content {
      color: #374151;
      line-height: 1.5;
      margin-bottom: 8px;
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
      max-width: 500px;
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
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
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

    /* --- WAITING SCREEN --- */
    .waiting-screen {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      text-align: center;
    }

    .waiting-icon {
      font-size: 3rem;
      color: #48bb78;
      margin-bottom: 20px;
    }

    .waiting-text {
      font-size: 1.1rem;
      margin-bottom: 30px;
      color: #e6e6e6;
    }

    .waiting-progress {
      width: 100%;
      max-width: 300px;
      margin-bottom: 30px;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: rgba(255,255,255,0.1);
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #48bb78, #38a169);
      width: 0%;
      transition: width 0.3s ease;
    }

    .waiting-tips {
      font-size: 0.9rem;
      color: #a0aec0;
      max-width: 350px;
      line-height: 1.5;
    }

    /* --- PARTICIPANTS SCREEN --- */
    .participants-screen {
      flex: 1;
      padding: 20px 0;
    }

    .call-participants {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .participant {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 15px;
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.1);
    }

    .participant-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f093fb, #f5576c);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 1.2rem;
      margin-bottom: 10px;
    }

    .participant-name {
      font-weight: 600;
      margin-bottom: 5px;
    }

    .participant-status {
      font-size: 0.8rem;
      color: #48bb78;
    }

    /* --- ACTIVE CALL SCREEN (VISUAL ONLY) --- */
    .active-call-screen {
      flex: 1;
      overflow-y: auto;
      margin-bottom: 20px;
      padding: 10px;
    }

    .visual-call-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

    .audio-wave {
      display: flex;
      gap: 4px;
      margin-bottom: 15px;
    }

    .wave-dot {
      width: 4px;
      height: 12px;
      background: #48bb78;
      border-radius: 2px;
      animation: wavePulse 1.5s infinite ease-in-out;
    }

    .wave-dot:nth-child(2) {
      animation-delay: 0.2s;
    }

    .wave-dot:nth-child(3) {
      animation-delay: 0.4s;
    }

    .wave-dot:nth-child(4) {
      animation-delay: 0.6s;
    }

    .wave-dot:nth-child(5) {
      animation-delay: 0.8s;
    }

    @keyframes wavePulse {
      0% { height: 8px; }
      50% { height: 16px; }
      100% { height: 8px; }
    }

    .call-visuals {
      display: flex;
      flex-direction: column;
      gap: 15px;
      width: 100%;
    }

    .call-visual-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: rgba(255,255,255,0.05);
      border-radius: 10px;
      border-left: 3px solid #48bb78;
    }

    .visual-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f093fb, #f5576c);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 1rem;
    }

    .visual-name {
      font-weight: 600;
      color: #fff;
    }

    .visual-status {
      font-size: 0.85rem;
      color: #48bb78;
      margin-left: auto;
    }

    .call-timer {
      text-align: center;
      font-size: 1.5rem;
      font-weight: 600;
      color: #48bb78;
      margin-bottom: 15px;
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
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .call-btn-end:hover {
      background: #c53030;
    }
  `;
  document.head.appendChild(headerStyle);

  // 4. Load Font Awesome for icons
  const faLink = document.createElement('link');
  faLink.rel = 'stylesheet';
  faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
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

  // --- CALL SIMULATION MODAL ---
  const callSimulationModal = document.getElementById('callSimulationModal');
  const callStatus = document.getElementById('callStatus');
  const waitingScreen = document.getElementById('waitingScreen');
  const participantsScreen = document.getElementById('participantsScreen');
  const activeCallScreen = document.getElementById('activeCallScreen');
  const progressFill = document.getElementById('progressFill');
  const endCall = document.getElementById('endCall');
  const callTimer = document.getElementById('callTimer');

  let callType = null;
  let callInterval = null;
  let callDuration = 0;

  function startCallTimer() {
    callDuration = 0;
    if (callInterval) clearInterval(callInterval);
    
    callInterval = setInterval(() => {
      callDuration++;
      const minutes = Math.floor(callDuration / 60).toString().padStart(2, '0');
      const seconds = (callDuration % 60).toString().padStart(2, '0');
      callTimer.textContent = `${minutes}:${seconds}`;
    }, 1000);
  }

  function stopCallTimer() {
    if (callInterval) {
      clearInterval(callInterval);
      callInterval = null;
    }
  }

  function formatParticipantName(name) {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  }

  function addParticipant(name, status = 'Connected') {
    const participantsContainer = document.querySelector('.call-participants');
    const participantId = `participant-${participantsContainer.children.length}`;
    
    const participantElement = document.createElement('div');
    participantElement.className = 'participant';
    participantElement.id = participantId;
    
    participantElement.innerHTML = `
      <div class="participant-avatar">${formatParticipantName(name)}</div>
      <div class="participant-name">${name}</div>
      <div class="participant-status">${status}</div>
    `;
    
    participantsContainer.appendChild(participantElement);
  }

  // Trigger the simulation when someone chooses "One-on-One Call"
  if (oneToOneCall) {
    oneToOneCall.addEventListener('click', function() {
      if (callRequestModal) callRequestModal.style.display = 'none';
      if (callSimulationModal) {
        callType = 'one-to-one';
        callSimulationModal.style.display = 'flex';
        startCallSimulation();
      }
    });
  }

  // Trigger the simulation when someone chooses "Group Call"
  if (groupCall) {
    groupCall.addEventListener('click', function() {
      if (callRequestModal) callRequestModal.style.display = 'none';
      if (callSimulationModal) {
        callType = 'group';
        callSimulationModal.style.display = 'flex';
        startCallSimulation();
      }
    });
  }

  function startCallSimulation() {
    // Reset UI
    waitingScreen.style.display = 'flex';
    participantsScreen.style.display = 'none';
    activeCallScreen.style.display = 'none';
    callTimer.style.display = 'none';
    callStatus.textContent = 'Connecting...';
    progressFill.style.width = '0%';
    
    // Start progress bar
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 2;
      progressFill.style.width = `${progress}%`;
      
      if (progress >= 100) {
        clearInterval(progressInterval);
        
        // Show participants screen for group calls
        if (callType === 'group') {
          waitingScreen.style.display = 'none';
          participantsScreen.style.display = 'block';
          callStatus.textContent = 'Connecting...';
          callTimer.style.display = 'block';
          startCallTimer();
          
          // Add group participants
          setTimeout(() => {
            addParticipant('Mary');
            callStatus.textContent = 'Connecting... Mary joined';
          }, 1000);
          
          setTimeout(() => {
            addParticipant('David');
            callStatus.textContent = 'Connecting... David joined';
          }, 2000);
          
          setTimeout(() => {
            addParticipant('Lena');
            callStatus.textContent = 'All participants connected';
          }, 3000);
          
          // Show active call after all participants join
          setTimeout(() => {
            participantsScreen.style.display = 'none';
            activeCallScreen.style.display = 'block';
            callStatus.textContent = 'In call';
            
            // Animate audio waves
            animateAudioWaves();
          }, 5000);
          
        } else {
          // One-to-one call
          waitingScreen.style.display = 'none';
          activeCallScreen.style.display = 'block';
          callStatus.textContent = 'Connected';
          callTimer.style.display = 'block';
          startCallTimer();
          
          // Animate audio waves
          animateAudioWaves();
        }
      }
    }, 50);
  }

  function animateAudioWaves() {
    // This is handled by CSS animation in the .wave-dot class
    // We just need to ensure it's visible
    const waveDots = document.querySelectorAll('.wave-dot');
    waveDots.forEach(dot => {
      dot.style.animationPlayState = 'running';
    });
  }

  if (endCall) {
    endCall.addEventListener('click', function() {
      if (callSimulationModal) {
        callSimulationModal.style.display = 'none';
        stopCallTimer();
        callType = null;
        
        // Clear participants for next call
        const participantsContainer = document.querySelector('.call-participants');
        while (participantsContainer.children.length > 1) {
          participantsContainer.removeChild(participantsContainer.lastChild);
        }
        
        alert('Call ended. You\'re not alone. Keep going.');
      }
    });
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

  // Add click handlers for message items to show conversation details
  document.addEventListener('click', function(e) {
    const messageItem = e.target.closest('.message-item');
    if (messageItem) {
      const conversationId = messageItem.dataset.conversationId;
      if (conversationId) {
        // In a real app, this would open a detailed conversation view
        // For now, we'll just show an alert
        alert(\`Opening conversation with \${conversationId.toUpperCase()}...\n\nThis is where you'd see the full chat history.\`);
      }
    }
  });

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
