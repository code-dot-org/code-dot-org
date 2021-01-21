import $ from 'jquery';
import * as constants from '../constants';
import * as utils from '../../utils';
import themeValues from '../themeValues';

// Taken from http://stackoverflow.com/a/3627747/2506748
export function rgb2hex(rgb) {
  if (rgb === '') {
    return rgb;
  }
  var parsed = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (parsed === null) {
    return rgb;
  }
  function hex(x) {
    return ('0' + parseInt(x).toString(16)).slice(-2);
  }
  return '#' + hex(parsed[1]) + hex(parsed[2]) + hex(parsed[3]);
}

/**
 * Gets the element's id, stripping the prefix.
 * @param element {Element}
 * @param prefix {string} Optional. Defaults to DESIGN_ELEMENT_ID_PREFIX.
 * @returns {string} The element id with prefix stripped, or null if it had no id.
 */
export function getId(element, prefix) {
  var elementId = element.getAttribute('id');
  if (elementId === null) {
    return null;
  }
  prefix = utils.valueOr(prefix, constants.DESIGN_ELEMENT_ID_PREFIX);
  checkId(element, prefix);
  return elementId.substr(prefix.length);
}

/**
 * Sets the element's id, adding the prefix.
 * @param element {Element}
 * @param value (string)
 * @param prefix {string} Optional. Defaults to DESIGN_ELEMENT_ID_PREFIX.
 */
export function setId(element, value, prefix) {
  if (value === null) {
    return;
  }
  prefix = utils.valueOr(prefix, constants.DESIGN_ELEMENT_ID_PREFIX);
  element.setAttribute('id', prefix + value);
}

/**
 * Throws an error if the element's id does not start with the prefix.
 * @param element {Element}
 * @param prefix {string}
 */
function checkId(element, prefix) {
  if (element.id.substr(0, prefix.length) !== prefix) {
    throw new Error(
      'element.id "' +
        element.id +
        '" does not start with prefix "' +
        prefix +
        '".'
    );
  }
}

/**
 * Add the prefix to the elementId and returns the element with that id.
 * @param elementId {string}
 * @param prefix {string} Optional. Defaults to DESIGN_ELEMENT_ID_PREFIX.
 * @returns {Element}
 */
export function getPrefixedElementById(elementId, prefix) {
  prefix = prefix === undefined ? constants.DESIGN_ELEMENT_ID_PREFIX : prefix;
  return document.getElementById(prefix + elementId);
}

/**
 * Adds the prefix to the element's id.
 * @param element {Element}
 * @param prefix {string} Optional prefix to add. Defaults to ''.
 * @returns {Element}
 */
export function addIdPrefix(element, prefix) {
  prefix = utils.valueOr(prefix, '');
  setId(element, element.getAttribute('id'), prefix);
}

/**
 * Removes the DESIGN_ELEMENT_ID_PREFIX from the element's id.
 * @param element {Element}
 * @returns {Element}
 */
export function removeIdPrefix(element) {
  element.setAttribute('id', getId(element));
}

// TODO(dave): remove denylist once element ids inside divApplab
// are namespaced: https://www.pivotaltracker.com/story/show/113011395
var ELEMENT_ID_DENYLIST = [
  'finishButton',
  'submitButton',
  'unsubmitButton',
  'turtleImage',
  'prompt-icon',
  'bubble'
];

var TURTLE_CANVAS_ID = 'turtleCanvas';

/**
 * Returns true if newId is available and won't collide with other elements.
 * Always reject element ids which are denylisted or already exist outside divApplab.
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
export function isIdAvailable(newId, options) {
  options = options || {};
  if (!newId) {
    return false;
  }

  // Don't allow denylisted elements.
  if (ELEMENT_ID_DENYLIST.indexOf(newId) !== -1) {
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
  if (
    !options.allowDesignPrefix &&
    newId.indexOf(constants.DESIGN_ELEMENT_ID_PREFIX) === 0
  ) {
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
}

export function getScreens() {
  return $('#designModeViz > .screen');
}

export function getDefaultScreenId() {
  return getId(getScreens()[0]);
}

/**
 * Sets the default font family style on an element if it is
 * not already specified.
 * @param {DOMElement} element The element to modify.
 */
export function setDefaultFontFamilyStyle(element) {
  if (element.style.fontFamily === '') {
    element.style.fontFamily = constants.fontFamilyStyles[0];
  }
}

/**
 * Sets the default border styles on a new element.
 * @param {DOMElement} element The element to modify.
 * @param {Object.<string, boolean>} options Optional map of options
 *     indicating how the styles should be applied.
 * @param {string} options.textInput treat the element as a text
 *     input or text area, which has a gray default border. Default: false
 * @param {string} options.forceDefaults: always set default
 *     styles, even if current styles already exist. Default: false
 */
export function setDefaultBorderStyles(element, options = {}) {
  const {textInput, forceDefaults} = options;
  element.style.borderStyle = 'solid';
  if (forceDefaults || element.style.borderWidth === '') {
    element.style.borderWidth = textInput ? '1px' : '0px';
  }
  if (forceDefaults || element.style.borderColor === '') {
    // Backfill borderColor property to match "classic" values:
    // rgb(153, 153, 153) for textInput, #000000 for everything else
    element.style.borderColor = textInput
      ? themeValues.textInput.borderColor.classic
      : themeValues.dropdown.borderColor.classic;
  }
  if (forceDefaults || element.style.borderRadius === '') {
    element.style.borderRadius = '0px';
  }
}

/**
 * Parse a padding string and return the total horizontal padding and
 * total vertical padding.
 * @param {string} cssPaddingString value from element.style.padding
 */
export function calculatePadding(cssPaddingString) {
  // Extract up to 4 numbers, ignoring the 'px' that may be included

  // NOTE: if other measurement values (e.g. 'em') make it into the padding string,
  // we will treat them as 'px' values

  // Ideally, we could use getComputedStyle(), but we need to work with
  // detached DOM nodes, which doesn't work on Chrome and Safari

  const paddingValues = (cssPaddingString || '')
    .split(/\s+/)
    .map(part => parseInt(part, 10));
  for (
    var validPaddingValues = 0;
    validPaddingValues < paddingValues.length;
    validPaddingValues++
  ) {
    if (isNaN(paddingValues[validPaddingValues])) {
      break;
    }
  }

  // The meaning of the numeric values depends on the number that are supplied.
  // 1 value: Apply to all four sides
  // 2 values: vertical | horizontal
  // 3 values: top | horizontal | bottom
  // 4 values: top | right | bottom | left
  // See https://developer.mozilla.org/en-US/docs/Web/CSS/padding#Syntax
  let horizontalPadding, verticalPadding;
  switch (validPaddingValues) {
    case 1:
      horizontalPadding = verticalPadding = 2 * paddingValues[0];
      break;
    case 2:
      verticalPadding = 2 * paddingValues[0];
      horizontalPadding = 2 * paddingValues[1];
      break;
    case 3:
      verticalPadding = paddingValues[0] + paddingValues[2];
      horizontalPadding = 2 * paddingValues[1];
      break;
    case 4:
      verticalPadding = paddingValues[0] + paddingValues[2];
      horizontalPadding = paddingValues[1] + paddingValues[3];
      break;
    default:
      horizontalPadding = verticalPadding = 0;
      break;
  }
  return {
    horizontalPadding,
    verticalPadding
  };
}
