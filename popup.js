document.addEventListener('DOMContentLoaded', () => {
  // Cache DOM elements
  const elements = {
    redirectEnabled: document.getElementById('redirectEnabled'),
    areaSetterEnabled: document.getElementById('areaSetterEnabled'),
    homepage: document.getElementById('homepage'),
    userRole: document.getElementById('userRole'),
    status: document.getElementById('status'),
    save: document.getElementById('save'),
    reminderEnabled: document.getElementById('reminderEnabled'),
    reminderTime: document.getElementById('reminderTime'),
    testReminder: document.getElementById('testReminder')
  };

  // Load saved settings with default values
  chrome.storage.sync.get({
    redirectEnabled: true,
    areaSetterEnabled: true,
    homepage: 'https://www.google.com',
    userRole: 'BED',
    reminderEnabled: true,
    reminderTime: '15:30'
  }, (settings) => {
    elements.redirectEnabled.checked = settings.redirectEnabled;
    elements.areaSetterEnabled.checked = settings.areaSetterEnabled;
    elements.homepage.value = settings.homepage;
    elements.userRole.value = settings.userRole;
    elements.reminderEnabled.checked = settings.reminderEnabled;
    elements.reminderTime.value = settings.reminderTime;
  });

  // Save settings handler
  elements.save.addEventListener('click', () => {
    const homepage = elements.homepage.value.trim();
    const userRole = elements.userRole.value;
    const redirectEnabled = elements.redirectEnabled.checked;
    const areaSetterEnabled = elements.areaSetterEnabled.checked;
    const reminderEnabled = elements.reminderEnabled.checked;
    const reminderTime = elements.reminderTime.value;

    // Format homepage URL if needed
    let formattedHomepage = homepage;
    if (homepage && !homepage.startsWith('http://') && !homepage.startsWith('https://')) {
      formattedHomepage = 'https://' + homepage;
    }

    // Save to storage
    chrome.storage.sync.set({
      redirectEnabled,
      areaSetterEnabled,
      homepage: formattedHomepage,
      userRole,
      reminderEnabled,
      reminderTime
    }, () => {
      elements.status.classList.add('show');
      setTimeout(() => elements.status.classList.remove('show'), 2000);
    });
  });

  // Real-time URL validation
  elements.homepage.addEventListener('input', (e) => {
    const input = e.target;
    
    if (input.value.trim() === '') {
      input.classList.remove('error');
      elements.save.disabled = false;
      return;
    }

    try {
      new URL(input.value.startsWith('http') ? input.value : 'https://' + input.value);
      input.classList.remove('error');
      elements.save.disabled = false;
    } catch {
      input.classList.add('error');
      elements.save.disabled = true;
    }
  });

  // Time check button handler
  document.getElementById('checkTime')?.addEventListener('click', () => {
    const button = document.getElementById('checkTime');
    button.textContent = 'Checking...';
    button.disabled = true;

    chrome.runtime.sendMessage({ type: 'CHECK_TIME_NOW' });

    setTimeout(() => {
      button.textContent = 'Check Logged Time';
      button.disabled = false;
    }, 2000);
  });

  // Test reminder button handler
  elements.testReminder.addEventListener('click', () => {
    // Reset last reminder date
    chrome.storage.local.remove(['lastReminderDate'], () => {
      // Continue with sending test reminder
      chrome.runtime.sendMessage({ type: 'TEST_REMINDER' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Test reminder error:', chrome.runtime.lastError);
          elements.status.textContent = 'Error sending reminder!';
          elements.status.style.backgroundColor = '#E74C3C';
        } else {
          console.log('Test reminder response:', response);
        }
      });
    });
    // Show test reminder information
    elements.status.textContent = 'Test reminder sent!';
    elements.status.style.backgroundColor = '#4CAF50';
    elements.status.classList.add('show');
    setTimeout(() => {
      elements.status.classList.remove('show');
    }, 3000);
  });
});
