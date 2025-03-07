# kbutkiew Tools

**Version: 2.1.0**

## Installation

1. Download the `kbutkiew-tools.zip` file
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode" (top-right corner)
4. Drag and drop the downloaded .zip file onto the extensions page
   or
   Click "Load unpacked" and select the unzipped folder

## Features

### 1. Automatic New Tab Redirect
- Redirects new tab to your selected page
- To configure:
  1. Click the extension icon in Chrome toolbar
  2. In the "New Tab Redirect" section:
     - Enable/disable the feature using the toggle switch
     - Enter the target URL (e.g., https://example.com)

### 2. Automatic Area Setting in Tempo
- Works in both Tempo in Jira and standalone Tempo application
- Handles dynamically loaded forms and dialogs
- Works in iframes
- To configure:
  1. Click the extension icon in Chrome toolbar
  2. In the "Jira Area Setter" section:
     - Enable/disable the feature using the toggle switch
     - Select the default Area from the dropdown list:
       - BED (Back-end Development)
       - FED (Front-end Development)
       - QA (Quality Assurance)
       - PM (Project Management)
       - Design
       - CE
       - TL
       - DevOps

### 3. Time Logging Reminder
- Daily reminder to log your work time
- Two-stage system: Chrome notification and informational page
- Displayed at 15:30 by default (configurable)
- Button to immediately open Tempo
- To configure:
  1. Click the extension icon in Chrome toolbar
  2. In the "Time Reminder" section:
     - Enable/disable the feature using the toggle switch
     - Set the reminder time in HH:MM format
- Option to test the reminder using the "Test Reminder" button

### Saving Settings
- After any settings change, click the "Save Changes" button
- A green confirmation message will appear: "Settings saved successfully!"

## Tips
- If new tab redirect doesn't work, make sure:
  - The feature is enabled
  - The URL is correct (includes http:// or https://)
- If automatic Area setting doesn't work:
  - Make sure the feature is enabled
  - Refresh the Jira/Tempo page
  - Try clicking "Log Time" or "Log Work" again
  - Check the browser console (F12) for any errors

## Update
1. Remove the old version of the extension:
   - Open Chrome and navigate to `chrome://extensions`
   - Find "kbutkiew Tools"
   - Click "Remove"
2. Install the new version:
   - Follow the installation steps described above
   - Your previous settings will be preserved

## Changes in the Latest Version
- Added daily reminder for logging work time
- Added configurable reminder time settings
- Significantly improved Tempo detection and handling
- Resolved issues with Content Security Policy (CSP)
- Added automatic operation without the need to click a button
- Full list of changes available in the `CHANGELOG.md` file 