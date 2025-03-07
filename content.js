// Content script for kbutkiew Tools extension

// Function for safely executing code
function safeExecute() {
  try {
    // Check if we are in an iframe
    const isInIframe = window !== window.top;
    
    // Logger
    const log = (msg) => {
      try {
        chrome.runtime.sendMessage({ type: 'TEMPO_DEBUG', text: msg });
      } catch (e) { /* ignore */ }
    };

    // Check if we are directly on Tempo page
    if (window.location.href.includes('app.tempo.io/timesheets/jira/worklog-form')) {
      log('Detected Tempo worklog form page');
      
      // Get user settings
      chrome.storage.sync.get(['userRole', 'areaSetterEnabled'], (result) => {
        const userRole = result.userRole || 'BED';
        if (result.areaSetterEnabled !== false) {
          // Set Area directly in this context
          setAreaInTempoForm(userRole);
        }
      });
    }
    // Check different Tempo URL variants
    else if (window.location.href.includes('/plugins/servlet/ac/io.tempo.jira/tempo-app') || 
             window.location.href.includes('app.tempo.io')) {
      log('Detected Tempo timesheet page');
      
      // Inject helper script right after page load
      setTimeout(() => {
        chrome.runtime.sendMessage({
          type: 'EXECUTE_TEMPO_HELPER',
          tabId: null
        });
      }, 2000);
      
      // Listen for clicks (more generally)
      document.addEventListener('click', (e) => {
        const clickTarget = e.target.tagName;
        
        // If clicked on iframe or button
        if (clickTarget === 'IFRAME' || clickTarget === 'BUTTON') {
          setTimeout(() => {
            chrome.runtime.sendMessage({
              type: 'EXECUTE_TEMPO_HELPER',
              tabId: null
            });
          }, 500);
        }
      });
    }
  } catch (err) {
    // Ignore errors to not interrupt page functioning
  }
}

// Function for setting Area in Tempo form
function setAreaInTempoForm(userRole) {
  let attempts = 0;
  const maxAttempts = 20;
  
  // Check every 500ms
  const checkInterval = setInterval(() => {
    attempts++;
    
    try {
      // Find the form
      const form = document.querySelector('#worklogForm');
      if (!form) {
        if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
        }
        return;
      }
      
      // Find Area field
      const areaField = document.querySelector('#_Area_-5') || 
                       document.querySelector('[id*="Area"]');
      
      if (!areaField) {
        if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
        }
        return;
      }
      
      // Check if Area is already set
      const currentValue = areaField.querySelector('[class*="singleValue"]');
      if (currentValue && currentValue.textContent.includes(userRole)) {
        clearInterval(checkInterval);
        return;
      }
      
      // Find input
      const input = areaField.querySelector('input');
      if (!input) {
        clearInterval(checkInterval);
        return;
      }
      
      // Click to open dropdown
      input.click();
      
      // Set value
      setTimeout(() => {
        const options = document.querySelectorAll('[class*="option"]');
        
        let found = false;
        for (const option of options) {
          if (option.textContent.includes(userRole)) {
            option.click();
            found = true;
            break;
          }
        }
        
        if (!found) {
          input.value = userRole;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            bubbles: true
          }));
        }
        
        clearInterval(checkInterval);
      }, 500);
      
    } catch (error) {
      clearInterval(checkInterval);
    }
  }, 500);
}

// Run script
safeExecute(); 