function injectHeader() {
  // Prevent duplicate injection
  if (document.querySelector('.header')) return;

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
            <i class="fas fa-users"></i> Group Support (4–6 people)
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
          <div class="call-participants-grid" id="participantsGrid">
            <!-- Grid will be dynamically populated -->
          </div>
        </div>

        <!-- Active Call Screen -->
        <div id="activeCallScreen" class="active-call-screen" style="display: none;">
          <div class="visual-call-indicator">
            <div class="audio-wave">
              <div class="wave-dot"></div>
              <div class="wave-dot"></div>
              <div class="wave-dot"></div>
              <div class="wave-dot"></div>
              <div class="wave-dot"></div>
            </div>
            <div class="call-visuals-grid" id="visualCallGrid">
              <!-- Visual participants -->
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

    <!-- Conversation List -->
    <div id="conversationList" class="conversation-list">
      <h2>Recent Conversations</h2>
      
      <div class="conversation-item" data-conversation-id="david">
        <div class="conversation-avatar">D</div>
        <div class="conversation-info">
          <div class="conversation-name">David (Canada)</div>
          <div class="conversation-preview">I saw your post about your daughter. I lost mine to cancer last year...</div>
          <div class="conversation-time">1 hour ago</div>
        </div>
      </div>
      
      <div class="conversation-item" data-conversation-id="lena">
        <div class="conversation-avatar">L</div>
        <div class="conversation-info">
          <div class="conversation-name">Lena (Australia)</div>
          <div class="conversation-preview">I lost my husband to suicide. I didn't tell anyone for 8 months...</div>
          <div class="conversation-time">2 hours ago</div>
        </div>
      </div>
      
      <div class="conversation-item" data-conversation-id="maria">
        <div class="conversation-avatar">M</div>
        <div class="conversation-info">
          <div class="conversation-name">Maria (Spain)</div>
          <div class="conversation-preview">Hi, I saw your post about losing your father. I'm so sorry...</div>
          <div class="conversation-time">3 hours ago</div>
        </div>
      </div>
      
      <div class="conversation-item" data-conversation-id="james">
        <div class="conversation-avatar">J</div>
        <div class="conversation-info">
          <div class="conversation-name">James (UK)</div>
          <div class="conversation-preview">Thank you for listening yesterday. It helped more than you know...</div>
          <div class="conversation-time">5 hours ago</div>
        </div>
      </div>
    </div>
  `;

  // 2. Insert header at top of body
  document.body.insertAdjacentHTML('afterbegin', headerHTML);

  // 3. Add CSS
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
      color: #5a67d8;
      font-size: 1.2rem;
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

    /* --- CONVERSATION LIST STYLES --- */
    .conversation-list {
      display: none;
      flex-direction: column;
      gap: 12px;
      margin: 70px 16px 20px 16px;
      padding: 15px;
      background: #f8fafc;
      border-radius: 8px;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }
    .conversation-list h2 {
      margin: 0 0 15px 0;
      padding: 0 0 10px 0;
      border-bottom: 1px solid #e2e8f0;
      color: #1f2937;
      font-size: 1.2rem;
    }
    .conversation-item {
      display: flex;
      gap: 12px;
      padding: 12px;
      background: white;
      border-radius: 10px;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .conversation-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }
    .conversation-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 1.1rem;
      flex-shrink: 0;
    }
    .conversation-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .conversation-name {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 4px;
    }
    .conversation-preview {
      color: #6b7280;
      font-size: 0.9rem;
      line-height: 1.4;
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .conversation-time {
      font-size: 0.8rem;
      color: #9ca3af;
      text-align: right;
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

    .participants-screen,
    .active-call-screen {
      flex: 1;
      padding: 20px 0;
    }
    .call-participants-grid,
    .call-visuals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .participant-grid-item,
    .call-visual-item-grid {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 15px;
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
      text-align: center;
    }
    .participant-grid-avatar,
    .visual-grid-avatar {
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
    .participant-grid-name,
    .visual-grid-name {
      font-weight: 600;
      margin-bottom: 5px;
      font-size: 0.9rem;
    }
    .participant-grid-status,
    .visual-grid-status {
      font-size: 0.8rem;
      color: #48bb78;
    }
    .call-visual-item-grid {
      background: rgba(255,255,255,0.05);
      border-radius: 10px;
      border-left: 3px solid #48bb78;
      padding: 12px;
      gap: 8px;
    }
    .visual-grid-avatar {
      width: 40px;
      height: 40px;
      font-size: 1rem;
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
    .wave-dot:nth-child(2) { animation-delay: 0.2s; }
    .wave-dot:nth-child(3) { animation-delay: 0.4s; }
    .wave-dot:nth-child(4) { animation-delay: 0.6s; }
    .wave-dot:nth-child(5) { animation-delay: 0.8s; }
    @keyframes wavePulse {
      0% { height: 8px; }
      50% { height: 16px; }
      100% { height: 8px; }
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
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .call-btn-end:hover {
      background: #c53030;
    }
  `;
  document.head.appendChild(headerStyle);

  // 4. Load Font Awesome (only once)
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const faLink = document.createElement('link');
    faLink.rel = 'stylesheet';
    faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(faLink);
  }

  // 5. Utility: Hide all overlays
  function hideAllOverlays() {
    const ids = ['callRequestModal', 'callSimulationModal', 'listenerBanner'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    const convList = document.getElementById('conversationList');
    if (convList) convList.style.display = 'none';
  }

  // 6. Utility: Hide footer sections if they exist
  function hideFooterContentSections() {
    const ids = ['group-list', 'notification-list', 'social-features', 'help-resources'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  }

  // 7. Call Modal Logic
  const callButton = document.getElementById('callButton');
  const callRequestModal = document.getElementById('callRequestModal');
  const cancelCall = document.getElementById('cancelCall');
  const oneToOneCall = document.getElementById('oneToOneCall');
  const groupCall = document.getElementById('groupCall');

  if (callButton) {
    callButton.addEventListener('click', () => {
      hideFooterContentSections();
      hideAllOverlays();
      if (callRequestModal) callRequestModal.style.display = 'flex';
    });
  }
  if (cancelCall) cancelCall.addEventListener('click', () => {
    if (callRequestModal) callRequestModal.style.display = 'none';
  });

  // 8. Call Simulation Logic
  const callSimulationModal = document.getElementById('callSimulationModal');
  const callStatus = document.getElementById('callStatus');
  const waitingScreen = document.getElementById('waitingScreen');
  const participantsScreen = document.getElementById('participantsScreen');
  const activeCallScreen = document.getElementById('activeCallScreen');
  const progressFill = document.getElementById('progressFill');
  const endCall = document.getElementById('endCall');
  const callTimer = document.getElementById('callTimer');
  const participantsGrid = document.getElementById('participantsGrid');
  const visualCallGrid = document.getElementById('visualCallGrid');

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
    if (callInterval) clearInterval(callInterval);
    callInterval = null;
  }

  function formatParticipantName(name) {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  }

  function createParticipantElement(name, status = 'Connected', isGrid = false) {
    const avatarInitials = formatParticipantName(name);
    const element = document.createElement('div');
    if (isGrid) {
      element.className = 'participant-grid-item';
      element.innerHTML = `
        <div class="participant-grid-avatar">${avatarInitials}</div>
        <div class="participant-grid-name">${name}</div>
        <div class="participant-grid-status">${status}</div>
      `;
    } else {
      element.className = 'call-visual-item-grid';
      element.innerHTML = `
        <div class="visual-grid-avatar">${avatarInitials}</div>
        <div class="visual-grid-name">${name}</div>
        <div class="visual-grid-status">${status}</div>
      `;
    }
    return element;
  }

  function populateGrids(participants) {
    participantsGrid.innerHTML = '';
    visualCallGrid.innerHTML = '';
    
    participantsGrid.appendChild(createParticipantElement('You', 'Connected', true));
    visualCallGrid.appendChild(createParticipantElement('You', 'Connected', false));
    
    participants.forEach(p => {
      participantsGrid.appendChild(createParticipantElement(p.name, p.status, true));
      visualCallGrid.appendChild(createParticipantElement(p.name, p.status, false));
    });
  }

  function startCallSimulation() {
    waitingScreen.style.display = 'flex';
    participantsScreen.style.display = 'none';
    activeCallScreen.style.display = 'none';
    callTimer.style.display = 'none';
    callStatus.textContent = 'Connecting...';
    progressFill.style.width = '0%';
    
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 2;
      progressFill.style.width = `${progress}%`;
      
      if (progress >= 100) {
        clearInterval(progressInterval);
        callTimer.style.display = 'block';
        startCallTimer();
        
        if (callType === 'group') {
          const groupParticipants = [
            { name: 'Mary', status: 'Connected' },
            { name: 'David', status: 'Connected' },
            { name: 'Lena', status: 'Connected' },
            { name: 'James', status: 'Connected' },
            { name: 'Sarah', status: 'Connected' }
          ];
          populateGrids(groupParticipants);
          callStatus.textContent = 'All participants connected';
          setTimeout(() => {
            participantsScreen.style.display = 'none';
            activeCallScreen.style.display = 'block';
            callStatus.textContent = 'In call';
          }, 2000);
        } else {
          const oneToOneParticipants = [{ name: 'Sarah', status: 'Connected' }];
          populateGrids(oneToOneParticipants);
          callStatus.textContent = 'Connected with Sarah';
          setTimeout(() => {
            participantsScreen.style.display = 'none';
            activeCallScreen.style.display = 'block';
            callStatus.textContent = 'In call';
          }, 2000);
        }
      }
    }, 50);
  }

  if (oneToOneCall) {
    oneToOneCall.addEventListener('click', () => {
      callType = 'one-to-one';
      hideFooterContentSections();
      hideAllOverlays();
      if (callRequestModal) callRequestModal.style.display = 'none';
      if (callSimulationModal) {
        callSimulationModal.style.display = 'flex';
        startCallSimulation();
      }
    });
  }

  if (groupCall) {
    groupCall.addEventListener('click', () => {
      callType = 'group';
      hideFooterContentSections();
      hideAllOverlays();
      if (callRequestModal) callRequestModal.style.display = 'none';
      if (callSimulationModal) {
        callSimulationModal.style.display = 'flex';
        startCallSimulation();
      }
    });
  }

  if (endCall) {
    endCall.addEventListener('click', () => {
      if (callSimulationModal) {
        callSimulationModal.style.display = 'none';
        stopCallTimer();
        callType = null;
      }
    });
  }

  // ✅ 9. FIXED: Message Button Logic (Always Works)
  const messageButton = document.getElementById('messageButton');
  const conversationList = document.getElementById('conversationList');

  if (messageButton && conversationList) {
    messageButton.addEventListener('click', function() {
      hideAllOverlays();
      hideFooterContentSections();
      conversationList.style.display = 'flex';

      const allPostsContainer = document.getElementById('all-posts-container');
      if (allPostsContainer) {
        allPostsContainer.style.display = 'none';
      }

      const sectionTitle = document.getElementById('section-title');
      if (sectionTitle) {
        sectionTitle.textContent = 'Your Conversations';
      }
    });
  }

  // 10. Conversation Item Click Handling
  document.addEventListener('click', function(e) {
    const conversationItem = e.target.closest('.conversation-item');
    if (conversationItem) {
      const conversationId = conversationItem.dataset.conversationId;
      alert(`Opening conversation with ${conversationId.toUpperCase()}...\n\nThis is where you'd see the full chat history.`);
    }
  });

  // 11. Listener Banner Logic
  const acceptCall = document.getElementById('acceptCall');
  const declineCall = document.getElementById('declineCall');
  const listenerBanner = document.getElementById('listenerBanner');

  if (acceptCall) {
    acceptCall.addEventListener('click', () => {
      if (listenerBanner) listenerBanner.style.display = 'none';
      alert('Connecting you to Mary…\n\nShe’s lost her son to suicide. 3 days ago.\n\nYou’re not alone.');
    });
  }
  if (declineCall) {
    declineCall.addEventListener('click', () => {
      if (listenerBanner) listenerBanner.style.display = 'none';
    });
  }

  // 12. Show Listener Banner for Authenticated Users (after delay)
  async function checkAuthAndShowBanner() {
    if (window.supabaseClient) {
      const { data: { user } } = await window.supabaseClient.auth.getUser();
      if (user && listenerBanner) {
        setTimeout(() => {
          listenerBanner.style.display = 'flex';
        }, 5000);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuthAndShowBanner);
  } else {
    setTimeout(checkAuthAndShowBanner, 100);
  }

  // 13. Login Redirect
  const loginButton = document.getElementById('loginButton');
  if (loginButton) {
    loginButton.addEventListener('click', () => {
      window.location.href = '/login/';
    });
  }
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectHeader);
  } else {
    injectHeader();
  }
}
