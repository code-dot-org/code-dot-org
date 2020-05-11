import $ from 'jquery';
import * as utils from '../../utils';
import * as elementUtils from './elementUtils';
import designMode from '../designMode';
import {themeOptions, DEFAULT_THEME_INDEX} from '../constants';
/**
 * A map from prefix to the next numerical suffix to try to
 * use as an id in the applab app's DOM.
 * @type {Object.<string, number>}
 */
var nextElementIdMap = {};

/**
 * @readonly
 * @enum {string}
 */
var ElementType = utils.makeEnum(
  'BUTTON',
  'LABEL',
  'TEXT_INPUT',
  'CHECKBOX',
  'DROPDOWN',
  'RADIO_BUTTON',
  'TEXT_AREA',
  'IMAGE',
  'CANVAS',
  'SCREEN',
  'CHART',
  'SLIDER',
  'PHOTO_SELECT'
);

var elements = {};
elements[ElementType.BUTTON] = require('./button');
elements[ElementType.LABEL] = require('./label');
elements[ElementType.TEXT_INPUT] = require('./textInput');
elements[ElementType.CHECKBOX] = require('./checkbox');
elements[ElementType.DROPDOWN] = require('./dropdown');
elements[ElementType.RADIO_BUTTON] = require('./radioButton');
elements[ElementType.TEXT_AREA] = require('./textarea');
elements[ElementType.IMAGE] = require('./image');
elements[ElementType.CANVAS] = require('./canvas');
elements[ElementType.SCREEN] = require('./screen');
elements[ElementType.CHART] = require('./chart');
elements[ElementType.SLIDER] = require('./slider');
elements[ElementType.PHOTO_SELECT] = require('./photoSelect');

export default {
  ElementType: ElementType,
  /**
   * Returns an element id with the given prefix which is unused within
   * the applab app's DOM.
   * @param {string} prefix
   * @returns {string}
   */
  // Potentially strange behavior here:
  // 1) Add item1, item2, delete item1
  // 2) Add another item, it gets id item3
  // 3) Reload page, add another item, it gets item1
  // Seems a little like we should always get the lowest available (as in step 3)
  // or always get the next (as in step 2)
  getUnusedElementId: function(prefix) {
    var i = nextElementIdMap[prefix] || 1;
    while (elementUtils.getPrefixedElementById(prefix + i)) {
      i++;
    }
    nextElementIdMap[prefix] = i + 1;
    return prefix + i;
  },

  /**
   * Resets the next element id for all prefixes to be 1. Called after clearing
   * all design mode elements
   */
  resetIds: function() {
    nextElementIdMap = {};
  },

  /**
   * Create a new element of the specified type
   * @param {ElementType} elementType Type of element to create
   * @param {number} left Position from left.
   * @param {number} top Position from top.
   * @param {boolean} [withoutId] If true, don't generate an id
   */
  createElement: function(elementType, left, top, withoutId) {
    var elementClass = elements[elementType];
    if (!elementClass) {
      throw new Error('Unknown elementType: ' + elementType);
    }

    var element = elementClass.create(withoutId);

    // Stuff that's common across all elements
    if (!withoutId) {
      elementUtils.setId(
        element,
        this.getUnusedElementId(elementType.toLowerCase())
      );
    }

    if (elementType !== ElementType.SCREEN) {
      element.style.position = 'absolute';
      element.style.left = left + 'px';
      element.style.top = top + 'px';
      element.style.margin = '0px';
    }

    return element;
  },

  getElementPropertyTab: function(elementType) {
    return elements[elementType].PropertyTab;
  },

  getElementEventTab: function(elementType) {
    return elements[elementType].EventTab;
  },

  /**
   * @param {HTMLElement} element
   * @param {boolean?} allowUnknown If true, we won't throw on unknown element types
   * @returns {string} String representing elementType
   */
  getElementType: function(element, allowUnknown) {
    var tagname = element.tagName.toLowerCase();
    switch (tagname) {
      case 'button':
        return ElementType.BUTTON;
      case 'label':
        if ($(element).hasClass('img-upload')) {
          return ElementType.PHOTO_SELECT;
        } else {
          return ElementType.LABEL;
        }
      case 'select':
        return ElementType.DROPDOWN;
      case 'div':
        if ($(element).hasClass('screen')) {
          return ElementType.SCREEN;
        } else if ($(element).hasClass('chart')) {
          return ElementType.CHART;
        }
        return ElementType.TEXT_AREA;
      case 'img':
        return ElementType.IMAGE;
      case 'canvas':
        return ElementType.CANVAS;
      case 'input':
        switch (element.getAttribute('type')) {
          case 'checkbox':
            return ElementType.CHECKBOX;
          case 'radio':
            return ElementType.RADIO_BUTTON;
          case 'range':
            return ElementType.SLIDER;
          default:
            return ElementType.TEXT_INPUT;
        }
    }
    let errorMessage =
      'Project contains an element with an unknown type' +
      `\nType: ${element.tagName}` +
      `\nId: ${element.id}` +
      `\nClass: ${element.className}`;
    // Unknown elements are expected. Return null because we don't know type.
    if (allowUnknown) {
      console.warn(errorMessage);
      return null;
    }
    // TODO: Gracefully handle errors from malformed design mode elements
    throw new Error(errorMessage);
  },

  /**
   * Gets the theme values for this element type (if specified).
   */
  getThemeValues: function(element) {
    const elementType = this.getElementType(element);
    const {themeValues} = elements[elementType] || {};
    return themeValues;
  },

  getCurrentTheme: function(parentScreen) {
    return (
      (parentScreen && parentScreen.getAttribute('data-theme')) ||
      themeOptions[DEFAULT_THEME_INDEX]
    );
  },

  /**
   * Sets all properties on the element to reflect the current theme
   * of the parent screen. This function ignores any student customization
   * on those properties and overwrites all theme properties.
   */
  setAllPropertiesToCurrentTheme: function(element, parentScreen) {
    const currentTheme = this.getCurrentTheme(parentScreen);
    const themeValues = this.getThemeValues(element);
    for (const propName in themeValues) {
      const propTheme = themeValues[propName];
      const defaultValue = propTheme[currentTheme];
      designMode.updateProperty(element, propName, defaultValue);
    }
  },

  /**
   * Code to be called after deserializing element, allowing us to attach any
   * necessary event handlers.
   */
  onDeserialize: function(element, updateProperty, skipIfUnknown) {
    var elementType = this.getElementType(element, skipIfUnknown);
    if (
      elementType &&
      elements[elementType] &&
      elements[elementType].onDeserialize
    ) {
      elements[elementType].onDeserialize(element, updateProperty);
    }
  },

  /**
   * Gets data from an element before it is changed, should it be necessary to do so. This data will be passed to the
   * typeSpecificPropertyChange method below.
   */
  getPreChangeData: function(element, name, batchChangeId) {
    var elementType = this.getElementType(element);
    if (elements[elementType].beforePropertyChange) {
      return elements[elementType].beforePropertyChange(
        element,
        name,
        batchChangeId
      );
    }
    return null;
  },

  /**
   * Handle any element specific property changes. Called after designMode gets
   * first crack at handling change.
   * @returns {boolean} True if we modified the element in such a way that the
   *   property table needs to be updated.
   */
  typeSpecificPropertyChange: function(element, name, value, preChangeData) {
    var elementType = this.getElementType(element);
    if (elements[elementType].onPropertyChange) {
      return elements[elementType].onPropertyChange(
        element,
        name,
        value,
        preChangeData
      );
    }
    return false;
  },

  /**
   * Handle a read of an element-specific property type. Throw an error if the
   * property type is not recognized or there is no handler for reading
   * element-specific properties.
   * @param {Element} element
   * @param {String} name Property name.
   * @returns {*}
   */
  typeSpecificPropertyRead: function(element, name) {
    const elementType = this.getElementType(element);
    if (elements[elementType].readProperty) {
      return elements[elementType].readProperty(element, name);
    }
    throw `unknown property type ${name}`;
  }
};
