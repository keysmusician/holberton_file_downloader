const findButton = document.getElementById('findButton');
findButton.addEventListener('click', () => {
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

function handleContentScriptResponse (response) {
  // When the content script returns a messsage, display the filenames it
  // found:
  const ul = document.getElementById('files');

  // Reset the unordered list before adding new elements:
  ul.textContent = '';

  if (response.files.length === 0) {
    downloadButton.style.display = 'none';
    ul.appendChild(document.createTextNode('No files found'));
  } else {
    downloadButton.style.display = 'block';
    response.files.forEach(filename => {
      const li = document.createElement('li');
      li.appendChild(document.createTextNode(filename));
      ul.appendChild(li);
    });

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
    const fileBlob = new Blob([''], { type: 'text' });
    zip.file(filename, fileBlob);
  });

  // Add a README.md
  zip.file('README.md', new Blob([folderName], { type: 'text' }));

  // Download the zip
  zip.generateAsync({ type: 'blob' }).then((zipfile) => {
    saveAs(zipfile, folderName + '.zip');
  });
}
