browser.runtime.onMessage.addListener((request, sender) => {
  if (request.message === 'activate_icon') {
    browser.pageAction.show(sender.tab.id);
  }
  if (request.message === 'download') {
    download(request.data.files, request.data.projectTitle, request.saveAs);
  }
});

function download (files, folderName = 'Holberton File Downloader', useSaveAs) {
  // Create a zip file
  const zip = new JSZip();

  // Add each file to the zip
  for (const file in files) {
    zip.file(file, new Blob([files[file]], { type: 'text/plain' }));
  }

  // Download the zip
  zip.generateAsync({ type: 'blob' }).then((zipfile) => {
    const url = window.URL.createObjectURL(zipfile);

    function revokeURLOnComplete (delta) {
      if (delta.state && delta.state.current === 'complete') {
        URL.revokeObjectURL(url);
        browser.downloads.onChanged.removeListener(revokeURLOnComplete);
      }
    }
    browser.downloads.onChanged.addListener(revokeURLOnComplete);

    browser.downloads.download({
      saveAs: useSaveAs,
      filename: folderName + '.zip',
      url: url
    });
  });
}
