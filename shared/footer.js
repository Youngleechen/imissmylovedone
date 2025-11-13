// shared/footer.js

function injectFooter() {
  // 1. Create the footer HTML element
  const footerHTML = `
    <div class="bottom-nav">
      <a href="/test" class="nav-item" data-page="dashboard">
        <i class="fas fa-tachometer-alt"></i>
        <span>Dashboard</span>
      </a>
      <div class="nav-item" data-page="community">
        <i class="fas fa-users"></i>
        <span>Community</span>
      </div>
      <a href="/progress" class="nav-item" data-page="progress">
        <i class="fas fa-book"></i>
        <span>Progress</span>
      </a>
      <div class="nav-item" data-page="notifications">
        <i class="fas fa-bell"></i>
        <span>Notifications</span>
      </div>
      <div class="nav-item" data-page="resources">
        <i class="fas fa-leaf"></i>
        <span>Help</span>
      </div>
    </div>
  `;

  // 2. Append the footer to the end of the body
  document.body.insertAdjacentHTML('beforeend', footerHTML);

  // 3. Add specific CSS styles for the footer and its related content sections
  const footerStyle = document.createElement('style');
  footerStyle.textContent = `
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      background: white;
      display: flex;
      justify-content: space-around;
      padding: 12px 0;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
      z-index: 99;
    }
    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      font-size: 0.8rem;
      color: #718096;
    }
    .nav-item.active {
      color: #5a67d8;
    }
    .nav-item i {
      font-size: 1.4rem;
    }

    /* --- Group List Styles --- */
    .group-list {
      display: none;
      flex-direction: column;
      gap: 12px;
      margin-top: 15px;
    }

    .group-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
      border-left: 4px solid #5a67d8;
    }

    .group-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(45deg, #5a67d8, #9f7aea);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .group-info {
      flex: 1;
    }

    .group-name {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 4px;
    }

    .group-meta {
      font-size: 0.85rem;
      color: #718096;
    }

    /* --- Notification List Styles --- */
    .notification-list {
      display: none;
      flex-direction: column;
      gap: 12px;
      margin-top: 15px;
    }

    .notification-item {
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
      border-left: 4px solid #48bb78;
    }

    .notification-text {
      color: #374151;
      line-height: 1.5;
    }

    .notification-time {
      font-size: 0.8rem;
      color: #718096;
      margin-top: 4px;
    }

    /* --- Social Features Styles --- */
    .social-features {
      display: none;
      flex-direction: column;
      gap: 12px;
      margin-top: 15px;
    }

    .social-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
      border-left: 4px solid #ed8936;
    }

    .social-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(45deg, #ed8936, #f6ad55);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.1rem;
    }

    .social-info {
      flex: 1;
    }

    .social-name {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 4px;
    }

    .social-meta {
      font-size: 0.85rem;
      color: #718096;
    }

    /* --- Help Resources Styles --- */
    .help-resources {
      display: none;
      flex-direction: column;
      gap: 12px;
      margin-top: 15px;
    }

    .help-item {
      padding: 15px;
      background: #f8fafc;
      border-radius: 8px;
      border-left: 4px solid #48bb78;
    }

    .help-title {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 8px;
    }

    .help-content {
      color: #374151;
      line-height: 1.5;
      font-size: 0.95rem;
    }

    .help-link {
      color: #4f46e5;
      text-decoration: none;
      display: block;
      margin-top: 8px;
      font-weight: 600;
    }
  `;
  document.head.appendChild(footerStyle);

  // 4. Create the content sections managed by the footer and inject them into the main content area
  // This assumes there's a container element (like the posts-section) in the main HTML to append to
  const mainContentContainer = document.querySelector('.posts-section'); // Or another appropriate selector
  if (mainContentContainer) {
    const groupListHTML = `<div id="group-list" class="group-list"><!-- Groups will be populated here --></div>`;
    const notificationListHTML = `<div id="notification-list" class="notification-list"><!-- Notifications will be populated here --></div>`;
    const socialFeaturesHTML = `<div id="social-features" class="social-features"><!-- Social features will be populated here --></div>`;
    const helpResourcesHTML = `<div id="help-resources" class="help-resources"><!-- Help resources will be populated here --></div>`;

    // Append these sections to the main content container
    mainContentContainer.insertAdjacentHTML('beforeend', groupListHTML + notificationListHTML + socialFeaturesHTML + helpResourcesHTML);
  } else {
    console.error("Could not find main content container to inject footer content sections.");
  }

  // 5. Store the current active page state
  let currentActivePage = null;

  // 6. Add event listeners for footer navigation
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', function() {
      const page = this.getAttribute('data-page');

      // If clicking the same active page, close it (toggle)
      if (currentActivePage === page) {
        // Reset to default (show posts container)
        document.querySelectorAll('.nav-item').forEach(navItem => {
          navItem.classList.remove('active');
        });
        showDefaultContent(); // Define this function to reset content
        currentActivePage = null;
        return;
      }

      // Remove active class from all nav items
      document.querySelectorAll('.nav-item').forEach(navItem => {
        navItem.classList.remove('active');
      });

      // Add active class to clicked item
      this.classList.add('active');

      // Show appropriate content based on clicked page
      if (page === 'community') {
        showGroups();
        currentActivePage = 'community';
      } else if (page === 'notifications') {
        showNotifications();
        currentActivePage = 'notifications';
      } else if (page === 'resources') {
        showHelp();
        currentActivePage = 'resources';
      } else {
        // For other pages, just reset to default
        showDefaultContent();
        currentActivePage = null;
      }
    });
  });

  // 7. Define the functions to show the content managed by the footer
  function showDefaultContent() {
    const container = document.getElementById('all-posts-container');
    const groupList = document.getElementById('group-list');
    const notificationList = document.getElementById('notification-list');
    const socialFeatures = document.getElementById('social-features');
    const helpResources = document.getElementById('help-resources');
    const sectionTitle = document.getElementById('section-title');

    if (container) container.style.display = 'block';
    if (groupList) groupList.style.display = 'none';
    if (notificationList) notificationList.style.display = 'none';
    if (socialFeatures) socialFeatures.style.display = 'none';
    if (helpResources) helpResources.style.display = 'none';
    if (sectionTitle) sectionTitle.textContent = 'Community Memories';
  }

  function showGroups() {
    const container = document.getElementById('all-posts-container');
    const groupList = document.getElementById('group-list');
    const notificationList = document.getElementById('notification-list');
    const socialFeatures = document.getElementById('social-features');
    const helpResources = document.getElementById('help-resources');
    const sectionTitle = document.getElementById('section-title');

    if (container) container.style.display = 'none';
    if (groupList) groupList.style.display = 'flex';
    if (notificationList) notificationList.style.display = 'none';
    if (socialFeatures) socialFeatures.style.display = 'none';
    if (helpResources) helpResources.style.display = 'none';
    if (sectionTitle) sectionTitle.textContent = 'Your Groups';

    // 20+ grief groups with real loss types
    const groups = [
      { name: 'Parents Who Lost a Child to Suicide', members: 245000, postsToday: 12000 },
      { name: 'Spouses Who Lost Partner to Suicide', members: 189000, postsToday: 8500 },
      { name: 'Siblings Who Lost Brother or Sister to Suicide', members: 312000, postsToday: 15000 },
      { name: 'Caregivers Who Lost Loved One to Illness', members: 97000, postsToday: 5200 },
      { name: 'Parents Who Lost Child to Overdose', members: 63000, postsToday: 3100 },
      { name: 'Those Who Lost a Friend to Suicide', members: 142000, postsToday: 7800 },
      { name: 'Military Families After Loss', members: 89000, postsToday: 4200 },
      { name: 'Parents Who Lost Child to Accident', members: 156000, postsToday: 9300 },
      { name: 'Spouses Who Lost Partner to Cancer', members: 112000, postsToday: 6700 },
      { name: 'Adults Who Lost Parent to Suicide', members: 78000, postsToday: 4500 },
      { name: 'Those Who Lost a Pet After Long Illness', members: 54000, postsToday: 2800 },
      { name: 'Parents Who Lost Child to Pregnancy Loss', members: 91000, postsToday: 5100 },
      { name: 'Elder Caregivers Who Lost Their Loved One', members: 43000, postsToday: 2300 },
      { name: 'Those Who Lost a Partner to Sudden Death', members: 37000, postsToday: 1900 },
      { name: 'Survivors of Multiple Losses', members: 29000, postsToday: 1500 },
      { name: 'Those Who Lost a Child to Sudden Infant Death', members: 103000, postsToday: 5800 },
      { name: 'Friends Who Lost Someone to Suicide', members: 67000, postsToday: 3400 },
      { name: 'Grandparents Who Lost Grandchild to Suicide', members: 52000, postsToday: 2700 },
      { name: 'Those Who Lost a Loved One to Suicide After Trauma', members: 48000, postsToday: 2600 },
      { name: 'Those Who Lost a Child to Suicide After Mental Health Struggle', members: 35000, postsToday: 1800 },
      { name: 'Survivors of Suicide Loss in the LGBTQ+ Community', members: 28000, postsToday: 1400 },
      { name: 'Grief Support for First Responders', members: 41000, postsToday: 2100 }
    ];

    const groupsHTML = groups.map(group => `
      <div class="group-item">
        <div class="group-avatar">${group.name.charAt(0)}</div>
        <div class="group-info">
          <div class="group-name">${group.name}</div>
          <div class="group-meta">${group.members.toLocaleString()} members • ${group.postsToday.toLocaleString()} new posts today</div>
        </div>
        <i class="fas fa-chevron-right" style="color: #a0aec0;"></i>
      </div>
    `).join('');

    if (groupList) groupList.innerHTML = groupsHTML;
  }

  function showNotifications() {
    const container = document.getElementById('all-posts-container');
    const groupList = document.getElementById('group-list');
    const notificationList = document.getElementById('notification-list');
    const socialFeatures = document.getElementById('social-features');
    const helpResources = document.getElementById('help-resources');
    const sectionTitle = document.getElementById('section-title');

    if (container) container.style.display = 'none';
    if (groupList) groupList.style.display = 'none';
    if (notificationList) notificationList.style.display = 'flex';
    if (socialFeatures) socialFeatures.style.display = 'none';
    if (helpResources) helpResources.style.display = 'none';
    if (sectionTitle) sectionTitle.textContent = 'Notifications';

    // Sample notifications with personal context
    const notifications = [
      { text: 'Mary, United States — Lost her son to suicide — 3 days ago', time: 'Just now' },
      { text: 'Sarah liked your memory of your dad', time: '2 hours ago' },
      { text: 'New post in "Parents Who Lost a Child to Suicide" (245K members)', time: '4 hours ago' },
      { text: 'John joined your group "Spouses Who Lost Partner to Suicide"', time: '1 day ago' },
      { text: 'Reminder: Your memorial post is one year old today', time: '1 day ago' },
      { text: 'Emma commented on your story', time: '2 days ago' },
      { text: 'New resource added to "Those Who Lost a Child to Overdose"', time: '3 days ago' },
      { text: 'Live call starting in 10 minutes: "First Year After Suicide Loss"', time: 'Just now' },
      { text: 'You have 12 unread messages from your support circle', time: '5 minutes ago' }
    ];

    const notificationsHTML = notifications.map(notification => `
      <div class="notification-item">
        <div class="notification-text">${notification.text}</div>
        <div class="notification-time">${notification.time}</div>
      </div>
    `).join('');

    if (notificationList) notificationList.innerHTML = notificationsHTML;
  }

  function showHelp() {
    const container = document.getElementById('all-posts-container');
    const groupList = document.getElementById('group-list');
    const notificationList = document.getElementById('notification-list');
    const socialFeatures = document.getElementById('social-features');
    const helpResources = document.getElementById('help-resources');
    const sectionTitle = document.getElementById('section-title');

    if (container) container.style.display = 'none';
    if (groupList) groupList.style.display = 'none';
    if (notificationList) notificationList.style.display = 'none';
    if (socialFeatures) socialFeatures.style.display = 'none';
    if (helpResources) helpResources.style.display = 'flex';
    if (sectionTitle) sectionTitle.textContent = 'Help & Resources';

    // Help resources data
    const resources = [
      {
        title: 'Crisis Support',
        content: 'If you\'re in crisis, please reach out for immediate help. You are not alone.',
        link: 'https://suicidepreventionlifeline.org/',
        linkText: 'National Suicide Prevention Lifeline: 988'
      },
      {
        title: 'Grief Support Groups',
        content: 'Connect with others who understand your loss. Find local and online support groups based on your specific type of grief.',
        link: '#',
        linkText: 'Find a Support Group'
      },
      {
        title: 'Coping Strategies',
        content: 'Explore healthy ways to manage grief, including journaling, meditation, and physical activity.',
        link: '#',
        linkText: 'View Coping Resources'
      },
      {
        title: 'Professional Help',
        content: 'Find licensed therapists, counselors, and grief specialists in your area.',
        link: '#',
        linkText: 'Find Professional Help'
      },
      {
        title: 'Emergency Resources',
        content: 'In case of emergency, contact local emergency services or go to the nearest emergency room.',
        link: 'tel:911',
        linkText: 'Emergency: 911'
      }
    ];

    const resourcesHTML = resources.map(resource => `
      <div class="help-item">
        <div class="help-title">${resource.title}</div>
        <div class="help-content">${resource.content}</div>
        <a href="${resource.link}" class="help-link">${resource.linkText}</a>
      </div>
    `).join('');

    if (helpResources) helpResources.innerHTML = resourcesHTML;
  }
}

// Run the footer injection when the DOM is loaded
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', injectFooter);
}
