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
          tabItem.textContent = tab.title;
          tabList.appendChild(tabItem);
        }
      });
    });
  }

  function getTabTitlesArray() {
    const tabItems = tabList.querySelectorAll('.tab-item');
    const titles = [];
    tabItems.forEach(item => {
      titles.push(item.textContent);
    });
    return titles;
  }
});