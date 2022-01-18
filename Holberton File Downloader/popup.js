document.getElementById('findButton').addEventListener('click', () => {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, tabs => {
    chrome.tabs.sendMessage(
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
    fileCount = response.files.length;
  }

  if (fileCount === 0) {
    document.getElementById('file-count').textContent = 'No files found';
  } else {
    document.getElementById('file-count').textContent = fileCount + ' files';
    downloadButton.style.display = 'inline-block';
    saveAsButton.style.display = 'inline-block';
    response.files.forEach(filename => {
      const li = document.createElement('li');
      li.appendChild(document.createTextNode(filename));
      ul.appendChild(li);
    });

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

function download (filenames, folderName = 'Holberton File Downloader', useSaveAs) {
  // Create a zip file
  const zip = new JSZip();

  // Add each file to the zip
  filenames.forEach((filename) => {
    zip.file(filename, new Blob([''], { type: 'text/plain' }));
  });

  // Download the zip
  zip.generateAsync({ type: 'blob' }).then((zipfile) => {
    chrome.downloads.download({
      saveAs: useSaveAs,
      filename: folderName + '.zip',
      url: window.URL.createObjectURL(zipfile)
    });
  });
}
