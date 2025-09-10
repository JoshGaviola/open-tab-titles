// URL Blocker background script - Separate file

// Listen for navigation events
chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
  // Only process main frame requests
  if (details.frameId !== 0) return;
  
  chrome.storage.sync.get(['blockedUrls', 'isEnabled'], function(data) {
    const blockedUrls = data.blockedUrls || [];
    const isEnabled = data.isEnabled !== undefined ? data.isEnabled : true;
    
    if (!isEnabled) return;
    
    const currentUrl = details.url;
    
    // Check if the current URL is blocked
    const isBlocked = blockedUrls.some(url => {
      try {
        // Compare URLs after normalizing
        const blockedUrl = new URL(url);
        const targetUrl = new URL(currentUrl);
        
        // Check if hostname and pathname match
        return blockedUrl.hostname === targetUrl.hostname && 
               blockedUrl.pathname === targetUrl.pathname;
      } catch (e) {
        console.error('Error comparing URLs:', e);
        return false;
      }
    });
    
    if (isBlocked) {
      // Cancel the navigation
      chrome.tabs.update(details.tabId, {
        url: `javascript:document.write('<h1>URL Blocked</h1><p>This URL has been blocked by the URL Blocker extension.</p>')`
      });
    }
  });
});

// Handle messages from the blocker popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkBlocked") {
    chrome.storage.sync.get(['blockedUrls', 'isEnabled'], function(data) {
      sendResponse({ 
        blockedUrls: data.blockedUrls || [],
        isEnabled: data.isEnabled !== undefined ? data.isEnabled : true
      });
    });
    return true; // Needed for async response
  }
});