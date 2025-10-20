// Content script for kbutkiew Tools extension

// Function to set focus on Duration field
function setFocusOnDurationField() {
  try {
    // Find Duration field by different methods
    let durationField = document.querySelector('#durationField');
    
    if (!durationField) {
      durationField = document.querySelector('[data-testid="durationField"]');
    }
    
    if (!durationField) {
      durationField = document.querySelector('input[name="durationField"]');
    }
    
    if (!durationField) {
      // Try finding by label
      const labels = document.querySelectorAll('label');
      for (const label of labels) {
        if (label.textContent.includes('Duration')) {
          const parentRow = label.closest('[data-testid="dateAndTimeField"]') ||
            label.closest('div[class*="kdTzIY"]') ||
            label.closest('div');
          if (parentRow) {
            durationField = parentRow.querySelector('input[type="text"]');
            if (durationField) break;
          }
        }
      }
    }
    
    if (durationField) {
      durationField.focus();
      durationField.click();
    }
  } catch (e) {
    // Ignore errors
  }
}

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
    if (window.location.href.includes('app.tempo.io/timesheets/jira/worklog-form') ||
        window.location.href.includes('app.eu.tempo.io/timesheets/jira/worklog-form')) {
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
             window.location.href.includes('app.tempo.io') ||
             window.location.href.includes('app.eu.tempo.io')) {
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

      // Find Area field - updated to match new structure
      let areaField = document.querySelector('#_Area_-5');

      // Try the container class
      if (!areaField) {
        areaField = document.querySelector('.css-b62m3t-container[id*="Area"]');
      }

      // Try finding by label
      if (!areaField) {
        const labels = document.querySelectorAll('label');
        for (const label of labels) {
          if (label.textContent.includes('Area')) {
            const parentRow = label.closest('[data-testid="rowAnimationWrapper"]') ||
              label.closest('[data-testid="staticListWorkAttributeField"]');
            if (parentRow) {
              areaField = parentRow.querySelector('.css-b62m3t-container') ||
                parentRow.querySelector('[id*="Area"]');
              if (areaField) break;
            }
          }
        }
      }

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

      // Find the control and input
      const control = areaField.querySelector('.css-lherp9-control') ||
        areaField.querySelector('div[class*="control"]');

      if (!control) {
        if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
        }
        return;
      }

      const input = control.querySelector('input[id*="Area"]') ||
        control.querySelector('input[role="combobox"]') ||
        control.querySelector('input');

      if (!input) {
        if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
        }
        return;
      }

      // Click to open dropdown
      input.focus();
      input.click();
      control.click();

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
          input.dispatchEvent(new Event('change', { bubbles: true }));
          input.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            bubbles: true
          }));
        }

        clearInterval(checkInterval);

        // Set focus on Duration field after Area is set
        setTimeout(() => {
          setFocusOnDurationField();
        }, 300);
      }, 500);

    } catch (error) {
      clearInterval(checkInterval);
    }
  }, 500);
}

// Run script
safeExecute(); 