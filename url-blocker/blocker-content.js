// URL Blocker content script - Separate file
(function() {
  // Check if the current page should be blocked
  chrome.storage.sync.get(['blockedUrls', 'isEnabled'], function(data) {
    const blockedUrls = data.blockedUrls || [];
    const isEnabled = data.isEnabled !== undefined ? data.isEnabled : true;
    
    if (!isEnabled) return;
    
    const currentUrl = window.location.href;
    
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
      // Replace the page content with a blocking message
      document.body.innerHTML = `
        <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif; background: #f9f9f9; height: 100vh; display: flex; flex-direction: column; justify-content: center;">
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto;">
            <h1 style="color: #e53935; margin-top: 0;">URL Blocked</h1>
            <p>This specific URL has been blocked by the URL Blocker extension:</p>
            <p style="font-weight: bold; word-break: break-all;">${currentUrl}</p>
            <p>You can still access other parts of this website.</p>
            <div style="margin-top: 25px;">
              <button id="goToHomepage" style="padding: 10px 20px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
                Go to Website Homepage
              </button>
              <button id="unblockTemporarily" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Unblock for 5 minutes
              </button>
            </div>
          </div>
        </div>
      `;
      
      // Add event listener for going to homepage
      document.getElementById('goToHomepage').addEventListener('click', function() {
        const url = new URL(currentUrl);
        window.location.href = url.origin;
      });
      
      // Add event listener for temporary unblock
      document.getElementById('unblockTemporarily').addEventListener('click', function() {
        // Disable blocking temporarily
        chrome.storage.sync.set({ isEnabled: false }, function() {
          // Reload the page
          window.location.reload();
        });
        
        // Re-enable after 5 minutes
        setTimeout(function() {
          chrome.storage.sync.set({ isEnabled: true });
        }, 5 * 60 * 1000);
      });
    }
  });
})();