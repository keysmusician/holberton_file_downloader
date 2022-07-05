'use strict';

/* globals browser */

// browser.runtime.sendMessage({ message: 'enable' }); // ***** This has to be revisited ***** Lets the browser know the content script has run and the extension should be enabled on this page. With manifest V3, extensions are enabled by default, so I have to figure out how to disable it for all pages except the ones the content script runs on.
browser.runtime.onMessage.addListener(request => {
  if (request.subject === 'send_filenames') {
    const filesObject = scrapeFileNames();
    filesObject.tabId = request.to;
    return Promise.resolve(filesObject);
  }
  // Dummy response to keep the console quiet:
  return Promise.resolve(true);
});

function scrapeFileNames () {
  // Where in the DOM to expect filenames:
  const filenameListItems = document.querySelectorAll(
    'div.task-card div.list-group div.list-group-item ul li:last-child');

  const uniqueFilePaths = new Set();

  // Save directory names for the README and header files
  const projectDirectories = new Set();

  filenameListItems.forEach(li => {
    if (li.firstChild.textContent === 'File: ') {
      // If a file is found, also get its directory
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
  const catFiles = findCatFiles();

  // Header files and the README need to be placed in the correct directory,
  // which is most likely any directory starting with "0x". There should
  // never be more than one of these per project. If there is, use the first
  // one. If there are no matching directories, place the files at the root
  let projectDirectory = '';
  for (const directoryName of projectDirectories) {
    if (directoryName.split('/').pop().slice(0, 2) === '0x') {
      projectDirectory = directoryName;
      break;
    }
  }

  // Check for a header file, adding if found
  const header = findCHeader();
  if (header) {
    uniqueFilePaths.add(projectDirectory + '/' + header);
  }
  // If any files were found, throw a README.md in there, too
  if (uniqueFilePaths.size > 0) {
    uniqueFilePaths.add(projectDirectory + '/README.md');
  }

  // Create a mapping of each filename to an empty string
  const projectFiles = {};
  uniqueFilePaths.forEach(filepath => { projectFiles[filepath] = ''; });

  const allFiles = removeFilesWithIgnoredExtensions(
    Object.assign({}, projectFiles, catFiles));

  // Get the project title
  const projectTitle = findProjectTitle();

  return {
    files: allFiles,
    projectTitle: projectTitle
  };
}

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

/**
 * findCatFiles - Scrapes main, header, etc. filenames displayed by the "cat"
 * command
 * */
function findCatFiles () {
  // Find all the code blocks inside a task card on the page
  const filenames = {};
  document.querySelectorAll('div.task-card pre').forEach(codeBlock => {
    // Find the directory name
    let directoryName = '';
    codeBlock.parentElement.parentElement
      .querySelectorAll('div.list-group div.list-group-item ul li')
      .forEach(listGroupItem => {
        if (listGroupItem.textContent.includes('Directory:')) {
          directoryName = listGroupItem.firstElementChild.textContent;
        }
      });

    // Filter out any part of the codeBlock that should be copied, indicated
    // by the `cat` bash command
    const catFile = copyCat(codeBlock.innerText);

    // Copy any returned files into a single Object
    for (const filename in catFile) {
      const filePath = directoryName + '/' + filename;
      // Don't overwrite a file if it already exists
      if (!Object.prototype.hasOwnProperty.call(filenames, filePath)) {
        filenames[filePath] = catFile[filename];
      }
    }
  });
  return filenames;
}

function copyCat (textBlock) {
  const files = {};
  const beginExpression = /^[\s]*(\$|(\w+@.+(\$|#|%)))\s+cat\s+/;
  let endExpression;
  let commandPrompt;
  let filename;
  let doCopy = false;
  let dashE = false;

  textBlock.split('\n').forEach(line => {
    if (beginExpression.test(line)) {
      // What follows "cat" isn't neccessarily only a file name. It could be
      // followed by additional bash commands and/or redirects.
      const postCat = line.split('cat').pop().trim();

      // There should be one command prompt within a text block
      if (!commandPrompt) {
        commandPrompt = beginExpression
          .exec(line)[0]
          .split('cat')[0]
          .trimEnd();
      }

      // The same prompt found next to `cat` should appear after the file has
      // printed and should be used to halt copying
      endExpression = RegExp(
        // Escape any special characters
        commandPrompt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      );

      // Ignore absolute paths, since a file name given by absolute path is
      // almost certainly a file we do not want to create with this app.
      // Relevant files will either be in the PWD, or given by relative path
      if (!postCat[0] || postCat[0] === '/') { return; }

      // Validate filename
      filename = '';
      let skipThisCat = false;
      for (const token of postCat.split(' ')) {
        // If any tokens follow the name of the file, it might be a
        // redirection, so we should skip recording this file
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

      // Don't overwrite a file if it already exists
      if (Object.prototype.hasOwnProperty.call(files, filename)) {
        return;
      }

      // Once filename has been validated, start recording lines
      doCopy = true;
      files[filename] = '';
    } else if (endExpression.test(line)) {
      doCopy = false;
      dashE = false;
    } else if (doCopy) {
      if (dashE) { line = line.trimEnd().slice(0, -1); }
      files[filename] += line + '\n';
    }
  });

  return files;
}

function removeFilesWithIgnoredExtensions (fileDict) {
  // Remove any files with non-text file extensions
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
  // projectTitleElement should be `null` if we're not on a project page
  if (projectTitleElement) {
    projectTitle = projectTitleElement.textContent;
    projectTitle = projectTitle.replace('/', '_');
  }
  return projectTitle;
}
