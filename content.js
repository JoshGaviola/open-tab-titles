// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "injectTitles") {
    injectTabTitles(request.tabTitles);
    sendResponse({status: "success"});
  }
  return true;
});

function injectTabTitles(tabTitles) {
  // Find the #tabs div
  const tabsDiv = document.getElementById('tabs');
  if (!tabsDiv) return;

  // Clear previous content
  tabsDiv.innerHTML = '';

  // Create a list of tab titles
  const list = document.createElement('ul');
  list.style.paddingLeft = '20px';
  list.style.marginBottom = '10px';

  // Get tab info from background (titles + urls)
  chrome.runtime.sendMessage({action: "getTabInfo"}, function(response) {
    if (!response || !response.tabs) return;

    response.tabs.forEach(tab => {
      const listItem = document.createElement('li');
      const link = document.createElement('a');
      link.textContent = tab.title;
      link.href = tab.url;
      link.target = "_blank";
      link.style.cursor = "pointer";
      link.style.textDecoration = "underline";
      link.style.color = "#007bff";

      // Optional: handle click event (e.g., show alert with URL)
      link.addEventListener('click', function(e) {
        e.preventDefault();
        window.open(tab.url, '_blank');
        // Or: alert(tab.url);
      });

      listItem.appendChild(link);
      listItem.style.marginBottom = '5px';
      listItem.style.wordWrap = 'break-word';
      list.appendChild(listItem);
    });

    tabsDiv.appendChild(list);
  });
}

// Optional: Add keyboard shortcut to show titles
document.addEventListener('keydown', function(event) {
  // Ctrl+Shift+T to show titles (if extension is active)
  if (event.ctrlKey && event.shiftKey && event.key === 'T') {
    // Request titles from background script
    chrome.runtime.sendMessage({action: "getTabTitles"}, function(response) {
      if (response && response.tabTitles) {
        injectTabTitles(response.tabTitles);
      }
    });
  }
});