// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "injectTitles") {
    injectTabTitles(request.tabTitles);
    sendResponse({status: "success"});
  }
  return true;
});

function injectTabTitles(tabTitles) {
  // Create a container for the tab titles
  const container = document.createElement('div');
  container.id = 'tab-titles-container';
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border: 2px solid #007bff;
    border-radius: 8px;
    padding: 15px;
    max-width: 300px;
    max-height: 400px;
    overflow-y: auto;
    z-index: 10000;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    font-family: Arial, sans-serif;
  `;

  // Create header
  const header = document.createElement('h3');
  header.textContent = 'All Open Tab Titles';
  header.style.marginTop = '0';
  header.style.color = '#007bff';
  container.appendChild(header);

  // Create list of titles
  const list = document.createElement('ul');
  list.style.paddingLeft = '20px';
  list.style.marginBottom = '10px';

  tabTitles.forEach(title => {
    const listItem = document.createElement('li');
    listItem.textContent = title;
    listItem.style.marginBottom = '5px';
    listItem.style.wordWrap = 'break-word';
    list.appendChild(listItem);
  });

  container.appendChild(list);

  // Create close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.style.cssText = `
    background: #007bff;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  `;
  closeButton.onclick = function() {
    document.body.removeChild(container);
  };
  container.appendChild(closeButton);

  // Add container to the page
  document.body.appendChild(container);
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