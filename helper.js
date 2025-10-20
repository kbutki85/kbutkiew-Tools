// Helper script for Tempo
(function () {
  // Check if the script has already been run in this context
  if (window.tempoHelperInitialized) {
    return;
  }
  window.tempoHelperInitialized = true;

  // Get settings passed by background script
  const userRole = window.tempoHelperUserRole || 'BED';

  // Look for time logging dialog
  function findWorklogDialog() {
    // checkInterval variable must be available in the entire findWorklogDialog function
    let checkInterval;

    // Immediately check if dialogs exist
    const existingDialogs = document.querySelectorAll('div[role="dialog"]');
    if (existingDialogs.length > 0) {
      checkDialogsForWorklog(existingDialogs);
    }

    // Check every 300ms for 10 seconds (30 attempts)
    let attempts = 0;
    checkInterval = setInterval(() => {
      attempts++;
      if (attempts > 30) {
        clearInterval(checkInterval);
        return;
      }

      // Search for dialogs using different methods
      const dialogs = document.querySelectorAll('div[role="dialog"], [aria-modal="true"], .tempo-dialog, section[role="dialog"]');

      if (dialogs.length === 0) return;

      checkDialogsForWorklog(dialogs);
    }, 300);

    function checkDialogsForWorklog(dialogs) {
      // Check if any contains a time logging form
      for (const dialog of dialogs) {
        // Look for characteristic elements of the time logging form
        const hasWorklogForm = !!dialog.querySelector('#worklogForm');
        const hasDurationField = !!dialog.querySelector('#durationField');
        const hasTimeField = !!dialog.querySelector('input[name="timeSpent"]');
        const hasDateField = !!dialog.querySelector('input[type="date"]') || 
                            !!dialog.querySelector('[aria-label*="date"]') ||
                            !!dialog.querySelector('#startedField');
        const hasTimeLabel = Array.from(dialog.querySelectorAll('label')).some(l => 
                            l.textContent.toLowerCase().includes('time') || 
                            l.textContent.toLowerCase().includes('duration') ||
                            l.textContent.toLowerCase().includes('hours'));
        
        if (hasWorklogForm || hasDurationField || hasTimeField || hasDateField || hasTimeLabel) {
          clearInterval(checkInterval);
          
          // Find and set Area field
          setAreaInDialog(dialog);
          return;
        }
      }
    }
  }

  // Function to find Area field in dialog
  function setAreaInDialog(dialog) {
    let attempts = 0;
    const checkArea = setInterval(() => {
      attempts++;
      
      if (attempts > 20) {
        clearInterval(checkArea);
        return;
      }
      
      // Look for Area field using different methods
      let areaField = dialog.querySelector('#_Area_-5');

      // Also try to find by the container div with the CSS class
      if (!areaField) {
        areaField = dialog.querySelector('.css-b62m3t-container[id*="Area"]');
      }
      
      // Search by labels
      if (!areaField) {
        const labels = dialog.querySelectorAll('label');
        for (const label of labels) {
          if (label.textContent.includes('Area')) {
            // Find the parent container with the react-select
            const parentRow = label.closest('[data-testid="rowAnimationWrapper"]') || 
                             label.closest('[data-testid="staticListWorkAttributeField"]') ||
                             label.closest('div[class*="jbuQR"]');
            if (parentRow) {
              areaField = parentRow.querySelector('.css-b62m3t-container') || 
                         parentRow.querySelector('[id*="Area"]');
              if (areaField) break;
            }
          }
        }
      }
      
      // Search for selects by looking for the specific react-select structure
      if (!areaField) {
        const selects = dialog.querySelectorAll('.css-b62m3t-container');
        for (const select of selects) {
          const selectId = select.id || select.getAttribute('id');
          if (selectId && selectId.includes('Area')) {
            areaField = select;
            break;
          }
          
          // Check by label association
          const parentDiv = select.closest('[data-testid="staticListWorkAttributeField"]');
          if (parentDiv) {
            const label = parentDiv.querySelector('label');
            if (label && label.textContent.includes('Area')) {
              areaField = select;
              break;
            }
          }
        }
      }
      
      if (areaField) {
        clearInterval(checkArea);

        // Check if already set
        const currentValue = areaField.querySelector('[class*="singleValue"]');
        if (currentValue && currentValue.textContent.includes(userRole)) {
          return;
        }
        
        // Find the control div and input
        const control = areaField.querySelector('.css-lherp9-control') || 
                       areaField.querySelector('div[class*="control"]');
        
        if (!control) {
          return;
        }
        
        // Find the input element
        const input = control.querySelector('input[id*="Area"]') || 
                     control.querySelector('input[role="combobox"]') ||
                     control.querySelector('input');
        
        if (!input) {
          return;
        }
        
        // Click to open dropdown
        input.focus();
        input.click();
        control.click();
        
        // Wait for dropdown and select option
        setTimeout(() => {
          // Look for options in the dropdown menu
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
            // Fallback: try typing the value
            if (input) {
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
          }
        }, 500);
      }
    }, 300);
  }

  // Run search
  findWorklogDialog();

  // Additionally: observe DOM changes to detect dialog that appears later
  try {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== 'childList' || !mutation.addedNodes.length) continue;

        // Check added nodes
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== 1) continue; // DOM elements only

          if (node.matches && (
            node.matches('div[role="dialog"]') ||
            node.matches('[aria-modal="true"]') ||
            node.matches('section[role="dialog"]')
          )) {
            setAreaInDialog(node);
          }

          // Also check inside the added node
          const dialogs = node.querySelectorAll('div[role="dialog"], [aria-modal="true"], section[role="dialog"]');
          if (dialogs.length) {
            for (const dialog of dialogs) {
              setAreaInDialog(dialog);
            }
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  } catch (e) {
    // Ignore errors
  }
})(); 