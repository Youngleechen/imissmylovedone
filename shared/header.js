(function () {
  'use strict';

  if (document.querySelector('.healing-header-root')) return;

  const headerHTML = `
    <div class="healing-header-root">
      <!-- Main Header -->
      <div class="header">
        <div class="logo">
          <a href="/" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-heart"></i> Healing
          </a>
        </div>
        <div class="user-menu">
          <button class="action-btn" id="messageButton" style="background: none; border: none; padding: 8px; cursor: pointer;" title="Messages">
            <i class="fas fa-envelope"></i>
          </button>
          <button class="action-btn" id="callButton" style="background: none; border: none; padding: 8px; cursor: pointer;" title="Support Call">
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

      <!-- Call Simulation Modal -->
      <div id="callSimulationModal" class="call-simulation-modal">
        <div class="call-simulation-content">
          <div class="call-header">
            <div class="call-avatar" id="localUserAvatar">Y</div>
            <div class="call-info">
              <div class="call-name">You</div>
              <div class="call-status" id="callStatus">Connecting...</div>
            </div>
          </div>
          
          <div id="waitingScreen" class="waiting-screen">
            <div class="waiting-icon"><i class="fas fa-sync fa-spin"></i></div>
            <div class="waiting-text">Looking for someone who understands your loss...</div>
            <div class="waiting-progress">
              <div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div>
            </div>
            <div class="waiting-tips">
              <p>Remember: You're not alone. Someone who's walked this path is waiting to connect with you.</p>
            </div>
          </div>

          <div id="participantsScreen" class="participants-screen" style="display: none;">
            <div class="call-participants-grid" id="participantsGrid"></div>
          </div>

          <div id="activeCallScreen" class="active-call-screen" style="display: none;">
            <div class="visual-call-indicator">
              <div class="audio-wave">
                <div class="wave-dot"></div>
                <div class="wave-dot"></div>
                <div class="wave-dot"></div>
                <div class="wave-dot"></div>
                <div class="wave-dot"></div>
              </div>
              <div class="call-visuals-grid" id="visualCallGrid"></div>
            </div>
          </div>

          <div class="call-timer" id="callTimer">00:00</div>
          <div class="call-actions">
            <button id="endCall" class="call-btn-end"><i class="fas fa-phone-slash"></i> End Call</button>
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
        <h2>
          Recent Conversations
          <button class="close-btn" id="closeConversationList">×</button>
        </h2>
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
    </div>
  `;

  document.body.insertAdjacentHTML('afterbegin', headerHTML);

  if (!document.getElementById('healing-shared-styles')) {
    const style = document.createElement('style');
    style.id = 'healing-shared-styles';
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
        z-index: 1000;
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
        font-size: 1.2rem;
        color: #5a67d8;
      }
      .action-btn:hover {
        background: #f0f4ff;
        border-radius: 6px;
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
        z-index: 2000;
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

      /* --- BANNER --- */
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
        z-index: 1999;
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

      /* --- CONVERSATION LIST --- */
      .conversation-list {
        display: none;
        position: fixed;
        top: 60px;
        left: 0;
        width: 100%;
        height: calc(100vh - 60px);
        background: white;
        z-index: 1998;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        overflow-y: auto;
        padding: 15px;
        border-top: 1px solid #e2e8f0;
      }
      .conversation-list h2 {
        font-size: 1.2rem;
        font-weight: 600;
        color: #1f2937;
        margin: 0 0 15px 0;
        padding: 0 0 10px 0;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .conversation-list .close-btn {
        background: none;
        border: none;
        font-size: 1.2rem;
        color: #718096;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
      }
      .conversation-list .close-btn:hover {
        background: #f7fafc;
      }
      .conversation-item {
        display: flex;
        gap: 12px;
        padding: 12px;
        background: white;
        border-radius: 10px;
        cursor: pointer;
        transition: transform 0.2s ease;
        border: 1px solid #e2e8f0;
        margin-bottom: 8px;
      }
      .conversation-item:hover {
        transform: translateY(-2px);
        border-color: #cbd5e0;
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

      /* --- CALL SIMULATION --- */
      .call-simulation-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 2001;
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
        padding: 24px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.3);
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
      .call-timer {
        text-align: center;
        font-size: 1.5rem;
        font-weight: 600;
        color: #48bb78;
        margin: 20px 0;
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
        margin: 0 auto;
      }

      /* Heart icon */
      .fas.fa-heart {
        color: #e53e3e !important;
      }
    `;
    document.head.appendChild(style);
  }

  if (!document.querySelector('link[href*="font-awesome"]')) {
    const fa = document.createElement('link');
    fa.rel = 'stylesheet';
    fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(fa);
  }

  // UTILS
  function show(el) { if (el) el.style.display = 'block'; }
  function showFlex(el) { if (el) el.style.display = 'flex'; }
  function hide(el) { if (el) el.style.display = 'none'; }
  function text(el, str) { if (el) el.textContent = str; }

  // UPDATE AVATAR
  const savedName = localStorage.getItem('userFirstName');
  const avatar = document.getElementById('userAvatar');
  if (avatar && savedName) {
    avatar.textContent = savedName.charAt(0).toUpperCase();
  }

  // MESSAGE BUTTON + CLOSE
  const messageBtn = document.getElementById('messageButton');
  const convList = document.getElementById('conversationList');
  const closeConvBtn = document.getElementById('closeConversationList');

  if (messageBtn) {
    messageBtn.addEventListener('click', () => {
      hide(document.getElementById('callRequestModal'));
      hide(document.getElementById('callSimulationModal'));
      hide(document.getElementById('listenerBanner'));
      const posts = document.getElementById('all-posts-container');
      const title = document.getElementById('section-title');
      if (posts) posts.style.display = 'none';
      if (title) title.textContent = 'Your Conversations';
      showFlex(convList);
    });
  }

  if (closeConvBtn) {
    closeConvBtn.addEventListener('click', () => {
      hide(convList);
      const posts = document.getElementById('all-posts-container');
      const title = document.getElementById('section-title');
      if (posts) posts.style.display = 'block';
      if (title) title.textContent = 'Community Memories';
    });
  }

  // CALL BUTTON
  const callBtn = document.getElementById('callButton');
  if (callBtn) {
    callBtn.addEventListener('click', () => {
      hide(convList);
      const posts = document.getElementById('all-posts-container');
      if (posts) posts.style.display = 'none';
      showFlex(document.getElementById('callRequestModal'));
      const title = document.getElementById('section-title');
      if (title) title.textContent = 'Community Memories';
    });
  }

  // CANCEL CALL
  document.getElementById('cancelCall')?.addEventListener('click', () => {
    hide(document.getElementById('callRequestModal'));
    const posts = document.getElementById('all-posts-container');
    const title = document.getElementById('section-title');
    if (posts) posts.style.display = 'block';
    if (title) title.textContent = 'Community Memories';
  });

  // END CALL
  document.getElementById('endCall')?.addEventListener('click', () => {
    hide(document.getElementById('callSimulationModal'));
    const posts = document.getElementById('all-posts-container');
    const title = document.getElementById('section-title');
    if (posts) posts.style.display = 'block';
    if (title) title.textContent = 'Community Memories';
  });

  // CONVERSATION ITEMS
  document.addEventListener('click', (e) => {
    const item = e.target.closest('.conversation-item');
    if (item) {
      alert(`Opening conversation with ${item.dataset.conversationId}...\n\nThis is where full chat would appear.`);
    }
  });

  // LISTENER BANNER
  if (savedName) {
    setTimeout(() => {
      showFlex(document.getElementById('listenerBanner'));
    }, 5000);
  }

  // CALL SIMULATION LOGIC
  let callInterval = null;
  let callDuration = 0;

  function startTimer() {
    callDuration = 0;
    if (callInterval) clearInterval(callInterval);
    callInterval = setInterval(() => {
      callDuration++;
      const m = String(Math.floor(callDuration / 60)).padStart(2, '0');
      const s = String(callDuration % 60).padStart(2, '0');
      text(document.getElementById('callTimer'), `${m}:${s}`);
    }, 1000);
  }

  function stopTimer() {
    if (callInterval) clearInterval(callInterval);
  }

  function createParticipantElement(name, status, isGrid = false) {
    const element = document.createElement('div');
    const avatarInitials = name.split(' ').map(word => word[0]).join('').toUpperCase();
    
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

  function simulateCall(type) {
    hide(document.getElementById('callRequestModal'));
    show(document.getElementById('callSimulationModal'));
    
    const waiting = document.getElementById('waitingScreen');
    const participants = document.getElementById('participantsScreen');
    const active = document.getElementById('activeCallScreen');
    const status = document.getElementById('callStatus');
    const progress = document.getElementById('progressFill');
    const participantsGrid = document.getElementById('participantsGrid');
    const visualCallGrid = document.getElementById('visualCallGrid');
    
    if (participantsGrid) participantsGrid.innerHTML = '';
    if (visualCallGrid) visualCallGrid.innerHTML = '';
    
    show(waiting);
    hide(participants);
    hide(active);
    text(status, 'Connecting...');
    if (progress) progress.style.width = '0%';
    
    let p = 0;
    const pi = setInterval(() => {
      p += 2;
      if (progress) progress.style.width = `${p}%`;
      if (p >= 100) {
        clearInterval(pi);
        
        show(participants);
        hide(waiting);
        startTimer();
        
        let participantsData = [];
        if (type === 'one') {
          participantsData = [{ name: 'Sarah', status: 'Connected' }];
          text(status, 'Connected with Sarah');
        } else {
          participantsData = [
            { name: 'Mary', status: 'Connected' },
            { name: 'David', status: 'Connected' },
            { name: 'Lena', status: 'Connected' },
            { name: 'James', status: 'Connected' }
          ];
          text(status, 'All participants connected');
        }
        
        const youElement = createParticipantElement('You', 'Connected', true);
        if (participantsGrid) participantsGrid.appendChild(youElement);
        const youVisual = createParticipantElement('You', 'Connected', false);
        if (visualCallGrid) visualCallGrid.appendChild(youVisual);
        
        participantsData.forEach(p => {
          const el = createParticipantElement(p.name, p.status, true);
          if (participantsGrid) participantsGrid.appendChild(el);
          const visEl = createParticipantElement(p.name, p.status, false);
          if (visualCallGrid) visualCallGrid.appendChild(visEl);
        });
        
        setTimeout(() => {
          hide(participants);
          show(active);
          text(status, 'In call');
        }, 2000);
      }
    }, 40);
  }

  document.getElementById('oneToOneCall')?.addEventListener('click', () => simulateCall('one'));
  document.getElementById('groupCall')?.addEventListener('click', () => simulateCall('group'));

  // LOGIN BUTTON
  document.getElementById('loginButton')?.addEventListener('click', () => {
    window.location.href = '/login/';
  });
})();
