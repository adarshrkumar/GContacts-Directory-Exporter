document.getElementById('exportBtn').addEventListener('click', async () => {
    const statusDiv = document.getElementById('status');
    const exportBtn = document.getElementById('exportBtn');

    try {
        // Disable button during export
        exportBtn.disabled = true;
        statusDiv.textContent = 'Starting export...';

        const tabs = await chrome.tabs.query({active: true, currentWindow: true});
        const activeTab = tabs[0];

        // Verify we're on Google Contacts
        if (!activeTab.url || !activeTab.url.includes('contacts.google.com')) {
            throw new Error('Please navigate to Google Contacts first');
        }

        // Inject the contacts script
        await chrome.scripting.executeScript({
            target: {tabId: activeTab.id},
            files: ['contacts.js']
        });

        statusDiv.textContent = 'Exporting... Check console for progress';

        // Execute the export function
        await chrome.scripting.executeScript({
            target: {tabId: activeTab.id},
            func: () => {
                window.queueExport();
            }
        });

        statusDiv.textContent = 'Export complete! Check console for data';

    } catch (error) {
        statusDiv.textContent = 'Error: ' + error.message;
        console.error('Export failed:', error);
    } finally {
        exportBtn.disabled = false;
    }
});

document.getElementById('downloadBtn').addEventListener('click', async () => {
    const statusDiv = document.getElementById('status');

    try {
        const tabs = await chrome.tabs.query({active: true, currentWindow: true});
        const activeTab = tabs[0];

        // Get the exported data from the page
        const results = await chrome.scripting.executeScript({
            target: {tabId: activeTab.id},
            func: () => {
                if (!window.exportedContactsStorage) {
                    return null;
                }
                return Array.from(window.exportedContactsStorage).map(item => JSON.parse(item));
            }
        });

        const contacts = results[0].result;

        if (!contacts || contacts.length === 0) {
            statusDiv.textContent = 'No data to download. Export first!';
            return;
        }

        // Create CSV content
        const csvContent = convertToCSV(contacts);

        // Download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `google-contacts-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);

        statusDiv.textContent = `Downloaded ${contacts.length} contacts`;

    } catch (error) {
        statusDiv.textContent = 'Error downloading: ' + error.message;
        console.error('Download failed:', error);
    }
});

function convertToCSV(contacts) {
    const headers = ['Name', 'Job', 'Email', 'Phone'];
    const rows = contacts.map(contact => [
        escapeCSV(contact.name || ''),
        escapeCSV(contact.job || ''),
        escapeCSV(contact.email || ''),
        escapeCSV(contact.phone || '')
    ]);

    const csvLines = [headers.join(',')];
    rows.forEach(row => csvLines.push(row.join(',')));

    return csvLines.join('\n');
}

function escapeCSV(value) {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return '"' + value.replace(/"/g, '""') + '"';
    }
    return value;
}