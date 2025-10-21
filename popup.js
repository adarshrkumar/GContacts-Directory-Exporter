// console.log('This is a popup!');
document.getElementById('exportBtn').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            files: ['contacts.js']
        }, () => {
            chrome.scripting.executeScript({
                target: {tabId: tabs[0].id},
                function: window.queueExport
            });
        });
    });
});