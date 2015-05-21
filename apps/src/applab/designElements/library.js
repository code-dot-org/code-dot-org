/* global $ */

var utils = require('../../utils');
var _ = utils.getLodash();

/**
 * A map from prefix to the next numerical suffix to try to
 * use as an id in the applab app's DOM.
 * @type {Object.<string, number>}
 */
var nextElementIdMap = {};

var elements = {
  BUTTON: require('./button.jsx'),
  LABEL: require('./label.jsx'),
  TEXT_INPUT: require('./textInput.jsx'),
  CHECKBOX: require('./checkbox.jsx')
};

module.exports = {
  /**
   * Returns an element id with the given prefix which is unused within
   * the applab app's DOM.
   * @param {string} prefix
   * @returns {string}
   */
  // TODO (brent) - the following seems a little bit strange to me:
  // 1) Add item1, item2, delete item1
  // 2) Add another item, it gets id item3
  // 3) Reload page, add another item, it gets item1
  // Seems a little like we should always get the lowest available (as in step 3)
  // or always get the next (as in step 2)
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
  },

  getElementPropertyTable: function (elementType) {
    return elements[elementType].PropertyTable;
  },

  /**
   * @param {HTMLElement} element
   * @returns {string} String representing elementType
   */
  getElementType: function (element) {
    var tagname = element.tagName.toLowerCase();
    switch (tagname) {
      case 'button':
        return 'BUTTON';
      case 'label':
        return 'LABEL';
      case 'input':
        if (element.getAttribute('type') === 'checkbox') {
          return 'CHECKBOX';
        }
        return 'TEXT_INPUT';
    }
    throw new Error('unknown element type');
  },

  /**
   * Code to be called after deserializing element, allowing us to attach any
   * necessary event handlers.
   */
  onDeserialize: function (element) {
    var elementType = this.getElementType(element);
    if (elements[elementType].onDeserialize) {
      elements[elementType].onDeserialize(element);
    }
  }
};
