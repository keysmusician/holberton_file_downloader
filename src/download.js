'use strict';

/* globals browser, JSZip, Blob */

browser.runtime.onMessage.addListener(request => {
  if (request.subject === 'download') {
    browser.storage.session.get(['files', 'projectTitle', 'useSaveAs'])
      .then(sessionStorage => {
        downloadFiles(
          sessionStorage.files,
          sessionStorage.projectTitle,
          sessionStorage.useSaveAs
        );
      });
  }
});

// Ask the service worker to close this tab when the download is finished or
// interrupted
// NOTE: You should probably verify using the download ID that the event was fired for the correct download
browser.downloads.onChanged.addListener(delta => {
  if (
    delta.state && (delta.state.current === 'complete' ||
    delta.state.current === 'interrupted')
  ) {
    browser.tabs.getCurrent().then(tab =>
      browser.runtime.sendMessage({
        subject: 'close_download_tab',
        tabId: tab.id
      })
    );
  }
});

function downloadFiles (
  files, folderName = 'Holberton File Downloader', useSaveAs) {
  // Create a zip file
  const zip = new JSZip();

  // Add each file to the zip
  for (const file in files) {
    zip.file(file, new Blob([files[file]], { type: 'text/plain' }));
  }

  // Generate a URL
  zip.generateAsync({ type: 'blob' }).then(zipFile => {
    const url = URL.createObjectURL(zipFile);

    // Download the zip
    browser.downloads.download({
      saveAs: useSaveAs,
      filename: folderName,
      url: url
    });
  });
}
