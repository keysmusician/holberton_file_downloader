browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'activate_icon') {
    browser.pageAction.show(sender.tab.id);
  }
});
