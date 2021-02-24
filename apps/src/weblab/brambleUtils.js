/**
 * Remove disallowed content from the HTML at the given path. The editor will be set as readOnly
 * while this method overwrites the HTML file. Use this method carefully as it does overwrite
 * file contents.
 *
 * @param {Object} fileSystem - The current file system. This method requires `readFile` and `writeFile` methods.
 * @param {Object} brambleProxy - Communicate with Bramble. This method requires `enableReadonly` and `disableReadonly` methods.
 * @param {string} path - Path to the HTML file.
 * @param {RegExp} regex - Used to match on and remove disallowed content.
 * @param {func} callback - Will be called with the given path. Optional.
 */
function removeDisallowedHtmlContent(
  fileSystem,
  brambleProxy,
  path,
  regex,
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
    if (error || !data.match(regex)) {
      wrappedCallback();
      return;
    }

    brambleProxy.enableReadonly();
    data = data.replace(regex, '');
    fileSystem.writeFile(path, Buffer.from(data), function(error) {
      brambleProxy.disableReadonly();
      wrappedCallback();
    });
  });
}

export default {
  removeDisallowedHtmlContent
};
