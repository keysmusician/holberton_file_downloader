/**
 * This script runs in the context of the active Holberton Intranet page.
 * It does the scraping of file names and contents.
 */
browser.runtime.sendMessage({ message: 'activate_icon' });

browser.runtime.onMessage.addListener(request => {
  if ((request.from === 'popup') && (request.subject === 'filenames')) {
    // Where in the DOM to expect filenames:
    const filenameListItems = document.querySelectorAll(
      'div.task-card div.list-group div.list-group-item ul li:last-child');

    const uniqueFilePaths = new Set();

    // Save directory names for the README and header files.
    const projectDirectories = new Set();

    filenameListItems.forEach(li => {
      if (li.firstChild.textContent === 'File: ') {
        // If a file is found, also get its directory.
        let directoryName = '';
        const directoryElement = li.previousElementSibling;
        if (directoryElement.firstChild.textContent === 'Directory: ') {
          directoryName = directoryElement.lastChild.textContent.trim();
        }
        projectDirectories.add(directoryName);
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
    // ;)
    const catFiles = findCatFiles();

    // Header files and the README need to be placed in the correct directory,
    // which is most likely any directory starting with "0x". There should
    // never be more than one of these per project. If there is, use the first
    // one. If there are no matching directories, place the files at the root.
    let projectDirectory = '';
    for (const directoryName of projectDirectories) {
      if (directoryName.split('/').pop().slice(0, 2) === '0x') {
        projectDirectory = directoryName;
        break;
      }
    }

    // Check for a header file, adding if found.
    const header = findCHeader();
    if (header) {
      uniqueFilePaths.add(projectDirectory + '/' + header);
    }
    // If any files were found, throw a "README.md" in there, too.
    if (uniqueFilePaths.size > 0) {
      uniqueFilePaths.add(projectDirectory + '/README.md');
    }

    // Create a mapping of each filename to an empty string.
    const projectfiles = {};
    uniqueFilePaths.forEach(filepath => { projectfiles[filepath] = ''; });

    const allFiles = removeFilesWithIgnoredExtensions(
      Object.assign({}, projectfiles, catFiles));

    // Get the project title.
    const projectTitle = findProjectTitle();

    return Promise.resolve({ files: allFiles, projectTitle: projectTitle });
  }
});

function findCHeader () {
  // Look in the project description.
  const projectDescriptionH2 = document.querySelectorAll(
    '#project-description h2');
  let header;
  projectDescriptionH2.forEach(h2 => {
    // Find the first unordered list following "Requirements."
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

function findCatFiles () {
  // Scrape main, header, etc. filenames displayed by the "cat" command.

  const filenames = {};
  document.querySelectorAll('div.task-card pre').forEach(codeBlock => {
    // Find the directory name.
    let directoryName = '';
    codeBlock.parentElement.parentElement
      .querySelectorAll('div.list-group div.list-group-item ul li')
      .forEach(listGroupItem => {
        if (listGroupItem.textContent.includes('Directory:')) {
          directoryName = listGroupItem.firstElementChild.textContent;
        }
      });

    let filePath;
    let start = false;
    let dashE = false;
    const terminateExpression = /(?<=^[\s]*)(\w+@.+(\$|#|%))/;
    codeBlock.innerText.split('\n').forEach(line => {
      if (line.includes('$ cat ')) {
        // What follows "cat" isn't neccessarily only a file name. It could be
        // followed by additional bash commands and/or redirects.
        const postCat = line.split('$ cat ').pop().trim();

        // Ignore absolute paths, since relevant files will be in the PWD or
        // given by relative path if not.
        if (!postCat[0] || postCat[0] === '/') { return; }

        // Validate filename
        let filename = '';
        let skipThisCat = false;
        for (const token of postCat.split(' ')) {
          // If any tokens follow the name of the file, it might be a
          // redirection, so we should skip recording this file.
          if (skipThisCat) { return; }
          if (token === '-e') {
            dashE = true;
          } else if (token.slice(-1) === '\\') {
            filename += token.slice(0, -1) + ' ';
          } else {
            filename += token;
            skipThisCat = true;
          }
        }

        // Ensure the file hasn't already been created. If it has, preserve it.
        filePath = directoryName + '/' + filename;
        if (Object.prototype.hasOwnProperty.call(filenames, filePath)) {
          return;
        }

        // Once filename has been validated, start recording lines.
        start = true;
        filenames[filePath] = '';
      } else if (terminateExpression.test(line)) {
        start = false;
        dashE = false;
      } else if (start) {
        if (dashE) { line = line.trimEnd().slice(0, -1); }
        filenames[filePath] += line + '\n';
      }
    });
  });
  return filenames;
}

function removeFilesWithIgnoredExtensions (fileDict) {
  // Remove any files with non-text file extensions.
  const ignoredExtensions = [
    'a',
    'jpg',
    'jpeg',
    'png',
    'so'
  ];

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
  let projectTitle;
  // `projectTitleElement` should be `null` if we're not on a project page.
  if (projectTitleElement) {
    projectTitle = projectTitleElement.textContent;
    projectTitle = projectTitle.replace('/', '_');
  }
  return projectTitle;
}
