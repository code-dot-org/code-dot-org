var sanitize = require('sanitize-html');
var applabConstants = require('./constants');
var elementUtils = require('./designElements/elementUtils');

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
 * @param {string} unsafe Unsafe html.
 * @param {string} safe Safe html.
 * @param {Array<string>} warnings Warnings to display.
 */
function warnAboutUnsafeHtml(warn, unsafe, safe, warnings) {
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

  var processed = sanitize(unsafe, {
    allowedTags: false,
    allowedAttributes: false,
    allowedSchemes: allSchemes
  });
  if (processed != safe) {
    warn(removedHtml(processed, safe), unsafe, safe, warnings);
  }
}

/**
 * Sanitize html using a whitelist of tags and attributes.
 * see default options at https://www.npmjs.com/package/sanitize-html
 * @param {string} unsafe Unsafe html to sanitize.
 * @param {function(removed, unsafe, safe, warnings)} warn Optional function
 *     to call if any unsafe html was removed from the output.
 * @param {boolean} rejectExistingIds Optional if true, remove ids
 *     which already exist in the DOM and give a warning.
 */
module.exports = function sanitizeHtml(unsafe, warn, rejectExistingIds) {
  var warnings = [];
  var safe = sanitize(unsafe, {
    allowedTags: sanitize.defaults.allowedTags.concat([
      'button', 'canvas', 'img', 'input', 'option', 'label', 'select']),
    allowedAttributes: $.extend({}, sanitize.defaults.allowedAttributes, {
      button: ['id', 'class', 'style', 'data-canonical-image-url'],
      canvas: ['id', 'class', 'style', 'width', 'height'],
      div: ['id', 'class', 'style', 'data-canonical-image-url', 'contenteditable', 'tabindex', 'xmlns'],
      img: ['id', 'class', 'data-canonical-image-url', 'src', 'style'],
      input: ['id', 'checked', 'class', 'max', 'min', 'placeholder', 'step', 'style', 'type', 'value'],
      label: ['id', 'class', 'style'],
      select: ['id', 'class', 'style']
    }),
    allowedSchemes: sanitize.defaults.allowedSchemes.concat(['data']),
    transformTags: {
      '*': function(tagName, attribs) {
        var isBlacklisted = (elementUtils.ELEMENT_ID_BLACKLIST.indexOf(attribs.id) !== -1);
        if (rejectExistingIds && (document.getElementById(attribs.id) || isBlacklisted)) {
          warnings.push('element id is already in use: ' + attribs.id);
          delete attribs.id;
        }
        return {
          tagName: tagName,
          attribs: attribs
        };
      }
    }
  });

  if (typeof warn === 'function' && safe != unsafe) {
    warnAboutUnsafeHtml(warn, unsafe, safe, warnings);
  }

  return safe;
};
