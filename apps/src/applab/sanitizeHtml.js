var sanitize = require('sanitize-html');
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

  var removedLines = beforeLines.filter(function (line) {
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
  allSchemes.indexOf = function () {
    return 0;
  };

  // Do not warn when these attributes are removed.
  var ignoredAttributes = [
    'pmbx_context',   // Used by Chrome plugins such as Bitdefender Wallet.
    'kl_vkbd_parsed', // Origin unknown. Assumed to be a plugin of some kind.
    'vk_16761',       // Origin unknown.
    'abp'             // adblock plus plugin.
  ];

  var processed = sanitize(unsafe, {
    allowedTags: false,
    allowedAttributes: false,
    allowedSchemes: allSchemes,
    // Use transformTags to ignore certain attributes, since allowedAttributes
    // can only accept a whitelist not a blacklist.
    transformTags: {
      '*': function (tagName, attribs) {
        for (var i = 0; i < ignoredAttributes.length; i++) {
          var ignored = ignoredAttributes[i];
          if (attribs[ignored]) {
            delete attribs[ignored];
          }
        }
        return {
          tagName: tagName,
          attribs: attribs
        };
      }
    }
  });
  if (processed != safe) {
    warn(removedHtml(processed, safe), unsafe, safe, warnings);
  }
}

/**
 * Reject element ids that might collide with other elements.
 * @param {string} elementId
 * @returns {boolean} Whether the element id is valid.
 */
function isIdAvailable(elementId) {
  // We only care if an ID is blacklisted or already in use in this case.
  var options = {
    allowCodeElements: false,
    allowDesignElements: true,
    allowDesignPrefix: true
  };
  if (!elementUtils.isIdAvailable(elementId, options)) {
    return false;
  }
  return true;
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

  // Define tags with a standard set of allowed attributes

  var standardAttributes = ['id', 'class', 'data-*', 'height', 'style',  'title', 'width'];
  // <i> could allow people to covertly specify font awesome icons, which seems ok
  var tagsWithStandardAttributes = [
    'b', 'br', 'canvas', 'em', 'font', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr',
    'i', 'label', 'li', 'ol', 'option', 'p', 'span', 'strong', 'table', 'td', 'th',
    'tr', 'u', 'ul'
  ];
  var defaultAttributesMap = {};
  tagsWithStandardAttributes.forEach(function (tag) {
    defaultAttributesMap[tag] = standardAttributes;
  });

  // Define tags with a custom set of allowed attributes

  var customAttributesMap = {
    button: standardAttributes.concat(['data-canonical-image-url']),
    div: standardAttributes.concat(['contenteditable', 'data-canonical-image-url', 'tabindex', 'xmlns']),
    img: standardAttributes.concat(['data-canonical-image-url', 'src']),
    input: standardAttributes.concat(['autocomplete', 'checked', 'max', 'min', 'name', 'placeholder', 'step', 'type', 'value']),
    select: standardAttributes.concat(['multiple', 'size'])
  };
  var tagsWithCustomAttributes = Object.keys(customAttributesMap);

  var allowedTags = sanitize.defaults.allowedTags.concat(tagsWithStandardAttributes)
    .concat(tagsWithCustomAttributes);
  var allowedAttributes = $.extend({}, sanitize.defaults.allowedAttributes,
    defaultAttributesMap, customAttributesMap);
  var safe = sanitize(unsafe, {
    allowedTags: allowedTags,
    allowedAttributes: allowedAttributes,
    allowedSchemes: sanitize.defaults.allowedSchemes.concat(['data']),
    transformTags: {
      '*': function (tagName, attribs) {
        if (rejectExistingIds && attribs.id && !isIdAvailable(attribs.id)) {
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
