function findCHeader () {
  // Look in the project description
  const projectDescriptionH2 = document.querySelectorAll(
    '#project-description h2');
  let header;
  projectDescriptionH2.forEach(h2 => {
    // Find the first unordered list following "Requirements"
    if (h2.innerText.trim() === 'Requirements') {
      let nextSibling = h2.nextElementSibling;
      while (nextSibling) {
        if (nextSibling.tagName === 'UL') {
          break;
        }
        nextSibling = nextSibling.nextElementSibling;
      }
      nextSibling.querySelectorAll('code').forEach(code => {
        if (code.innerText.includes('.h')) {
          header = code.innerText.trim();
        }
      });
    }
  });
  return header;
}

chrome.runtime.sendMessage({ message: 'activate_icon' });
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if ((msg.from === 'popup') && (msg.subject === 'requestFilenames')) {
    // Where in the DOM to expect filenames:
    const filenameListItems = document.querySelectorAll(
      'div.task-card div.list-group div.list-group-item ul li:last-child');

    const uniqueFilePaths = new Set();
    let directoryName = '';

    filenameListItems.forEach(li => {
      if (li.firstChild.textContent === 'File: ') {
        // If a file is found, also get its directory
        const directoryElement = li.previousElementSibling;
        if (directoryElement.firstChild.textContent === 'Directory: ') {
          directoryName = directoryElement.lastChild.textContent.trim();
        } else {
          directoryName = '';
        }
        const filename = li.lastChild.textContent;
        // Sometimes multiple files are named in the same list item.
        // Those should be split into separate strings:
        filename.split(', ').forEach(split => {
          const filePath = directoryName + '/' + split.trim();
          uniqueFilePaths.add(filePath);
        });
      }
    });

    // Check for a header file, adding if found
    const header = findCHeader();
    if (header) {
      uniqueFilePaths.add(directoryName + '/' + header);
    }

    // Get the project title
    let projectTitle = document.querySelector(
      'article div.project div h1.gap');

    // projectTitle should be `null` if we're not on a project page
    if (projectTitle) {
      projectTitle = projectTitle.textContent;

      // Throw a README.md in there
      uniqueFilePaths.add(directoryName + '/README.md');
    }

    const response = {
      files: Array.from(uniqueFilePaths),
      projectTitle: projectTitle
    };
    sendResponse(response);
  }
});
