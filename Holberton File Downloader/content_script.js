chrome.runtime.sendMessage({ message: 'activate_icon' });
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if ((msg.from === 'popup') && (msg.subject === 'requestFilenames')) {
    const filenameListItems = document.querySelectorAll(
      'div.task-card div.list-group div.list-group-item ul li:last-child');

    const uniqueFilenames = new Set();

    filenameListItems.forEach(li => {
      if (li.firstChild.textContent === 'File: ') {
        const filename = li.lastChild.textContent;
        // Sometimes multiple files are named in the same list item.
        // Those should be split into separate strings:
        filename.split(', ').forEach(split => {
          uniqueFilenames.add(split);
        });
      }
    });

    sendResponse({ files: Array.from(uniqueFilenames) });
  }
});
