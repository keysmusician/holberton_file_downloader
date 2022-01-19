# Holberton File Downloader
The fast and convenient way to create Holberton School project files.

https://user-images.githubusercontent.com/74752740/149923346-53565e75-fcad-4adb-8b1c-42f2dd33d601.mov

## About
Holberton File Downloader is an extension for Google Chrome which downloads empty files from names scraped from the active Holberton School project web page. It is an alternative to [hb-file-creator](https://github.com/tieje/hb-file-creator) by [@Tieje](https://github.com/tieje).

## Installation

### Chrome Web Store
The easiest way to install Holberton File Downloader is from the Chrome Web Store: https://chrome.google.com/webstore/detail/holberton-file-downloader/lknkfkffdokfodgfmcblomakemcbgomp

Simply click "Add to Chrome," and you'll be good to go.

#### Enhanced Safe Browsing warning
<img width="448" alt="Screen Shot 2022-01-18 at 7 43 02 PM" src="https://user-images.githubusercontent.com/74752740/150042101-2f2d0a15-762e-40e1-8f64-40deeed5f84b.png">
If you see a warning that the extension is not trusted by Enhanced Safe Browsing, simply click "Continue to install." The warning is displayed because my developer account is new and has not yet recived trusted status, which can take a few months. Rest assured that the extension collects no data and downloads ONLY blank files scraped from the active Holberton School project page. Feel free to browse the source code to verify the safety.


### Manual Unpacked Installation
Alternatively, Holberton File Downloader may be installed manually and loaded unpacked. This can be useful if you wish to modify the extension.

1) Download the extension folder (by cloning this repository)
2) In Chrome, navigate to `chrome://extensions/`
3) Enable Developer mode, then click "load unpacked," and select the extension folder (called "Holberton File Downloader")
<div align="center">
  <img src=https://wd.imgix.net/image/BhuKGJaIeLNPW9ehns59NfwqKxF2/vOu7iPbaapkALed96rzN.png>

  <p><em>Source: https://developer.chrome.com/docs/extensions/mv3/getstarted/#manifest</em></p>
</div>

That's it! The extension is installed.

## Usage

To download files, navigate to any Holberton School project page, click the extension icon, then "Find files," then "Download" (or "Download as..." to choose the download location). The extension is only active on `intranet.hbtn.io`.  If you were already viewing a project when you installed the extension, refresh the page. 

## Comparison
| Category | Holberton File Downloader | hb-file-creator |
|---|---|---|
| Installation/setup | Download and load the extention. See [Installation](#installation) above. | Download the script, a compatable Chrome driver, Python and Seleneum as needed. Configure your username & password in a JSON file, and alias the script. |
| Usage | Visit any project page, then click "Find files", then "Download." | Type `hb <holberton_project_url>` + <return\>|
| Browser Compatability | Chrome | Chrome |
| File destination | Any local directory | Any local directory |
| Interface | GUI (HTML) | Command line |

## To do

- Include shebangs in the appropriate files. ~~The downside of this is that Chrome detects these as executable scripts and issues a warning when downloading~~ (this is no longer an issue with the adoption of .zip files).
- Scrape main files
- Include header guards in header files
- Display files in a tree structure
- Prettier interface/CSS
- Dark mode
- Cross browser compatability
- ~~Use [Chrome's download/save dialog](https://developer.chrome.com/docs/extensions/reference/downloads/#method-download) to specify download location~~ Done 1/18/21
- ~~Arrange files in the correct subdirectories~~
- ~~Sometimes filenames (header files for C projects) appear in the "Requirements" section. These could be included as well.~~
- ~~Correctly name the project directory~~


## Bugs
- ~~File names which include directories such as `dir/file.txt` get downloaded with the slashes converted to underscores, as in `dir_file.txt`. The extention ideally should create the neccessary directories.~~ Fixed 1/14/21
- ~~Some files have downloaded with a leading underscore. This may be caused by whitespace or an invisible character.~~ Fixed 1/14/21
- ~~Additionally, all the files should be placed within a single directory rather than downloaded individually to the Chrome downloads location.~~ Fixed 1/13/21
- ~~Only downloads the first 10 files~~ Fixed 1/13/21
