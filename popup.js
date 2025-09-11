document.addEventListener('DOMContentLoaded', function() {
  const tabList = document.getElementById('tabList');
  const refreshBtn = document.getElementById('refreshBtn');
  const injectBtn = document.getElementById('injectBtn');

  // Load tab titles when popup opens
  loadTabTitles();
  loadBlockedSites(); // Load blocked sites

  refreshBtn.addEventListener('click', loadTabTitles);
  
  injectBtn.addEventListener('click', function() {
    // Get current active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        // Send message to content script to inject titles
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "injectTitles",
          tabTitles: getTabTitlesArray()
        }, function(response) {
          if (response && response.status === "success") {
            alert("Tab titles injected successfully!");
          } else {
            alert("Failed to inject titles. Make sure you're on a supported page.");
          }
        });
      }
    });
  });

  function loadTabTitles() {
    chrome.tabs.query({}, function(tabs) {
      tabList.innerHTML = '';
      
      tabs.forEach(tab => {
        if (tab.title && tab.url) {
          const tabItem = document.createElement('div');
          tabItem.className = 'tab-item';
          tabItem.innerHTML = `
            <strong>${tab.title}</strong><br>
            <small style="color: #666;">${tab.url}</small>
          `;
          tabList.appendChild(tabItem);
        }
      });
    });
  }

  function getTabTitlesArray() {
    const tabItems = tabList.querySelectorAll('.tab-item');
    const titles = [];
    tabItems.forEach(item => {
      const titleElement = item.querySelector('strong');
      if (titleElement) {
        titles.push(titleElement.textContent);
      }
    });
    return titles;
  }

  // ==================== URL BLOCKER FUNCTIONALITY ====================
  const addSiteBtn = document.getElementById('addSiteBtn');
  const newSiteInput = document.getElementById('newSiteInput');
  const blockedSitesList = document.getElementById('blockedSitesList');

  addSiteBtn.addEventListener('click', addBlockedSite);
  newSiteInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addBlockedSite();
  });

  function addBlockedSite() {
    const url = newSiteInput.value.trim();
    if (url) {
      chrome.storage.local.get(['blockedUrls'], (result) => {
        const blockedUrls = result.blockedUrls || [];
        if (!blockedUrls.includes(url)) {
          blockedUrls.push(url);
          chrome.storage.local.set({ blockedUrls }, loadBlockedSites);
          newSiteInput.value = '';
        }
      });
    }
  }

  function loadBlockedSites() {
    chrome.storage.local.get(['blockedUrls'], (result) => {
      const blockedUrls = result.blockedUrls || [];
      blockedSitesList.innerHTML = '';
      
      blockedUrls.forEach(url => {
        const item = document.createElement('div');
        item.className = 'blocked-site-item';
        item.innerHTML = `
          <span>${url}</span>
          <span class="remove-btn" data-url="${url}">×</span>
        `;
        blockedSitesList.appendChild(item);
      });

      // Add remove event listeners
      document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const urlToRemove = this.getAttribute('data-url');
          removeBlockedSite(urlToRemove);
        });
      });
    });
  }

  function removeBlockedSite(urlToRemove) {
    chrome.storage.local.get(['blockedUrls'], (result) => {
      const blockedUrls = result.blockedUrls || [];
      const newBlockedUrls = blockedUrls.filter(url => url !== urlToRemove);
      chrome.storage.local.set({ blockedUrls: newBlockedUrls }, loadBlockedSites);
    });
  }
});