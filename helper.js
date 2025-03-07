// Helper script for Tempo
(function() {
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
        const hasTimeField = !!dialog.querySelector('input[name="timeSpent"]');
        const hasDateField = !!dialog.querySelector('input[type="date"]') || 
                            !!dialog.querySelector('[aria-label*="date"]');
        const hasTimeLabel = Array.from(dialog.querySelectorAll('label')).some(l => 
                            l.textContent.toLowerCase().includes('time') || 
                            l.textContent.toLowerCase().includes('hours'));
        
        if (hasTimeField || hasDateField || hasTimeLabel) {
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
      
      // Search by labels
      if (!areaField) {
        const labels = dialog.querySelectorAll('label');
        for (const label of labels) {
          if (label.textContent.includes('Area')) {
            const field = label.closest('div[class*="field"]');
            if (field) {
              areaField = field;
              break;
            }
          }
        }
      }
      
      // Search for selects
      if (!areaField) {
        const selects = dialog.querySelectorAll('div[class*="Select"]');
        for (const select of selects) {
          const parentDiv = select.closest('div[class*="field"]');
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
        
        // Find input and set value
        const select = areaField.querySelector('div[class*="control"]') || areaField;
        if (!select) {
          return;
        }
        
        // Click to open
        select.click();
        
        // Wait for dropdown and select option
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
            const input = select.querySelector('input');
            if (input) {
              input.value = userRole;
              input.dispatchEvent(new Event('input', { bubbles: true }));
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