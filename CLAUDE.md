# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome extension (Manifest V3) that exports Google Contacts directory information by scraping the Google Contacts web interface. The extension injects a script that scrolls through the contacts list, extracts contact information (name, job, email, phone), and stores it.

**Note**: The manifest.json contains legacy configuration for a different extension ("Website Fixes") with numerous content scripts for various websites. The actual functionality implemented in the codebase is the Google Contacts directory exporter.

## Architecture

The extension follows a simple three-component architecture:

1. **popup.html/popup.js**: Browser action UI that displays a button to trigger the export
   - Popup interface provides instructions to use smallest zoom level for best performance
   - Exports contact data via script injection when button is clicked

2. **contacts.js**: Content script with export logic
   - `queueExport()` function orchestrates the scrolling and data extraction
   - Scrolls through the `.My2mLb` scrollable container
   - Extracts contacts from `.ZvpjBb.C8Dkz` container with `.XXcuqd` contact elements
   - Uses a Set (`exportedContactsStorage`) to deduplicate contacts
   - Implements smooth scrolling with 4-second delays between iterations

3. **Script Injection Flow**:
   - User clicks "Export Directory" button in popup
   - popup.js injects contacts.js into the active tab
   - popup.js then executes the `window.queueExport` function from the injected script
   - The function runs in the context of the Google Contacts page

## Key Implementation Details

### DOM Selectors
The scraper relies on Google Contacts UI class names:
- `.My2mLb`: Main scrollable container
- `.ZvpjBb.C8Dkz`: Contacts list wrapper
- `.XXcuqd`: Individual contact elements
- Contact data extracted from `element.firstChild.childNodes[1-4]` (name, job, email, phone)

### Scrolling Strategy
- Scrolls by one `clientHeight` at a time with smooth behavior
- 4-second delay between scroll iterations to allow content to load
- Continues until `scrollHeight - scrollTop <= clientHeight`
- Logs progress to console as percentage

### Data Storage
- Uses `window.exportedContactsStorage` Set with JSON-stringified contact objects
- Set ensures deduplication of contacts across scroll iterations
- Contact object structure: `{name, job, email, phone}`

## Testing the Extension

1. Load unpacked extension in Chrome:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select this directory

2. Navigate to Google Contacts directory view

3. Click the extension icon and press "Export Directory" button

4. Monitor progress in browser console (F12)

5. After completion, access exported data via `window.exportedContactsStorage` in console

## Known Limitations

- Relies on specific Google Contacts DOM structure (class names may change)
- No error handling for missing DOM elements
- Exported data only available in `window` scope, not automatically downloaded
- Hardcoded 4-second scroll delay may need adjustment based on connection speed
- manifest.json contains unrelated content script configurations
