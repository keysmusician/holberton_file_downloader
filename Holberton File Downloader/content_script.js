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
chrome.runtime.sendMessage({ message: 'activate_icon' });
chrome.runtime.onMessage.addListener((msg, sender) => {
  if ((msg.from === 'popup') && (msg.subject === 'requestFilenames')) {
    const file_li = document.querySelectorAll(
      'div.task-card div.list-group div.list-group-item ul li:last-child');

    const unique_filenames = new Set();

    file_li.forEach(li => {
      if (li.firstChild.textContent === 'File: ') {
        const li_text = li.lastChild.textContent;
        unique_filenames.add(li_text);
      }
    });

    // Sometimes, multiple files are named in the same list item.
    // Those should be split into separate strings:
    const string_splits = new Set();
    unique_filenames.forEach(filename => {
      filename.split(', ').forEach(split => {
        string_splits.add(split);
      });
    });

    string_splits.forEach(filename => {
      download('', filename, 'text');
    });
  }
});
