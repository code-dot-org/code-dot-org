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

// TODO(dave): remove blacklist once element ids inside divApplab
// are namespaced: https://www.pivotaltracker.com/story/show/113011395
var ELEMENT_ID_BLACKLIST = [
  'finishButton',
  'submitButton',
  'unsubmitButton',
  'turtleImage',
  'prompt-icon'
];

var TURTLE_CANVAS_ID = 'turtleCanvas';

/**
 * Returns true if newId is available and won't collide with other elements.
 * Always reject element ids which are blacklisted or already exist outside divApplab.
 * Allow or reject other element types based on the options specified.
 * @param {string} newId The id to evaluate.
 * @param {Object.<string, boolean>} options Optional map of options
 *     indicating whether certain elements are allowed.
 * @param {string} options.allowCodeElements allow element ids which are
 *     inside divApplab. Default: false
 * @param {string} options.allowDesignElements: allow element ids which, when
 *     prefixed with "design_", already exist in designModeViz. Default: false
 * @param {string} options.allowDesignPrefix: allow element ids which
 *     start with "design_". Default: false
 * @param {string} options.allowTurtleCanvas: allow turtle canvas element
 *     to be created. Default: false
 * @returns {boolean}
 */
module.exports.isIdAvailable = function(newId, options) {
  options = options || {};
  if (!newId) {
    return false;
  }

  // Don't allow blacklisted elements.
  if (ELEMENT_ID_BLACKLIST.indexOf(newId) !== -1) {
    return false;
  }

  if (!options.allowTurtleCanvas && TURTLE_CANVAS_ID === newId) {
    return false;
  }

  // Don't allow elements with reserved prefixes. Otherwise you can have
  // problems like this:
  //   1. allow 'design_button1' here. '#designModeViz #design_design_button1' is created
  //      but 'design_button1' is not created anywhere.
  //   2. allow 'button1'. '#designModeViz #design_button1' is created.
  //   3. Press Run. '#designModeViz #design_design_button1' is serialized to
  //      '#divApplab #design_button1', which collides with '#designModeViz #design_button1'.
  //
  // TODO(dave): remove this condition when we start namespacing, since
  // '#divApplab #code_design_button1' would be created in step 3 instead.

  // Don't allow elements with the "design_" prefix, unless
  // options.allowDesignPrefix is specified.
  if (!options.allowDesignPrefix && newId.indexOf(constants.DESIGN_ELEMENT_ID_PREFIX) === 0) {
    return false;
  }

  // Don't allow if any other element in design mode has this prefixed id
  // (e.g. don't allow 'button1' if 'design_button1' exists),
  // unless options.allowDesignElements is specified.
  if (!options.allowDesignElements && getPrefixedElementById(newId)) {
    return false;
  }

  // Don't allow if any element outside of divApplab has this id.
  var element = document.getElementById(newId);
  if (element && !$('#divApplab').find(element)[0]) {
    return false;
  }

  // Don't allow if any element inside divApplab has this id,
  // unless options.allowCodeElements is specified.
  var existsInApplab = Boolean(element && $('#divApplab').find(element)[0]);
  if (!options.allowCodeElements && existsInApplab) {
    return false;
  }

  return true;
};

module.exports.getScreens = function getScreens() {
  return $('#designModeViz > .screen');
};
