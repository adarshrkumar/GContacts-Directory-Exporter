document.getElementById('exportBtn').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const activeTab = tabs[0];
        chrome.scripting.executeScript({
            target: {tabId: activeTab.id},
            files: ['contacts.js']
        }, () => {
            chrome.scripting.executeScript({
                target: {tabId: activeTab.id},
                func: () => {
                    window.queueExport();
                }
            });
        });
    });
});