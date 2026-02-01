# GContacts-Directory-Exporter

A Chrome extension for exporting contacts from Google Contacts directory.

## Features

- Exports all contacts from Google Contacts directory view
- Automatically scrolls through the entire contact list
- Extracts name, job title, email, and phone number
- Deduplicates contacts automatically
- Progress logging in DevTools console

## Installation

1. Download or clone this repository
2. Open `chrome://extensions/` in Chrome
3. Enable "Developer mode" (top right toggle)
4. Click "Load unpacked" and select this folder
5. The extension icon will appear in your toolbar

## Usage

1. Navigate to [Google Contacts](https://contacts.google.com) directory view
2. Click the extension icon
3. Click "Export Directory"
4. Open DevTools Console (F12) to monitor progress
5. After completion, access your data in the console:

```javascript
Array.from(window.exportedContactsStorage).map(JSON.parse)
```

## Exported Data Format

```json
{
  "name": "John Doe",
  "job": "Software Engineer",
  "email": "john@example.com",
  "phone": "+1 234 567 8900"
}
```

## Tech Stack

- Chrome Extension (Manifest V3)
- Chrome Scripting API
- Content Scripts

## Permissions

- `activeTab`: Access to the current tab
- `scripting`: Inject and execute scripts
- `host_permissions`: Access to contacts.google.com
