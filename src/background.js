/**
 * Service worker.
 *
 * Manages the offscreen document and handles downloading files.
 */
chrome.runtime.onMessage.addListener((request, sender) => {
/*   if (request.message === 'activate_icon') {
    browser.pageAction.show(sender.tab.id);
  } */
  if (request.message === 'download') {
    requestURL(request);
  }

  if (request.message === 'URL') {
    downloadURL(request.url, request.useSaveAs, request.projectTitle);
  }
});

async function requestURL(request) {
  try {
    await chrome.offscreen.createDocument({
      url: chrome.runtime.getURL('offscreen.html'),
      reasons: ['BLOBS'],
      justification: 'Creating a downloadable URL.',
    });
  } finally {
    chrome.runtime.sendMessage({ ...request, message: 'make_downloadable_URL' });
  };
}

async function downloadURL (
  url, useSaveAs, folderName = 'Holberton File Downloader') {

  // Since the offscreen document is closed immediately after download
  // completion, it is not necessary to revoke the URL.

  await chrome.downloads.download({
    saveAs: useSaveAs,
    filename: folderName + '.zip',
    url: url
  });

  chrome.offscreen.closeDocument();
}
