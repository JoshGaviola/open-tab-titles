// background.js - FIXED (URL blocker removed)

// Store the list of target URLs for automatic injection
const TARGET_URLS = [
    'https://joshgaviola.github.io/antiprocrastintor/',
    'http://localhost/',
    'file:///'
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
            .filter(tab => tab.title && tab.url)
            .map(tab => ({ title: tab.title, url: tab.url }));

        // Find all target tabs and send them the data
        allTabs.forEach(tab => {
            if (isTargetTab(tab)) {
                chrome.tabs.sendMessage(tab.id, {
                    action: "injectTitles",
                    tabData: tabData
                }).catch(error => {
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
    debounceTimer = setTimeout(injectTitlesToTargetTab, 100);
}

// Event listeners for automatic updates
chrome.tabs.onCreated.addListener(debouncedInjectTitles);
chrome.tabs.onRemoved.addListener(debouncedInjectTitles);
chrome.tabs.onUpdated.addListener(debouncedInjectTitles);

// Initial injection
chrome.runtime.onStartup.addListener(injectTitlesToTargetTab);
chrome.runtime.onInstalled.addListener(injectTitlesToTargetTab);

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getTabInfo") {
        chrome.tabs.query({}, function(tabs) {
            sendResponse({ tabs: tabs.map(tab => ({ title: tab.title, url: tab.url })) });
        });
        return true;
    }
});