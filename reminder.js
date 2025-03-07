document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('openTempo').addEventListener('click', function() {
    // Open Tempo in a new tab
    const tempoUrl = 'https://dentsu-poland.atlassian.net/plugins/servlet/ac/io.tempo.jira/tempo-app';
    chrome.tabs.create({ url: tempoUrl }, (tab) => {
      // After opening the tab, inject script with delay
      setTimeout(() => {
        chrome.tabs.executeScript(tab.id, {
          code: `
            // Call helper.js injection with delay
            setTimeout(() => {
              chrome.runtime.sendMessage({ type: 'EXECUTE_TEMPO_HELPER' });
            }, 2000);
          `
        });
      }, 3000);
    });
    // Close the reminder tab
    window.close();
  });
  
  document.getElementById('closeBtn').addEventListener('click', function() {
    // Get current tab ID and close it
    chrome.tabs.getCurrent(function(tab) {
      if (tab) {
        chrome.tabs.remove(tab.id);
      } else {
        // Fallback in case the API doesn't work
        window.close();
      }
    });
  });
}); 