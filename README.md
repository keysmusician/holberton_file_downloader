# Holberton File Downloader
A Chrome extension which downloads empty files from names scraped from the active Holberton School project web page.

https://user-images.githubusercontent.com/74752740/146673077-2afb079a-19e7-463d-80f9-2759bbadf92a.mov

## About
Similar to by [hb-file-creator](https://github.com/tieje/hb-file-creator) by [@Tieje](https://github.com/tieje).

Comparison:
| Category | Holberton File Downloader | hb-file-creator |
|---|---|---|
| Installation/setup | For now, download the extension folder. Go to `chrome://extensions/`, enable Developer mode, click "load unpacked," and select the extension folder. Eventually, it could be installed easily from the Chrome web store. | Download the script, a compatable Chrome driver, Python and Seleneum as needed. Configure your username & password in a JSON file, and alias the script. |
| Browser Compatability | Chrome | Chrome |
| File destination | Only saves locally to Chrome's download location | Saves to any present working directory; Works inside a virtual machine|
| Usage | Visit the project page, then click "find files", then "download files" | Type `hb <holberton_project_url>` + <return\>|
| Interface | GUI (HTML) | Command line |

## Bugs
File names which include directories such as `dir/file.txt` get downloaded with the slashes converted to underscores, as in `dir_file.txt`. The extention ideally should create the neccessary directories. Additionally, all the files should be placed within a single directory rather than downloaded individually to the Chrome downloads location.
