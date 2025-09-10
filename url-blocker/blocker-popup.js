// URL Blocker functionality - Separate file
document.addEventListener('DOMContentLoaded', function() {
  // Tab switching functionality
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.getAttribute('data-tab');
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));
      
      tab.classList.add('active');
      document.getElementById(tabName + 'Content').classList.add('active');
      
      // If switching to blocker tab, load blocked URLs
      if (tabName === 'blocker') {
        loadBlockedUrls();
      }
    });
  });
  
  // URL Blocker specific functionality
  const urlInput = document.getElementById('urlInput');
  const addUrlBtn = document.getElementById('addUrl');
  const blockedUrlsList = document.getElementById('blockedUrls');
  const toggleBlockingBtn = document.getElementById('toggleBlocking');
  
  let blockedUrls = [];
  let isEnabled = true;
  
  function loadBlockedUrls() {
    // Load blocked URLs and enabled status
    chrome.storage.sync.get(['blockedUrls', 'isEnabled'], function(data) {
      blockedUrls = data.blockedUrls || [];
      isEnabled = data.isEnabled !== undefined ? data.isEnabled : true;
      
      updateBlockedUrlsList();
      updateToggleButton();
    });
  }
  
  // Add URL to blocklist
  addUrlBtn.addEventListener('click', function() {
    let url = urlInput.value.trim();
    
    // Add https:// if no protocol specified
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    
    try {
      // Validate URL
      new URL(url);
      
      if (url && !blockedUrls.includes(url)) {
        blockedUrls.push(url);
        chrome.storage.sync.set({ blockedUrls }, function() {
          updateBlockedUrlsList();
          urlInput.value = '';
        });
      }
    } catch (e) {
      alert('Please enter a valid URL');
    }
  });
  
  // Remove URL from blocklist
  function removeUrl(index) {
    blockedUrls.splice(index, 1);
    chrome.storage.sync.set({ blockedUrls }, updateBlockedUrlsList);
  }
  
  // Toggle blocking on/off
  toggleBlockingBtn.addEventListener('click', function() {
    isEnabled = !isEnabled;
    chrome.storage.sync.set({ isEnabled }, function() {
      updateToggleButton();
      
      // Reload current tab to apply changes
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.reload(tabs[0].id);
      });
    });
  });
  
  // Update the blocked URLs list UI
  function updateBlockedUrlsList() {
    blockedUrlsList.innerHTML = '';
    
    if (blockedUrls.length === 0) {
      const emptyState = document.createElement('li');
      emptyState.className = 'empty-state';
      emptyState.textContent = 'No URLs blocked yet';
      blockedUrlsList.appendChild(emptyState);
      return;
    }
    
    blockedUrls.forEach((url, index) => {
      const li = document.createElement('li');
      
      // Create a shorter display version of the URL
      const urlObj = new URL(url);
      let displayUrl = urlObj.hostname + urlObj.pathname;
      if (displayUrl.length > 40) {
        displayUrl = displayUrl.substring(0, 40) + '...';
      }
      
      li.innerHTML = `
        <span title="${url}">${displayUrl}</span>
        <button class="remove-btn" data-index="${index}">Remove</button>
      `;
      blockedUrlsList.appendChild(li);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        removeUrl(index);
      });
    });
  }
  
  // Update the toggle button text and style
  function updateToggleButton() {
    if (isEnabled) {
      toggleBlockingBtn.textContent = 'Disable Blocking';
      toggleBlockingBtn.classList.remove('disabled');
    } else {
      toggleBlockingBtn.textContent = 'Enable Blocking';
      toggleBlockingBtn.classList.add('disabled');
    }
  }
});