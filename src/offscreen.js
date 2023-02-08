/**
 * Offscreen document. Replaces manifest v2's "background page."
 *
 * When triggered, creates a Zip file and messages back a URL to it.
 *
 * The URL can only be created here because only an offscreen document has a
 * persistent DOM, but it cannot be downloaded from here unlike it could in a
 * background page due to the limited API for offscreen documents. Downloading
 * must be done from the service worker.
 */
browser.runtime.onMessage.addListener((request, sender) => {
  if (request.message === 'make_downloadable_URL') {
    const zip = new JSZip();

    for (const [file, contents] of Object.entries(request.files)) {
      zip.file(file, new Blob([contents], { type: 'text/plain' }));
    }

    zip.generateAsync({ type: 'blob' })
      .then(zip_file => {
        browser.runtime.sendMessage({
          ...request,
          message: 'URL',
          url: window.URL.createObjectURL(zip_file)
        });
      });
  }
});
