var sanitizeHtml = require('sanitize-html');

/**
 * Return any html which is present in 'before' and absent in 'after'.
 * @param {string} before
 * @param {string} after
 */
function removedHtml(before, after) {
  var beforeLines = before.replace(/</gi, '\n<').split('\n');
  var afterLines = after.replace(/</gi, '\n<').split('\n');

  var afterLinesMap = {};
  for (var i = 0; i < afterLines.length; i++) {
    afterLinesMap[afterLines[i]] = true;
  }

  var removedLines = beforeLines.filter(function(line) {
    return !afterLinesMap[line];
  });

  return removedLines.join('\n');
}

/**
 * Warn if any non-cosmetic changes were made to the html.
 * @param  {function(removed, unsafe, safe)} warn Function to call if
 *     any unsafe html was removed from the output.
 * @param {string} unsafe
 * @param {string} safe
 */
function warnAboutUnsafeHtml(warn, unsafe, safe) {
  // Sanitizing the html can cause some cosmetic changes, such as converting
  // <img src=''> or <img src> to <img src/>. Process the unsafe html
  // making as few changes as possible, to remove any cosmetic differences
  // from our comparison.
  //
  // HACK: there is no option to accept all url schemes via
  // `allowedSchemes` as there is with other options. Instead,
  // provide an Array which claims to contain any element. See
  // https://github.com/punkave/sanitize-html/blob/master/index.js
  // for why this works. This hack is necessary in order to warn when
  // attributes containing disallowed URL schemes are removed.
  var allSchemes = [];
  allSchemes.indexOf = function() {
    return 0;
  };

  var processed = sanitizeHtml(unsafe, {
    allowedTags: false,
    allowedAttributes: false,
    allowedSchemes: allSchemes
  });
  if (processed != safe) {
    warn(removedHtml(processed, safe), unsafe, safe);
  }
}

// Sanitize html using a whitelist of tags and attributes.
// see default options at https://www.npmjs.com/package/sanitize-html
/**
 *
 * @param {string} unsafe Unsafe html to sanitize.
 * @param {function(removed, unsafe, safe)} warn Optional function to call if
 *     any unsafe html was removed from the output.
 */
module.exports = function(unsafe, warn) {
  var safe = sanitizeHtml(unsafe, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'button', 'canvas', 'img', 'input', 'option', 'label', 'select']),
    allowedAttributes: $.extend({}, sanitizeHtml.defaults.allowedAttributes, {
      button: ['id', 'class', 'style'],
      canvas: ['id', 'class', 'style', 'width', 'height'],
      div: ['id', 'class', 'style', 'contenteditable', 'tabindex'],
      img: ['id', 'class', 'data-canonical-image-url', 'src', 'style'],
      input: ['id', 'checked', 'class', 'style', 'type', 'value'],
      label: ['id', 'class', 'style'],
      select: ['id', 'class', 'style']
    }),
    allowedSchemes: sanitizeHtml.defaults.allowedSchemes.concat(['data'])
  });

  if (typeof warn === 'function' && safe != unsafe) {
    warnAboutUnsafeHtml(warn, unsafe, safe);
  }

  return safe;
};
