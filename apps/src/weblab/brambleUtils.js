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

    const dom = new DOMParser().parseFromString(data, 'text/xml');
    // An invalid DOM returns an error document rather than throwing an error:
    // https://developer.mozilla.org/en-US/docs/Web/API/DOMParser#examples
    if (dom.documentElement.innerHTML.includes('parsererror')) {
      wrappedCallback();
      return;
    }

    const nodes = dom.querySelectorAll(disallowedTags.join(', '));
    if (nodes.length <= 0) {
      wrappedCallback();
      return;
    }

    brambleProxy.enableReadOnly();
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].parentElement.removeChild(nodes[i]);
    }
    // We prefer <!DOCTYPE html>\n<html>, but serializeToString returns
    // <!DOCTYPE html><html>. Manually add newline to keep formatting consistent.
    data = new XMLSerializer()
      .serializeToString(dom)
      .replace('<!DOCTYPE html>', '<!DOCTYPE html>\n');

    fileSystem.writeFile(path, Buffer.from(data), function(error) {
      brambleProxy.disableReadOnly();
      wrappedCallback();
    });
  });
}

export default {
  removeDisallowedHtmlContent
};
