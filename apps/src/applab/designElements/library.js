/* global $ */

var utils = require('../../utils');
var _ = utils.getLodash();

// TODO - rename elements directory to designElements?

/**
 * A map from prefix to the next numerical suffix to try to
 * use as an id in the applab app's DOM.
 * @type {Object.<string, number>}
 */
var nextElementIdMap = {};

var elements = {
  BUTTON: require('./button'),
  TEXT: require('./text'),
  TEXT_INPUT: require('./textInput'),
};

module.exports = {
  /**
   * Returns an element id with the given prefix which is unused within
   * the applab app's DOM.
   * @param {string} prefix
   * @returns {string}
   */
  getUnusedElementId: function (prefix) {
    var divApplab = $('#divApplab');
    var i = nextElementIdMap[prefix] || 1;
    while (divApplab.find("#" + prefix + i).length !== 0) {
      i++;
    }
    nextElementIdMap[prefix] = i + 1;
    return prefix + i;
  },

  /**
   * Create a new element of the specified type
   * @param {ElementType} elementType Type of element to create
   * @param {number} left Position from left.
   * @param {number} top Position from top.
   */
  createElement: function (elementType, left, top) {
    var elementClass = elements[elementType];
    if (!elementClass) {
      throw new Error('Unknown elementType: ' + elementType);
    }

    var element = elementClass.create();

    // Stuff that's common across all elements
    element.id = this.getUnusedElementId(elementType.toLowerCase());
    element.style.position = 'absolute';
    element.style.left = left + 'px';
    element.style.top = top + 'px';

    return element;
  }
};
