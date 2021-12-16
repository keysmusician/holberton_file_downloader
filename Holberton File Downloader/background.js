chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'activate_icon') {
    chrome.pageAction.show(sender.tab.id);
  }
});
