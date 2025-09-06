document.addEventListener('DOMContentLoaded', function() {
  const tabList = document.getElementById('tabList');
  const refreshBtn = document.getElementById('refreshBtn');
  const injectBtn = document.getElementById('injectBtn');

  // Load tab titles when popup opens
  loadTabTitles();

  refreshBtn.addEventListener('click', loadTabTitles);
  
  injectBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "injectTitles",
          tabTitles: getTabTitlesArray()
        }, function(response) {
          if (chrome.runtime.lastError || !response || response.status !== "success") {
            // Try programmatic injection as fallback
            chrome.scripting.executeScript({
              target: {tabId: tabs[0].id},
              files: ['content.js']
            }, () => {
              // Try sending the message again
              chrome.tabs.sendMessage(tabs[0].id, {
                action: "injectTitles",
                tabTitles: getTabTitlesArray()
              }, function(response2) {
                if (response2 && response2.status === "success") {
                  alert("Tab titles injected successfully!");
                } else {
                  alert("Failed to inject titles. Make sure you're on a supported page.");
                }
              });
            });
          } else {
            alert("Tab titles injected successfully!");
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
});