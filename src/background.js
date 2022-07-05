'use strict';

import { } from './lib/browser-polyfill.js';

/* globals browser */

browser.runtime.onMessage.addListener(request => {
  if (request.subject === 'close_download_tab') {
    browser.tabs.remove(request.tabId);
  }
});
