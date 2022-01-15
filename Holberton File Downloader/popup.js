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

let PT = '';

function handleContentScriptResponse (response) {
  // When the content script returns a messsage, display the filenames it
  // found:
  const ul = document.getElementById('files');
  const downloadButton = document.getElementById('downloadButton');

  // Reset the unordered list before adding new elements:
  ul.textContent = '';

  const fileCount = response.files.length;
  if (fileCount === 0) {
    downloadButton.style.display = 'none';
    ul.appendChild(document.createTextNode('No files found'));
  } else {
    document.getElementById('file-count').textContent = fileCount + ' files';
    downloadButton.style.display = 'inline-block';
    response.files.forEach(filename => {
      const li = document.createElement('li');
      li.appendChild(document.createTextNode(filename));
      ul.appendChild(li);
    });

    PT = response.projectTitle;
    downloadButton.addEventListener('click', () => {
      download(response.files, response.projectTitle);
    });
  }
}

function download (filenames, folderName = 'holberton-file-downloader') {
  // Create a zip file
  const zip = new JSZip();

  // Add each file to the zip
  filenames.forEach((filename) => {
    zip.file(filename, new Blob([''], { type: 'text' }));
  });

  // Download the zip
  zip.generateAsync({ type: 'blob' }).then((zipfile) => {
    chrome.downloads.download({
      saveAs: true,
      filename: folderName.replace('.', ' ') + '.zip',
      url: window.URL.createObjectURL(zipfile)
    });
    // saveAs(zipfile, folderName + '.zip');
  });
}

function getPT () {
  return PT;
}

chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
  const filename = getPT.bind(null, PT);
  suggest({ filename: filename });
});
