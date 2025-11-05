# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrome extension (Manifest V3) that exports Google Contacts directory information by scraping the Google Contacts web interface. The extension injects a content script that scrolls through the contacts list, extracts contact information (name, job, email, phone), and stores it in memory.

## Architecture

Three-component architecture:

1. **popup.html/popup.js**: Browser action UI
   - Single button interface with zoom level tip
   - Uses Chrome Scripting API to inject and execute contacts.js
   - Two-step injection: first injects file, then executes `window.queueExport()`

2. **contacts.js**: Content script with core export logic
   - Exposes `window.queueExport()` as the main entry point
   - Implements infinite scroll automation with 1-second delays
   - Stores contacts in `window.exportedContactsStorage` Set for deduplication

3. **Script Injection Pattern**:

   ```javascript
   chrome.scripting.executeScript({files: ['contacts.js']})  // Inject script
   → chrome.scripting.executeScript({func: () => window.queueExport()})  // Execute
   ```

## Key Implementation Details

### DOM Selectors (Google Contacts UI)

- `.My2mLb`: Scrollable container for contacts list
- `.ZvpjBb.C8Dkz`: Contacts list wrapper
- `.XXcuqd`: Individual contact card elements
- Data extraction: `element.firstChild.childNodes[1-4]` for name, job, email, phone

### Scrolling Algorithm

- Scrolls one viewport height (`clientHeight`) per iteration
- Uses `scrollTo({behavior: 'smooth'})` for smooth scrolling
- 1-second delay (`sleep(1000)`) between iterations to allow DOM updates
- Terminates when `scrollHeight - scrollTop <= clientHeight`
- Logs progress to console as percentage

### Data Storage

- Contact objects: `{name, job, email, phone}`
- Stored as JSON strings in `window.exportedContactsStorage` Set
- Set-based storage automatically deduplicates contacts across scroll iterations
- Data remains in memory only (no automatic download/export)

## Development & Testing

### Loading the Extension

1. Navigate to `chrome://extensions/`
2. Enable "Developer mode" toggle
3. Click "Load unpacked" and select this directory
4. Extension icon will appear in Chrome toolbar

### Testing Export

1. Navigate to the [Google Contacts directory view](https://contacts.google.com)
2. Click extension icon → "Export Directory" button
3. Open DevTools Console (F12) to monitor progress
4. After completion, access data:

   ```javascript
   Array.from(window.exportedContactsStorage).map(JSON.parse)
   ```

### Manifest Configuration

- **Permissions**: `activeTab`, `scripting` (for dynamic script injection)
- **Host permissions**: `https://contacts.google.com/directory`
- **Content scripts**: Auto-injects contacts.js on Google Contacts pages

## Known Limitations

- DOM selectors tightly coupled to Google Contacts UI structure
- No error handling for missing/changed DOM elements
- No validation that user is on correct Google Contacts view
- Data export requires manual console access
- Contacts with single childNode are skipped (no length check explanation)
