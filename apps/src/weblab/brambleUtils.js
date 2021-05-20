/**
 * Remove disallowed content from the HTML at the given path. The editor will be set as readOnly
 * while this method overwrites the HTML file. Use this method carefully as it does overwrite
 * file contents.
 *
 * @param {Object} fileSystem - The current file system. This method requires `readFile` and `writeFile` methods.
 * @param {Object} brambleProxy - Communicate with Bramble. This method requires `enableReadonly` and `disableReadonly` methods.
 * @param {string} path - Path to the HTML file.
 * @param {Array<string>} disallowedTags - HTML tags that should be removed.
 * @param {func} callback - Will be called with the given path. Optional.
 */
function removeDisallowedHtmlContent(
  fileSystem,
  brambleProxy,
  path,
  disallowedTags,
  callback
) {
  function wrappedCallback() {
    if (callback) {
      callback(path);
    }
  }

  if (!path.endsWith('.html')) {
    wrappedCallback();
    return;
  }

  fileSystem.readFile(path, 'utf8', function(error, data) {
    if (error) {
      wrappedCallback();
      return;
    }

    const dom = new DOMParser().parseFromString(data, 'text/html');
    const nodes = dom.querySelectorAll(disallowedTags.join(', '));
    if (nodes.length <= 0) {
      wrappedCallback();
      return;
    }

    brambleProxy.enableReadOnly();
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].parentElement.removeChild(nodes[i]);
    }
    data = createHtmlDocument(
      dom.head.innerHTML.trim(),
      dom.body.innerHTML.trim()
    );

    fileSystem.writeFile(path, Buffer.from(data), function(error) {
      brambleProxy.disableReadOnly();
      wrappedCallback();
    });
  });
}

function createHtmlDocument(headContent, bodyContent) {
  return `<!DOCTYPE html>\n<html>\n  <head>\n${headContent ||
    ''}\n  </head>\n  <body>\n    ${bodyContent || ''}\n  </body>\n</html>`;
}

export default {
  removeDisallowedHtmlContent,
  createHtmlDocument
};
