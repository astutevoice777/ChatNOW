chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({
        url: chrome.runtime.getURL("index.html")
    });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_STREAM_ID') {
        const sources = ['tab', 'audio'];
        const senderTab = sender.tab;

        chrome.desktopCapture.chooseDesktopMedia(sources, senderTab, (streamId) => {
            if (!streamId) {
                // User cancelled or error
                sendResponse({ error: 'User cancelled' });
                return;
            }
            if (chrome.runtime.lastError) {
                sendResponse({ error: chrome.runtime.lastError.message });
                return;
            }
            sendResponse({ streamId: streamId });
        });

        return true; // Indicates async sendResponse
    }
});
