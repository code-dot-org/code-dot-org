var constants = require('../constants');
var utils = require('../../utils');

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
var getId = module.exports.getId = function (element, prefix) {
  var elementId = element.getAttribute('id');
  if (elementId === null) {
    return null;
  }
  prefix = utils.valueOr(prefix, constants.DESIGN_ELEMENT_ID_PREFIX);
  checkId(element, prefix);
  return elementId.substr(prefix.length);
};

/**
 * Sets the element's id, adding the prefix.
 * @param element {Element}
 * @param value (string)
 * @param prefix {string} Optional. Defaults to DESIGN_ELEMENT_ID_PREFIX.
 */
var setId = module.exports.setId = function (element, value, prefix) {
  if (value === null) {
    return;
  }
  prefix = utils.valueOr(prefix, constants.DESIGN_ELEMENT_ID_PREFIX);
  element.setAttribute('id', prefix + value);
};

/**
 * Throws an error if the element's id does not start with the prefix.
 * @param element {Element}
 * @param prefix {string}
 */
function checkId(element, prefix) {
  if (element.id.substr(0, prefix.length) !== prefix) {
    throw new Error('element.id "' + element.id + '" does not start with prefix "' + prefix + '".');
  }
}

/**
 * Add the prefix to the elementId and returns the element with that id.
 * @param elementId {string}
 * @param prefix {string} Optional. Defaults to DESIGN_ELEMENT_ID_PREFIX.
 * @returns {Element}
 */
var getPrefixedElementById = module.exports.getPrefixedElementById = function(elementId, prefix) {
  prefix = prefix === undefined ? constants.DESIGN_ELEMENT_ID_PREFIX : prefix;
  return document.getElementById(prefix + elementId);
};

/**
 * Adds the prefix to the element's id.
 * @param element {Element}
 * @param prefix {string} Optional prefix to add. Defaults to ''.
 * @returns {Element}
 */
module.exports.addIdPrefix = function (element, prefix) {
  prefix = utils.valueOr(prefix, '');
  setId(element, element.getAttribute('id'), prefix);
};

/**
 * Removes the DESIGN_ELEMENT_ID_PREFIX from the element's id.
 * @param element {Element}
 * @returns {Element}
 */
module.exports.removeIdPrefix = function (element) {
  element.setAttribute('id', getId(element));
};

/**
 * Returns true if newId is available and won't collide with
 * other elements in design mode or the rest of applab.
 * @param {string} newId The id to evaluate.
 * @param {string} originalId The original id of this element.
 *     This will always be a valid value for newId.
 * @returns {boolean}
 */
module.exports.isIdAvailable = function(newId, originalId) {
  if (!newId) {
    return false;
  }
  if (newId === originalId) {
    return true;
  }

  // Don't allow if any other element in design mode has this prefixed id.
  if (getPrefixedElementById(newId)) {
    return false;
  }

  // Don't allow if any element outside of divApplab has this id.
  //
  // Elements in divApplab must be ignored since divApplab may be stale
  // with respect to what's in design mode, and we already caught any
  // collisions with design mode elements in the previous condition.
  var element = document.getElementById(newId);
  if (element && !$('#divApplab').find(element)[0]) {
    return false;
  }

  return true;
};
