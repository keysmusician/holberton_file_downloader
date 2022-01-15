# Holberton File Downloader
The fast and convenient way to create Holberton School project files.

https://user-images.githubusercontent.com/74752740/149282794-389eda18-361c-4e54-b617-2f790641b521.mov

## About
Holberton File Downloader is an extension for Google Chrome which downloads empty files from names scraped from the active Holberton School project web page. It is an alternative to [hb-file-creator](https://github.com/tieje/hb-file-creator) by [@Tieje](https://github.com/tieje).

## Installation
*Eventually, it could be installed easily from the Chrome web store. For now, install manually:*

1) Download the extension folder (by cloning this repository)
2) In Chrome, navigate to `chrome://extensions/`
3) Enable Developer mode, then click "load unpacked," and select the extension folder (called "Holberton File Downloader")
<div align="center">
  <img src=https://wd.imgix.net/image/BhuKGJaIeLNPW9ehns59NfwqKxF2/vOu7iPbaapkALed96rzN.png>

  <p><em>Source: https://developer.chrome.com/docs/extensions/mv3/getstarted/#manifest</em></p>
</div>

4) Navigate to any Holberton School project page. If you're already viewing a project, refresh the page.

That's it! Happy downloading!

## Comparison:
| Category | Holberton File Downloader | hb-file-creator |
|---|---|---|
| Installation/setup | Download and load the extention. See [Installation](#installation) above. | Download the script, a compatable Chrome driver, Python and Seleneum as needed. Configure your username & password in a JSON file, and alias the script. |
| Browser Compatability | Chrome | Chrome |
| File destination | Only saves locally to Chrome's download location | Saves to any present working directory; Works inside a virtual machine|
| Usage | Visit any project page, then click "find files", then "download files" | Type `hb <holberton_project_url>` + <return\>|
| Interface | GUI (HTML) | Command line |

## To do
- Use [Chrome's download/save dialog](https://developer.chrome.com/docs/extensions/reference/downloads/#method-download) to specify download location

- Shebangs can be scraped and written to files. ~~The downside of this is that Chrome detects these as executable scripts and issues a warning when downloading~~ (this is no longer an issue with the adoption of .zip files).

- It could scrape main files (and maybe even autofill header files)

- Display files in a tree structure

- ~~Arrange files in the correct subdirectories~~

- ~~Sometimes filenames (header files for C projects) appear in the "Requirements" section. These could be included as well.~~

- ~~Correctly name the project directory~~


## Bugs
- ~~File names which include directories such as `dir/file.txt` get downloaded with the slashes converted to underscores, as in `dir_file.txt`. The extention ideally should create the neccessary directories.~~ Fixed 1/14/21

- ~~Some files have downloaded with a leading underscore. This may be caused by whitespace or an invisible character.~~ Fixed 1/14/21

- ~~Additionally, all the files should be placed within a single directory rather than downloaded individually to the Chrome downloads location.~~ Fixed 1/13/21

- ~~Only downloads the first 10 files~~ Fixed 1/13/21
