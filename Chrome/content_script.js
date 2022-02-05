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

    // Files displayed by the "cat" command, not actual files containing cats
    const catFiles = findCatFiles(directoryName);

    // Check for a header file, adding if found
    const header = findCHeader();
    if (header) {
      uniqueFilePaths.add(directoryName + '/' + header);
    }

    // Throw a README.md in there
    uniqueFilePaths.add(directoryName + '/README.md');

    // Create a mapping of each filename to an empty string
    const projectfiles = {};
    uniqueFilePaths.forEach(filepath => { projectfiles[filepath] = ''; });

    const allFiles = removeFilesWithIgnoredExtensions(
      Object.assign({}, projectfiles, catFiles));

    // Get the project title
    const projectTitle = findProjectTitle();

    const response = {
      files: allFiles,
      projectTitle: projectTitle
    };
    sendResponse(response);
  }
});

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

function findCatFiles (directoryName) {
  // Scrape main, header, etc. filenames displayed by the "cat" command
  const filenames = {};
  document.querySelectorAll('div.task-card pre').forEach(codeBlock => {
    let filePath;
    let start = false;
    const terminateExpression = /(?<=^[\s]*)(\w+@.+(\$|#|%))/;
    codeBlock.innerText.split('\n').forEach(line => {
      if (line.includes('$ cat ')) {
        // What follows "cat" isn't neccessarily only a file name. It could be
        // followed by additional bash commands and/or redirects.
        const postCat = line.split('$ cat ').pop().trim();

        // Ignore absolute paths, since relevant files will be in the PWD or
        // given by relative path if not
        if (!postCat[0] || postCat[0] === '/') { return; }

        // Validate filename
        let filename = '';
        let skipThisCat = false;
        for (const token of postCat.split(' ')) {
          // If any tokens follow the name of the file, it might be a
          // redirection, so we should skip recording this file
          if (skipThisCat) { return; }
          if (token.slice(-1) === '\\') {
            filename += token.slice(0, -1) + ' ';
          } else {
            filename += token;
            skipThisCat = true;
          }
        }

        // Once filename has been validated, start recording lines
        start = true;
        filePath = directoryName + '/' + filename;
        filenames[filePath] = '';
      } else if (terminateExpression.test(line)) {
        start = false;
      } else if (start) {
        filenames[filePath] += line + '\n';
      }
    });
  });
  return filenames;
}

function removeFilesWithIgnoredExtensions (fileDict) {
  const ignoredExtensions = [
    'a',
    'jpg',
    'jpeg',
    'png',
    'so'
  ];

  // Remove any files with non-text file extensions
  for (const file in fileDict) {
    const fileSplit = file.split('.');
    if (fileSplit.length > 1) {
      const extension = fileSplit.pop();
      if (ignoredExtensions.includes(extension)) {
        delete fileDict[file];
      }
    }
  }
  return fileDict;
}

function findProjectTitle () {
  const projectTitleElement =
    document.querySelector('article div.project div h1.gap');
  let projectTitle = '';
  // projectTitleElement should be `null` if we're not on a project page
  if (projectTitleElement) {
    projectTitle = projectTitleElement.textContent;
    projectTitle = projectTitle.replace('/', '_');
  }
  return projectTitle;
}
