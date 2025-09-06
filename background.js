// Listen for messages from content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "getTabTitles") {
    chrome.tabs.query({}, function(tabs) {
      const titles = tabs.map(tab => tab.title).filter(title => title);
      sendResponse({tabTitles: titles});
    });
    return true; // Will respond asynchronously
  }
});

// Optional: Listen for tab updates to keep track of title changes
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.title) {
    // Title changed, you could log this or update storage
    console.log(`Tab ${tabId} title changed to: ${changeInfo.title}`);
  }
});