// background.js - FIXED

// Store the list of target URLs for automatic injection
const TARGET_URLS = [
    'https://joshgaviola.github.io/antiprocrastintor/',
    'http://localhost/', // For development
    'file:///' // This will match ANY local file. Be cautious.
];

// Check if a tab is one of our target tabs
function isTargetTab(tab) {
    if (!tab.url) return false;
    return TARGET_URLS.some(targetUrl => tab.url.startsWith(targetUrl));
}

// Main function: get all tabs and inject data into target tabs
function injectTitlesToTargetTab() {
    chrome.tabs.query({}, function(allTabs) {
        // Prepare the data to send: just titles and URLs
        const tabData = allTabs
            .filter(tab => tab.title && tab.url) // Filter out invalid tabs
            .map(tab => ({ title: tab.title, url: tab.url })); // Map to simple objects

        // Find all target tabs and send them the data
        allTabs.forEach(tab => {
            if (isTargetTab(tab)) {
                chrome.tabs.sendMessage(tab.id, {
                    action: "injectTitles",
                    tabData: tabData // Send the prepared data
                }).catch(error => {
                    // This is normal if the page hasn't loaded or content script isn't ready
                    console.debug('Could not send message to tab:', tab.id, error);
                });
            }
        });
    });
}

// Debounce function to prevent excessive calls on rapid events
let debounceTimer;
function debouncedInjectTitles() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(injectTitlesToTargetTab, 100); // Wait 100ms after last event
}

// Event listeners for automatic updates
chrome.tabs.onCreated.addListener(debouncedInjectTitles);
chrome.tabs.onRemoved.addListener(debouncedInjectTitles);
chrome.tabs.onUpdated.addListener(debouncedInjectTitles); // Now debounced

// Initial injection
chrome.runtime.onStartup.addListener(injectTitlesToTargetTab);
chrome.runtime.onInstalled.addListener(injectTitlesToTargetTab);

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getTabInfo") {
        chrome.tabs.query({}, function(tabs) {
            sendResponse({ tabs: tabs.map(tab => ({ title: tab.title, url: tab.url })) });
        });
        return true; // Needed for async response
    }
});

// ==================== URL BLOCKER FUNCTIONALITY ====================

// Listen for every navigation and block URLs from our list
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  // Check if this URL is in our blocklist
  chrome.storage.local.get(['blockedUrls'], (result) => {
    const blockedUrls = result.blockedUrls || [];
    const currentUrl = details.url.toLowerCase();
    
    // Check if current URL matches any in our blocklist
    const shouldBlock = blockedUrls.some(blockedUrl => 
      currentUrl.includes(blockedUrl.toLowerCase())
    );
    
    if (shouldBlock) {
      // Redirect to a simple block page
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL('blocked.html') + '?url=' + encodeURIComponent(currentUrl)
      });
    }
  });
});

// Initialize empty blocklist if none exists
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(['blockedUrls'], (result) => {
    if (!result.blockedUrls) {
      chrome.storage.local.set({ blockedUrls: [] });
    }
  });
});