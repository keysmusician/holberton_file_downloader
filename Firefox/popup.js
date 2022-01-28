document.getElementById('findButton').addEventListener('click', () => {
  browser.tabs.query({
    active: true,
    currentWindow: true
  }, tabs => {
    browser.tabs.sendMessage(
      tabs[0].id,
      { from: 'popup', subject: 'requestFilenames' },
      handleContentScriptResponse
    );
  });
});

const downloadButton = document.getElementById('downloadButton');
const saveAsButton = document.getElementById('saveAsButton');
let hasListener = false;

function handleContentScriptResponse (response) {
  // When the content script returns a messsage, display the filenames it
  // found:
  const ul = document.getElementById('files');

  // Reset the unordered list before adding new elements:
  ul.textContent = '';

  let fileCount = 0;
  if (response) {
    fileCount = Object.keys(response.files).length;
  }

  if (fileCount === 0) {
    document.getElementById('file-count').textContent = 'No files found';
  } else {
    document.getElementById('file-count').textContent = fileCount + ' files';
    downloadButton.style.display = 'inline-block';
    saveAsButton.style.display = 'inline-block';
    for (const file in response.files) {
      const li = document.createElement('li');
      li.appendChild(document.createTextNode(file));
      ul.appendChild(li);
    }

    if (!hasListener) {
      downloadButton.addEventListener('click', () => {
        download(response.files, response.projectTitle, false);
      });
      saveAsButton.addEventListener('click', () => {
        download(response.files, response.projectTitle, true);
      });
      hasListener = true;
    }
  }
}

function download (files, folderName = 'Holberton File Downloader', useSaveAs) {
  // Create a zip file
  const zip = new JSZip();

  // Add each file to the zip
  for (const file in files) {
    zip.file(file, new Blob([files[file]], { type: 'text/plain' }));
  }

  // Download the zip
  zip.generateAsync({ type: 'blob' }).then((zipfile) => {
    browser.downloads.download({
      saveAs: useSaveAs,
      filename: folderName + '.zip',
      url: window.URL.createObjectURL(zipfile)
    });
  });
}
