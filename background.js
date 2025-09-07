// Helper: inject tab titles into the target tab(s)
function injectTitlesToTargetTab() {
  chrome.tabs.query({}, function(tabs) {
    const titles = tabs.map(tab => tab.title).filter(title => title);
    // Find all target tabs
    tabs.forEach(tab => {
      if (tab.url && tab.url.startsWith('https://joshgaviola.github.io/antiprocrastintor/')) {
        chrome.scripting.executeScript({
          target: {tabId: tab.id},
          files: ['content.js']
        }, () => {
          chrome.tabs.sendMessage(tab.id, {
            action: "injectTitles",
            tabTitles: titles
          });
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