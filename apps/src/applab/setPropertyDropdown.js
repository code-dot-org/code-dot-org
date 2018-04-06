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
 * defaultValue: String to be displayed as the setProperty value when this
 *     property is chosen in the setProperty dropdown
 * alias (optional): True if this property should not be displayed to the user
 *     in the drop down list of properties
 */
var PROP_INFO = {
  width: { friendlyName: 'width', internalName: 'style-width', type: 'number', defaultValue: '100' },
  height: { friendlyName: 'height', internalName: 'style-height', type: 'number', defaultValue: '100' },
  canvasWidth: { friendlyName: 'width', internalName: 'width', type: 'number', defaultValue: '100' },
  canvasHeight: { friendlyName: 'height', internalName: 'height', type: 'number', defaultValue: '100' },
  x: { friendlyName: 'x', internalName: 'left', type: 'number', defaultValue: '100' },
  y: { friendlyName: 'y', internalName: 'top', type: 'number', defaultValue: '100' },
  textColor: { friendlyName: 'text-color', internalName: 'textColor', type: 'string', defaultValue: '"red"' },
  backgroundColor: { friendlyName: 'background-color', internalName: 'backgroundColor', type: 'string', defaultValue: '"red"' },
  fontSize: { friendlyName: 'font-size', internalName: 'fontSize', type: 'number', defaultValue: '100' },
  textAlign: { friendlyName: 'text-align', internalName: 'textAlign', type: 'string', defaultValue: '"left"' },
  hidden: { friendlyName: 'hidden', internalName: 'hidden', type: 'boolean', defaultValue: 'true' },
  text: { friendlyName: 'text', internalName: 'text', type: 'uistring', defaultValue: '"text"' },
  placeholder: { friendlyName: 'placeholder', internalName: 'placeholder', type: 'uistring', defaultValue: '"text"' },
  image: { friendlyName: 'image', internalName: 'image', type: 'string', defaultValue: '"https://code.org/images/logo.png"' },
  screenImage: { friendlyName: 'image', internalName: 'screen-image', type: 'string', defaultValue: '"https://code.org/images/logo.png"' },
  // pictureImage and picture both map to 'picture' internally, but allow us to accept
  // either 'image' or 'picture' as the property name. picture is marked as an alias so
  // it won't show up in the dropdown.
  pictureImage: { friendlyName: 'image', internalName: 'picture', type: 'string', defaultValue: '"https://code.org/images/logo.png"' },
  picture: { friendlyName: 'picture', internalName: 'picture', type: 'string', alias: true, defaultValue: '"https://code.org/images/logo.png"' },
  iconColor: { friendlyName: 'icon-color', internalName: 'icon-color', type: 'string', defaultValue: '"red"' },
  groupId: { friendlyName: 'group-id', internalName: 'groupId', type: 'string', defaultValue: '"text"' },
  checked: { friendlyName: 'checked', internalName: 'checked', type: 'boolean', defaultValue: 'true' },
  readonly: { friendlyName: 'readonly', internalName: 'readonly', type: 'boolean', defaultValue: 'true' },
  options: { friendlyName: 'options', internalName: 'options', type: 'array', defaultValue: '["option1", "etc"]' },
  sliderValue: { friendlyName: 'value', internalName: 'sliderValue', type: 'number', defaultValue: '100' },
  min: { friendlyName: 'min', internalName: 'min', type: 'number', defaultValue: '100' },
  max: { friendlyName: 'max', internalName: 'max', type: 'number', defaultValue: '100' },
  step: { friendlyName: 'step', internalName: 'step', type: 'number', defaultValue: '100' },
  value: { friendlyName: 'value', internalName: 'value', type: 'uistring', defaultValue: '"text"' },
  fit: { friendlyName: 'fit', internalName: 'objectFit', type: 'string', defaultValue: '"fill"' }
};

// When we don't know the element type, we display all possible friendly names
var fullDropdownOptions = _.uniqBy(Object.keys(PROP_INFO)
    .map(key => {
      return constructDropdownOption(key);
    }).filter(object => object),
  object => {
    return object.text;
  });

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
    'hidden',
    'value'
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
    'hidden',
    'value'
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
    'hidden',
    'fit'
  ]
};
PROPERTIES[ElementType.CANVAS] = {
  propertyNames: [
    'text',
    'canvasWidth',
    'canvasHeight',
    'x',
    'y',
    'hidden',
  ]
};
PROPERTIES[ElementType.SCREEN] = {
  propertyNames: [
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
    'hidden',
    'value'
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
    'sliderValue',
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
    let dropdownOption = constructDropdownOption(propName);
    if (dropdownOption) {
      elementProperties.dropdownOptions.push(dropdownOption);
    }
  });
}

/**
 * @param {string} propName Key from PROP_INFO
 * @return {object|undefined} A droplet dropdown object with an additional
 *   setValueParam property that can be used to generate a click handler
 */
function constructDropdownOption(propName) {
  let propInfo = PROP_INFO[propName];
  if (!propInfo || propInfo.alias) {
    return;
  }
  let {friendlyName, defaultValue} = propInfo;
  if (!friendlyName || !defaultValue) {
    return;
  }
  return {
    text: '"' + friendlyName + '"',
    display: '"' + friendlyName + '"',
    setValueParam: defaultValue,
  };
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
 * @param {boolean} setMode true if being used by setProperty(), false if used by getProperty()
 * @param {string} elementType Optional type of element (e.g. BUTTON, IMAGE, etc.)
 * @param {object} block Optional droplet block (will be undefined in text mode)
 * @returns {!Array<string>} list of quoted property names
 */
function getDropdownProperties(setMode, elementType, block) {
  var opts = fullDropdownOptions.slice();

  if (elementType in PROPERTIES) {
    opts = PROPERTIES[elementType].dropdownOptions.slice();
  }

  if (!setMode) {
    return opts;
  }

  for (let [index, opt] of opts.entries()) {
    if (opt.setValueParam) {
      // If a setValueParam is specified, generate a click handler that will
      // update the 3rd parameter with that value whenever the dropdown is
      // selected
      var newOpt = Object.assign({}, opt);
      newOpt.click = (callback) => {
        callback(opt.text);
        setParamAtIndex(2, opt.setValueParam, block);
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
  const dropletConfigDefaultValue = ["0", "25", "50", "75", "100", "150", "200"];

  if (!param2) {
    return dropletConfigDefaultValue;
  }
  const formattedParam = stripQuotes(param2);

  switch (formattedParam) {
    case "image":
    case "picture":
      return getAssetDropdown('image');
    case "text-color":
    case "background-color":
    case "icon-color":
      return ['"white"', '"red"', '"green"', '"blue"', '"yellow"', 'rgb(255,0,0)', 'rgb(255,0,0,0.5)', '"#FF0000"'];
    case "text-align":
      return ['"left"', '"right"', '"center"', '"justify"'];
    case "fit":
      return ['"fill"', '"cover"', '"contain"', '"none"'];
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
      return dropletConfigDefaultValue;
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
 * @param {boolean} setMode true if being used by setProperty(), false if used by getProperty()
 * @returns {function} Gets the value of the first param for this block, gets
 *   the element that it refers to, and then enumerates a list of possible
 *   properties that can be set on this element. If it can't determine element
 *   types, provides full list of properties across all types.
 */
export function setPropertyDropdown(setMode) {
  return function (aceEditor) {
    var elementType;
    // Note: We depend on "this" being the droplet socket when in block mode,
    // such that parent ends up being the block. In text mode, this.parent
    // ends up being undefined.
    var param1 = getFirstSetPropertyParam(this.parent, aceEditor);
    if (param1) {
      let elementId = stripQuotes(param1);
      let element = document.querySelector("#divApplab #" + elementId);
      if (element) {
        elementType = library.getElementType(element, true);
      }
    }

    return getDropdownProperties(setMode, elementType, this.parent);
  };
}

export var __TestInterface = {
  stripQuotes: stripQuotes,
  getDropdownProperties: getDropdownProperties,
  getPropertyValueDropdown: getPropertyValueDropdown
};
