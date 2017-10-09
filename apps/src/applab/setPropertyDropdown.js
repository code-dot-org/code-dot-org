/**
 * This file manages logic for the dropdown used in our setProperty block
 */
import _ from 'lodash';

import {getFirstParam, getSecondParam, setParamAtIndex} from '../dropletUtils';
import library from './designElements/library';
import getAssetDropdown from '../assetManagement/getAssetDropdown';
var ElementType = library.ElementType;

/**
 * A set of all properties that can be set using setProperty. Elsewhere, we
 * filter these according to element type. Note: There are some properties
 * where friendlyName is shared (canvasWidth and width both use 'width') but
 * internalName is not.
 * Note: The order here affects the order of items in the dropdown for unknown
 * element types
 * friendlyName: Name used in the code editor to refer to this property
 * internalName: Name used in updateProperty to refer to this property
 * type: Type of this property, used for validation at run time.
 * alias (optional): True if this property should not be displayed to the user
 *     in the drop down list of properties
 */
var PROP_INFO = {
  width: { friendlyName: 'width', internalName: 'style-width', type: 'number'},
  height: { friendlyName: 'height', internalName: 'style-height', type: 'number' },
  canvasWidth: { friendlyName: 'width', internalName: 'width', type: 'number'},
  canvasHeight: { friendlyName: 'height', internalName: 'height', type: 'number' },
  x: { friendlyName: 'x', internalName: 'left', type: 'number' },
  y: { friendlyName: 'y', internalName: 'top', type: 'number' },
  textColor: { friendlyName: 'text-color', internalName: 'textColor', type: 'string' },
  backgroundColor: { friendlyName: 'background-color', internalName: 'backgroundColor', type: 'string' },
  fontSize: { friendlyName: 'font-size', internalName: 'fontSize', type: 'number' },
  textAlign: { friendlyName: 'text-align', internalName: 'textAlign', type: 'string' },
  hidden: { friendlyName: 'hidden', internalName: 'hidden', type: 'boolean' },
  text: { friendlyName: 'text', internalName: 'text', type: 'uistring' },
  placeholder: { friendlyName: 'placeholder', internalName: 'placeholder', type: 'uistring' },
  image: { friendlyName: 'image', internalName: 'image', type: 'string' },
  screenImage: { friendlyName: 'image', internalName: 'screen-image', type: 'string' },
  // pictureImage and picture both map to 'picture' internally, but allow us to accept
  // either 'image' or 'picture' as the property name. picture is marked as an alias so
  // it won't show up in the dropdown.
  pictureImage: { friendlyName: 'image', internalName: 'picture', type: 'string' },
  picture: { friendlyName: 'picture', internalName: 'picture', type: 'string', alias: true },
  iconColor: { friendlyName: 'icon-color', internalName: 'icon-color', type: 'string' },
  groupId: { friendlyName: 'group-id', internalName: 'groupId', type: 'string' },
  checked: { friendlyName: 'checked', internalName: 'checked', type: 'boolean' },
  readonly: { friendlyName: 'readonly', internalName: 'readonly', type: 'boolean' },
  options: { friendlyName: 'options', internalName: 'options', type: 'array' },
  value: { friendlyName: 'value', internalName: 'defaultValue', type: 'number' },
  min: { friendlyName: 'min', internalName: 'min', type: 'number' },
  max: { friendlyName: 'max', internalName: 'max', type: 'number' },
  step: { friendlyName: 'step', internalName: 'step', type: 'number' }
};

let DEFAULT_PROP_VALUES = {
  width: '100',
  height: '100',
  x: '100',
  y: '100',
  'text-color': '"red"',
  'background-color': '"red"',
  'font-size': '100',
  'text-align': '"left"',
  hidden: 'true',
  text: '"text"',
  placeholder: '"text"',
  image: '"https://code.org/images/logo.png"',
  'icon-color': '"red"',
  'group-id': '"text"',
  checked: 'true',
  readonly: 'true',
  options: '["option1", "etc"]',
  value: '100',
  min: '100',
  max: '100',
  step: '100',
};

// When we don't know the element type, we display all possible friendly names
var fullDropdownOptions = _.uniq(Object.keys(PROP_INFO).map(function (key) {
  return '"' + PROP_INFO[key].friendlyName + '"';
}));

/**
 * Information about properties pertaining to each element type. Values have the following
 * fields. The latter two fields (friendlyNames and infoForFriendlyNames) are initialized
 * through code run at startup time.
 * propertyNames: a list of names (keys for PROP_INFO) associated with that element
 * dropdownOptions: an array of property friendly names to be shown to the user for that element
 * infoForFriendlyName: map from all friendly names for that element to property info
 */
var PROPERTIES = {};
PROPERTIES[ElementType.BUTTON] = {
  propertyNames: [
    'text',
    'width',
    'height',
    'x',
    'y',
    'textColor',
    'backgroundColor',
    'fontSize',
    'textAlign',
    'image',
    'iconColor',
    'hidden'
  ]
};
PROPERTIES[ElementType.TEXT_INPUT] = {
  propertyNames: [
    'text',
    'placeholder',
    'width',
    'height',
    'x',
    'y',
    'textColor',
    'backgroundColor',
    'fontSize',
    'textAlign',
    'hidden'
  ]
};
PROPERTIES[ElementType.LABEL] = {
  propertyNames: [
    'text',
    'width',
    'height',
    'x',
    'y',
    'textColor',
    'backgroundColor',
    'fontSize',
    'textAlign',
    'hidden'
  ]
};
PROPERTIES[ElementType.DROPDOWN] = {
  propertyNames: [
    'text',
    'options',
    'width',
    'height',
    'x',
    'y',
    'textColor',
    'backgroundColor',
    'fontSize',
    'textAlign',
    'hidden'
  ]
};
PROPERTIES[ElementType.RADIO_BUTTON] = {
  propertyNames: [
    'text',
    'groupId',
    'width',
    'height',
    'x',
    'y',
    'hidden',
    'checked'
  ]
};
PROPERTIES[ElementType.CHECKBOX] = {
  propertyNames: [
    'text',
    'width',
    'height',
    'x',
    'y',
    'hidden',
    'checked'
  ]
};
PROPERTIES[ElementType.IMAGE] = {
  propertyNames: [
    'text',
    'width',
    'height',
    'x',
    'y',
    'pictureImage',
    'picture', // Since this is an alias, it is not shown in the dropdown but is allowed as a value
    'iconColor',
    'hidden'
  ]
};
PROPERTIES[ElementType.CANVAS] = {
  propertyNames: [
    'text',
    'canvasWidth',
    'canvasHeight',
    'x',
    'y'
  ]
};
PROPERTIES[ElementType.SCREEN] = {
  propertyNames: [
    'text',
    'backgroundColor',
    'screenImage',
    'iconColor'
  ]
};
PROPERTIES[ElementType.TEXT_AREA] = {
  propertyNames: [
    'text',
    'width',
    'height',
    'x',
    'y',
    'textColor',
    'backgroundColor',
    'fontSize',
    'textAlign',
    'readonly',
    'hidden'
  ]
};
PROPERTIES[ElementType.CHART] = {
  propertyNames: [
    'text',
    'width',
    'height',
    'x',
    'y',
    'hidden'
  ]
};
PROPERTIES[ElementType.SLIDER] = {
  propertyNames: [
    'text',
    'width',
    'height',
    'x',
    'y',
    'value',
    'min',
    'max',
    'step',
    'hidden'
  ]
};

// Initialize dropdownOptions and infoForFriendlyNames fields in PROPERTIES map.
for (var elementType in PROPERTIES) {
  var elementProperties = PROPERTIES[elementType];
  elementProperties.dropdownOptions = [];
  elementProperties.infoForFriendlyName = {};
  elementProperties.propertyNames.forEach(function (propName) {
    var friendlyName = PROP_INFO[propName].friendlyName;
    if (elementProperties.infoForFriendlyName[friendlyName]) {
      throw new Error('Multiple props for friendlyName: ' + friendlyName +
        ' in elementType: ' + elementType);
    }
    elementProperties.infoForFriendlyName[friendlyName] = PROP_INFO[propName];
    if (!PROP_INFO[propName].alias) {
      let setValueParam = DEFAULT_PROP_VALUES[friendlyName];
      if (setValueParam) {
        elementProperties.dropdownOptions.push({
          text: '"' + friendlyName + '"',
          display: '"' + friendlyName + '"',
          setValueParam: setValueParam,
        });
      } else {
        elementProperties.dropdownOptions.push('"' + friendlyName + '"');
      }
    }
  });
}

/**
 * @param {DropletBlock} block Droplet block, or undefined if in text mode
 * @param {AceEditor}
 */
function getFirstSetPropertyParam(block, editor) {
  return getFirstParam('setProperty', block, editor);
}

/**
 * @param {DropletBlock} block Droplet block, or undefined if in text mode
 * @param {AceEditor}
 */
function getSecondSetPropertyParam(block, editor) {
  return getSecondParam('setProperty', block, editor);
}

/**
 * Given a string like <"asdf"> strips quotes and returns <asdf>
 */
function stripQuotes(str) {
  var match = str.match(/^(['"])(.*)\1$/);
  if (match) {
    return match[2];
  }
  return str;
}

/**
 * Gets the properties that should be shown in the dropdown list for elements of the given type.
 * @param {object} block Optional droplet block (will be undefined in text mode)
 * @param {object} editor Optional droplet editor (will be undefined in text mode)
 * @param {string} elementType
 * @returns {!Array<string>} list of quoted property names
 */
function getDropdownProperties(block, editor, elementType) {
  var opts = fullDropdownOptions.slice();

  if (elementType in PROPERTIES) {
    opts = PROPERTIES[elementType].dropdownOptions.slice();
  }

  for (let [index, opt] of opts.entries()) {
    if (opt.setValueParam) {
      // If a setValueParam is specified, generate a click handler that will
      // update the 3rd parameter with that value whenever the dropdown is
      // selected
      var newOpt = Object.assign({}, opt);
      newOpt.click = (callback) => {
        callback(opt.text);
        setParamAtIndex(2, opt.setValueParam, block, editor);
      };
      opts[index] = newOpt;
    }
  }
  return opts;
}

/**
 * Given an element and a friendly name for that element, returns an object
 * containing the internal equivalent for that friendly name, or undefined
 * if we don't have info for this element/property.
 */
export function getInternalPropertyInfo(element, friendlyPropName) {
  var elementType = library.getElementType(element, true);
  var info;
  if (elementType) {
    info = PROPERTIES[elementType].infoForFriendlyName[friendlyPropName];
  }
  return info;
}

/**
 * Based on the param2 value, return an appropriate setProperty dropdown for
 * the value parameter (param3). If it's an image, return the image  selector.
 * If it is another known property type, show a reasonable dropdown. If it can't
 * determine element types, displays the value 100, which is the default value
 * for this parameter in droplet config.
 * @param {string} param2
 * @returns {!Array<string> | function} droplet dropdown array or function
 */
function getPropertyValueDropdown(param2) {
  const dropletConfigDefaultValue = "100";

  if (!param2) {
    return [dropletConfigDefaultValue];
  }
  const formattedParam = stripQuotes(param2);

  switch (formattedParam) {
    case "image":
    case "picture":
      return getAssetDropdown('image');
    case "text-color":
    case "background-color":
    case "icon-color":
      return ['"red"', 'rgb(255,0,0)', 'rgb(255,0,0,0.5)', '"#FF0000"'];
    case "text-align":
      return ['"left"', '"right"', '"center"', '"justify"'];
    case "hidden":
    case "checked":
    case "readonly":
      return ['true', 'false'];
    case "text":
    case "placeholder":
    case "group-id":
      return ['"text"'];
    case "options":
      return ['["option1", "etc"]'];
    default:
      return [dropletConfigDefaultValue];
  }
}

/**
 * @returns {function} Gets the value of the second param for this block,
 *  then returns the appropriate dropdown based on the value.
 */
export function setPropertyValueSelector() {
  return function (editor) {
    const param2 = getSecondSetPropertyParam(this.parent, editor);
    return getPropertyValueDropdown(param2);
  };
}

/**
 * @returns {function} Gets the value of the first param for this block, gets
 *   the element that it refers to, and then enumerates a list of possible
 *   properties that can be set on this element. If it can't determine element
 *   types, provides full list of properties across all types.
 */
export function setPropertyDropdown() {
  return function (aceEditor) {
    // Note: We depend on "this" being the droplet socket when in block mode,
    // such that parent ends up being the block. In text mode, this.parent
    // ends up being undefined.
    var param1 = getFirstSetPropertyParam(this.parent, aceEditor);
    if (!param1) {
      return fullDropdownOptions;
    }

    var elementId = stripQuotes(param1);
    var element = document.querySelector("#divApplab #" + elementId);
    if (!element) {
      return fullDropdownOptions;
    }

    return getDropdownProperties(this.parent, aceEditor, library.getElementType(element));
  };
}

export var __TestInterface = {
  stripQuotes: stripQuotes,
  getDropdownProperties: getDropdownProperties,
  getPropertyValueDropdown: getPropertyValueDropdown
};
