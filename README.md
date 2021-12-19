# Holberton File Downloader
A Chrome extension which downloads files scraped from the active Holberton School project page

## About
Inspired by HB web scraper by @Tieje.
Comparison:
| Feature | HFD | HBWS |
|---|---|---|
| Installation/setup | Download the extension folder, go to `chrome://extensions/`, enable Developer mode, click "load unpacked," and select the extension folder. | Download the script, a compatable Chrome driver, Python and Seleneum as needed. Configure your username & password in a JSON file, and alias the script. |
| Browser Compatability | Chrome | Chrome |
| File destination | Only saves locally to Chrome's download location | Saves to any present working directory; Works inside a virtual machine|
| Usage | Visit the project page, then click "find files", then "download files" | Type `hb <holberton_project_url>` + <return\>|
| Interface | GUI (HTML) | Command line |
