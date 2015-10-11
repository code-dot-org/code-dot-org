var constants = require('../constants');

// Taken from http://stackoverflow.com/a/3627747/2506748
module.exports.rgb2hex = function (rgb) {
  if (rgb === '') {
    return rgb;
  }
  var parsed = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (parsed === null) {
    return rgb;
  }
  function hex(x) {
    return ("0" + parseInt(x).toString(16)).slice(-2);
  }
  return "#" + hex(parsed[1]) + hex(parsed[2]) + hex(parsed[3]);
};

/**
 * Gets the element's id, stripping the prefix.
 * @param element {Element}
 * @param prefix {string} Optional. Defaults to DESIGN_ELEMENT_ID_PREFIX.
 * @returns {string} The element id with prefix stripped, or null if it had no id.
 */
module.exports.getId = function (element, prefix) {
  var elementId = element.getAttribute('id');
  if (elementId === null) {
    return null;
  }
  prefix = prefix === undefined ? constants.DESIGN_ELEMENT_ID_PREFIX : prefix;
  // TODO(dave): disable checkId in production?
  checkId(element, prefix);
  if (elementId.indexOf(prefix) !== 0) {
    return elementId;
  }
  return elementId.substr(prefix.length);
};

/**
 * Sets the element's id, adding the prefix.
 * @param element {Element}
 * @param value (string)
 * @param prefix {string} Optional. Defaults to DESIGN_ELEMENT_ID_PREFIX.
 */
module.exports.setId = function (element, value, prefix) {
  if (value === null) {
    return;
  }
  prefix = prefix === undefined ? constants.DESIGN_ELEMENT_ID_PREFIX : prefix;
  element.setAttribute('id', prefix + value);
};

/**
 * Throws an error if the element's id does not start with the prefix.
 * @param element {Element}
 * @param prefix {string}
 */
var checkId = function(element, prefix) {
  if (element.id.indexOf(prefix) !== 0) {
    throw new Error('element.id "' + element.id + '" does not start with prefix "' + prefix + '".');
  }
};

/**
 * Add the prefix to the elementId and returns the element with that id.
 * @param elementId {string}
 * @param prefix {string} Optional. Defaults to DESIGN_ELEMENT_ID_PREFIX.
 * @returns {Element}
 */
module.exports.getElementById = function(elementId, prefix) {
  prefix = prefix === undefined ? constants.DESIGN_ELEMENT_ID_PREFIX : prefix;
  return document.getElementById(prefix + elementId);
};