let files;
const findButton = document.getElementById('findButton');
findButton.addEventListener('click', () => {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, tabs => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { from: 'popup', subject: 'requestFilenames' },
      (response) => {
        const ul = document.getElementById('files');

        // Reset the ul before adding new elements:
        ul.textContent = '';

        files = response.files;
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
        }
      }
    );
  });
});

function download (data, filename, type) {
  const file = new Blob([data], { type: type });
  const a = document.createElement('a');
  const url = URL.createObjectURL(file);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(function () {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
}

const downloadButton = document.getElementById('downloadButton');
downloadButton.addEventListener('click', () => {
  files.forEach(filename => {
    download('', filename, 'text');
  });
});
