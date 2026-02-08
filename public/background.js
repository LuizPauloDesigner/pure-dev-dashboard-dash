// Background service worker for Chrome Extension
// Opens side panel when extension icon is clicked

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error('Error setting panel behavior:', error));

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('DevCenter extension installed');
});
