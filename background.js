// Helper: inject tab titles into the target tab(s)
function injectTitlesToTargetTab() {
  chrome.tabs.query({}, function(tabs) {
    const titles = tabs.map(tab => tab.title).filter(title => title);
    // Find all target tabs
    tabs.forEach(tab => {
      if (tab.url && tab.url.startsWith('https://joshgaviola.github.io/antiprocrastintor/') ||
      tab.url.startsWith('file:///D:/project/web/extensions/final/index.html')) {
        // Only send the message, do NOT inject the script again
        chrome.tabs.sendMessage(tab.id, {
          action: "injectTitles",
          tabTitles: titles
        });
      }
    });
  });
}

// Keep event listeners for instant updates
chrome.tabs.onCreated.addListener(() => injectTitlesToTargetTab());
chrome.tabs.onRemoved.addListener(() => injectTitlesToTargetTab());
chrome.tabs.onUpdated.addListener(() => injectTitlesToTargetTab());

chrome.runtime.onStartup.addListener(injectTitlesToTargetTab);
chrome.runtime.onInstalled.addListener(injectTitlesToTargetTab);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getTabInfo") {
    chrome.tabs.query({}, function(tabs) {
      // Send back array of {title, url}
      sendResponse({tabs: tabs.map(tab => ({title: tab.title, url: tab.url}))});
    });
    return true; // Needed for async response
  }
});