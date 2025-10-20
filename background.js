// Background script for kbutkiew Tools

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get('homepage', function (result) {
    if (!result.homepage) {
      chrome.storage.sync.set({ homepage: 'https://www.google.com' }, function () {
        // Default homepage set
      });
    }
  });

  // Set reminder after installation/update
  chrome.alarms.create('reminderAlarm', {
    periodInMinutes: 1
  });

  // Reset the last reminder date to make it possible to receive it today
  const resetDate = new Date();
  resetDate.setDate(resetDate.getDate() - 1); // yesterday
  chrome.storage.local.set({ lastReminderDate: resetDate.toDateString() });
});

// Helper functions
const isNewTab = (tab) => tab.pendingUrl === 'chrome://newtab/' || tab.url === 'chrome://newtab/';

// Function displaying the reminder
function showReminder() {
  try {
    chrome.notifications.create('tempo-reminder', {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon48.png'),
      title: 'Work Time Reminder',
      message: 'Remember to log your work time in Tempo!',
      buttons: [
        { title: 'Open Tempo' }
      ],
      priority: 2
    }, (notificationId) => {
      if (chrome.runtime.lastError) {
      } else {
      }
    });

    // Alternative method - open popup with reminder
    chrome.tabs.create({
      url: chrome.runtime.getURL('reminder.html'),
      active: true
    });
  } catch (error) {
  }
}

// Alarm handler
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'reminderAlarm') {
    checkTimeForReminder();
  }
});

// Set alarm every minute
chrome.alarms.create('reminderAlarm', {
  periodInMinutes: 1
});

// Function checking time
async function checkTimeForReminder() {
  const today = new Date();
  const dateString = today.toDateString();

  // Debug - save the last check time
  chrome.storage.local.set({ lastCheckTime: new Date().toString() });

  // Check if we already displayed the reminder today
  const result = await chrome.storage.local.get(['lastReminderDate']);
  if (result.lastReminderDate === dateString) {
    // We already displayed a reminder today
    return;
  }

  // Get reminder settings
  const settings = await chrome.storage.sync.get(['reminderEnabled', 'reminderTime']);
  if (!settings.reminderEnabled) return;

  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();

  // Parse reminder time (format "HH:MM")
  const [reminderHours, reminderMinutes] = settings.reminderTime.split(':').map(Number);

  // Check if it's time for a reminder
  if (currentHours === reminderHours &&
    currentMinutes >= reminderMinutes &&
    currentMinutes < reminderMinutes + 5) {
    // Display reminder
    showReminder();

    // Save the date when reminder was displayed
    chrome.storage.local.set({ lastReminderDate: dateString });
  }
}

// Handle notification click
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (notificationId === 'tempo-reminder' && buttonIndex === 0) {
    // Open Tempo in new tab
    chrome.tabs.create({ url: 'https://dentsu-poland.atlassian.net/plugins/servlet/ac/io.tempo.jira/tempo-app' });
  }
});

// New tabs handler
chrome.tabs.onCreated.addListener((tab) => {
  chrome.storage.sync.get(['redirectEnabled', 'redirectUrl'], (result) => {
    if (result.redirectEnabled && result.redirectUrl) {
      const redirectUrl = result.redirectUrl.trim();

      if (redirectUrl && (redirectUrl.startsWith('http://') || redirectUrl.startsWith('https://'))) {
        // Check if this is a new tab (without URL)
        if (tab.pendingUrl === 'chrome://newtab/' || tab.url === 'chrome://newtab/') {
          chrome.tabs.update(tab.id, { url: redirectUrl });
        }
      }
    }
  });
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && isNewTab(tab)) {
    chrome.storage.sync.get(['redirectEnabled', 'homepage'], ({ redirectEnabled, homepage }) => {
      if (!redirectEnabled || !homepage) return;
      chrome.tabs.update(tabId, { url: homepage });
    });
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TEMPO_DEBUG') {
    // Debug messages (disabled in production)
  }
  
  if (message.type === 'EXECUTE_TEMPO_HELPER') {
    const tabId = sender.tab ? sender.tab.id : null;

    // If tabId not provided, use active tab
    if (!tabId) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length > 0) {
          executeTempoHelper(tabs[0].id, sendResponse);
        }
      });
      return true;
    }

    // Execute for specified tab
    executeTempoHelper(tabId, sendResponse);
    return true;
  }

  // Handle test reminder
  if (message.type === 'TEST_REMINDER') {
    showReminder();
    sendResponse({ success: true, message: 'Test notification sent' });
    return true;
  }

  // Handle reminder tab closing
  if (message.type === 'CLOSE_CURRENT_TAB') {
    // Close tab from which the message came
    chrome.tabs.remove(sender.tab.id);
  }
});

// Function to inject helper.js
function executeTempoHelper(tabId, sendResponse) {
  // Get settings
  chrome.storage.sync.get(['userRole', 'areaSetterEnabled'], (result) => {
    if (result.areaSetterEnabled === false) {
      if (sendResponse) sendResponse({ success: false, reason: 'disabled' });
      return;
    }
    
    const userRole = result.userRole || 'BED';
    
    // First inject variable with user role
    chrome.scripting.executeScript({
      target: { tabId: tabId, allFrames: true },
      func: (role) => {
        window.tempoHelperUserRole = role;
      },
      args: [userRole]
    }, () => {
      // Then inject helper script
      chrome.scripting.executeScript({
        target: { tabId: tabId, allFrames: true },
        files: ['helper.js']
      }, () => {
        if (sendResponse) sendResponse({ success: true });
      });
    });
  });
}