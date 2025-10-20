# Changelog

## Version 2.1.2 (2025-10-20)

### Improved

- Automatic focus on Duration field after Area is set in Tempo "Log Time" modal
- Enhanced user experience for faster time logging workflow

## Version 2.1.1 (2025-10-20)

### Fixed

- Fixed automatic Area selection in Tempo "Log Time" modal
- Added support for EU Tempo domain (app.eu.tempo.io)
- Improved Area field detection to work with new HTML structure
- Enhanced React Select component compatibility

### Improved

- Code cleanup - removed debug logs for production
- All texts and comments translated to English
- Better handling of dynamic content in Tempo modals

## Version 2.1.0 (2025-02-26)

### Added

- Daily reminder for logging work time
- Configurable reminder time settings
- Reminder test button
- Chrome notification system support
- Reminder page with quick access to Tempo

### Improved

- Enhanced communication between different parts of the extension
- Prevention of multiple script injections
- Improved Tempo page detection
- Performance optimization

## Version 1.2.0 (2025-02-25)

### Added

- Automatic reminder for logging work time at the end of the day
- Configurable reminder time settings
- Notification with button for quick Tempo access

## Version 1.1.0 (2025-02-12)

### Added

- Improved automatic detection and setting of Area in Tempo
- Support for different Tempo dialog formats
- Automatic script injection after page load
- Additional detection of clicks on iFrame elements and buttons
- Communication between different parts of the extension

### Improved

- Resolved Content Security Policy (CSP) issues
- Improved form dialog detection stability
- Enhanced Area field search methods
- Reduced diagnostic messages in the console
- Optimized code for better performance

### Technical Changes

- Added support for iframes
- Used MutationObserver to detect dynamically added dialogs
- Utilized chrome.scripting.executeScript API for script injection
- Extended CSS selector list for better element matching
- Added alternative Area setting mechanism when list selection is not possible
