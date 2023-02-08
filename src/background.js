/**
 * Service worker.
 *
 * Manages the offscreen document and handles downloading files.
 *
 * If it seems convoluted to create a service worker, open an offscreen
 * document from the service worker, make a URL in in the offscreen document,
 * send it back to the service worker, download the blob from the URL, then
 * close the offscreen document, it's because it is. This is the manifest V3
 * way.
 */
import './lib/browser-polyfill.min.js';
// An extension may only open one offscreen document at a time. I have to track
// the state because there doesn't appear to be an existing API method for
// this.
let offscreen_document_is_open = false;

browser.action.disable();

browser.runtime.onMessage.addListener((request, sender) => {
  if (request.message === 'activate_icon') {
    browser.action.enable(sender.tab.id);
  }
  if (request.message === 'download') {
    requestURL(request);
  }
  if (request.message === 'URL') {
    downloadURL(request.url, request.useSaveAs, request.projectTitle);
  }
});

async function requestURL(request) {
  if (!offscreen_document_is_open) {
    await browser.offscreen.createDocument({
      url: browser.runtime.getURL('offscreen.html'),
      reasons: ['BLOBS'],
      justification: 'Creating a downloadable URL.',
    });

    offscreen_document_is_open = true;
  }

  browser.runtime.sendMessage({
    ...request,
    message: 'make_downloadable_URL'
  });
}

function downloadURL (
  url, useSaveAs, folderName = 'Holberton File Downloader') {
  // Since the offscreen document is closed immediately after starting a
  // download, it is not necessary to revoke the URL.
  browser.downloads.download({
    saveAs: useSaveAs,
    filename: folderName + '.zip',
    url: url
  });
  // Not sure why downloads still work even though I don't wait for them to
  // complete before closing the offscreen document. Keep an eye on this as it
  // could be a potential bug source.
  browser.offscreen.closeDocument();
  offscreen_document_is_open = false;
}
