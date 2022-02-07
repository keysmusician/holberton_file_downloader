browser.tabs.query({ active: true, currentWindow: true })
  .then(tabs => browser.tabs.sendMessage(
    tabs[0].id, { from: 'popup', subject: 'filenames' }
  )).then(response => handleContentScriptResponse(response));

const downloadButton = document.getElementById('downloadButton');
const saveAsButton = document.getElementById('saveAsButton');

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
    // If there are any files on the page, show the download buttons
    downloadButton.style.display = 'inline-block';
    saveAsButton.style.display = 'inline-block';

    // Show the files in natural sort order
    const sortedFilenames = Array.from(Object.keys(response.files))
      .sort(naturalCompare);
    for (const file of sortedFilenames) {
      const li = document.createElement('li');
      li.appendChild(document.createTextNode(file));
      ul.appendChild(li);
    }
    // When a button is clicked, message the background page to start
    // downloading the files. They shouldn't be downloaded here because if the
    // popup closes, and URLs will be revoked. For example, in Firefox,
    // opening the "save as" dialogue causes the popup to close, which revokes
    // any URL generated in this script and fails the download.
    downloadButton.addEventListener('click', () => {
      browser.runtime.sendMessage({
        message: 'download', data: response, saveAs: false
      });
    });
    saveAsButton.addEventListener('click', () =>
      browser.runtime.sendMessage({
        message: 'download', data: response, saveAs: true
      })
    );
  }
}

function naturalCompare (a, b) {
  const ax = []; const bx = [];

  a.replace(/(\d+)|(\D+)/g,
    (_, $1, $2) => { ax.push([$1 || Infinity, $2 || '']); });
  b.replace(/(\d+)|(\D+)/g,
    (_, $1, $2) => { bx.push([$1 || Infinity, $2 || '']); });

  while (ax.length && bx.length) {
    const an = ax.shift();
    const bn = bx.shift();
    const nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
    if (nn) return nn;
  }

  return ax.length - bx.length;
}
