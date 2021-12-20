# Holberton File Downloader
The fast and convenient way to create Holberton School project files.

https://user-images.githubusercontent.com/74752740/146673077-2afb079a-19e7-463d-80f9-2759bbadf92a.mov

## About
Holberton File Downloader is an extension for Google Chrome which downloads empty files from names scraped from the active Holberton School project web page. It is an alternative to [hb-file-creator](https://github.com/tieje/hb-file-creator) by [@Tieje](https://github.com/tieje).

Comparison:
| Category | Holberton File Downloader | hb-file-creator |
|---|---|---|
| Installation/setup | Eventually, it could be installed easily from the Chrome web store. For now, install manually. Download the extension folder, go to `chrome://extensions/`, enable Developer mode, click "load unpacked," and select the extension folder. | Download the script, a compatable Chrome driver, Python and Seleneum as needed. Configure your username & password in a JSON file, and alias the script. |
| Browser Compatability | Chrome | Chrome |
| File destination | Only saves locally to Chrome's download location | Saves to any present working directory; Works inside a virtual machine|
| Usage | Visit any project page, then click "find files", then "download files" | Type `hb <holberton_project_url>` + <return\>|
| Interface | GUI (HTML) | Command line |

## Bugs
- File names which include directories such as `dir/file.txt` get downloaded with the slashes converted to underscores, as in `dir_file.txt`. The extention ideally should create the neccessary directories. Additionally, all the files should be placed within a single directory rather than downloaded individually to the Chrome downloads location.

- Some files have appeared with a leading underscore. This may be caused by whitespace or an invisible character.

- Only downloads the first 10 files
