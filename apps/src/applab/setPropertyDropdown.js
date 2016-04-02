/**
 * This file manages logic for the dropdown used in our setProperty block
 */
var _ = require('../lodash');
var library = require('./designElements/library');
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
 */
var PROP_INFO = {
  width: {friendlyName: 'width', internalName: 'style-width', type: 'number'},
  height: {friendlyName: 'height', internalName: 'style-height', type: 'number'},
  canvasWidth: {friendlyName: 'width', internalName: 'width', type: 'number'},
  canvasHeight: {friendlyName: 'height', internalName: 'height', type: 'number'},
  x: {friendlyName: 'x', internalName: 'left', type: 'number'},
  y: {friendlyName: 'y', internalName: 'top', type: 'number'},
  textColor: {friendlyName: 'text-color', internalName: 'textColor', type: 'string'},
  backgroundColor: {friendlyName: 'background-color', internalName: 'backgroundColor', type: 'string'},
  fontSize: {friendlyName: 'font-size', internalName: 'fontSize', type: 'number'},
  textAlign: {friendlyName: 'text-align', internalName: 'textAlign', type: 'string'},
  hidden: {friendlyName: 'hidden', internalName: 'hidden', type: 'boolean'},
  text: {friendlyName: 'text', internalName: 'text', type: 'string'},
  placeholder: {friendlyName: 'placeholder', internalName: 'placeholder', type: 'string'},
  image: {friendlyName: 'image', internalName: 'image', type: 'string'},
  screenImage: {friendlyName: 'image', internalName: 'screen-image', type: 'string'},
  picture: {friendlyName: 'picture', internalName: 'picture', type: 'string'},
  groupId: {friendlyName: 'group-id', internalName: 'groupId', type: 'string'},
  checked: {friendlyName: 'checked', internalName: 'checked', type: 'boolean'},
  readonly: {friendlyName: 'readonly', internalName: 'readonly', type: 'boolean'},
  options: {friendlyName: 'options', internalName: 'options', type: 'array'},
  value: {friendlyName: 'value', internalName: 'defaultValue', type: 'number'},
  min: {friendlyName: 'min', internalName: 'min', type: 'number'},
  max: {friendlyName: 'max', internalName: 'max', type: 'number'},
  step: {friendlyName: 'step', internalName: 'step', type: 'number'}
};

// When we don't know the element type, we display all possible friendly names
var fullDropdownOptions = _.uniq(Object.keys(PROP_INFO).map(function (key) {
  return '"' + PROP_INFO[key].friendlyName + '"';
}));

// Which of the items from PROP_INFO should each element type use
var PROP_NAMES = {};
PROP_NAMES[ElementType.BUTTON] = [
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
  'hidden'
];
PROP_NAMES[ElementType.TEXT_INPUT] = [
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
];
PROP_NAMES[ElementType.LABEL] = [
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
];
PROP_NAMES[ElementType.DROPDOWN] = [
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
];
PROP_NAMES[ElementType.RADIO_BUTTON] = [
  'groupId',
  'width',
  'height',
  'x',
  'y',
  'hidden',
  'checked'
];
PROP_NAMES[ElementType.CHECKBOX] = [
  'width',
  'height',
  'x',
  'y',
  'hidden',
  'checked'
];
PROP_NAMES[ElementType.IMAGE] = [
  'width',
  'height',
  'x',
  'y',
  'picture',
  'hidden'
];
PROP_NAMES[ElementType.CANVAS] = [
  'canvasWidth',
  'canvasHeight',
  'x',
  'y',
];
PROP_NAMES[ElementType.SCREEN] = [
  'backgroundColor',
  'screenImage'
];
PROP_NAMES[ElementType.TEXT_AREA] = [
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
];
PROP_NAMES[ElementType.CHART] = [
  'width',
  'height',
  'x',
  'y',
  'hidden'
];
PROP_NAMES[ElementType.SLIDER] = [
  'width',
  'height',
  'x',
  'y',
  'value',
  'min',
  'max',
  'step',
  'hidden'
];

// Create a mapping of PROPS_PER_TYPE[elementType][friendlyName] => prop info
var PROPS_PER_TYPE = {};
Object.keys(PROP_NAMES).map(function (elementType) {
  PROPS_PER_TYPE[elementType] = {};
  PROP_NAMES[elementType].forEach(function (propName) {
    var friendlyName = PROP_INFO[propName].friendlyName;
    if (PROPS_PER_TYPE[elementType][friendlyName]) {
      throw new Error('Multiple props for friendlyName: ' + friendlyName +
        ' in elementType: ' + elementType);
    }
    PROPS_PER_TYPE[elementType][friendlyName] = PROP_INFO[propName];
  });
});

function getFirstSetPropertyParamFromCode(code) {
  var prefix = 'setProperty(';
  code = code.slice(code.lastIndexOf(prefix));

  // quote, followed by param, followed by end quote, comma, and optional whitespace
  var match = /^setProperty\((['"])(.*)\1,\s*$/.exec(code);
  return match ? match[2] : null;
}

/**
 * @param {DropletBlock} block Droplet block, or undefined if in text mode
 * @param {AceEditor}
 */
function getFirstSetPropertyParam(block, editor) {
  if (!block) {
    // If we're not given a block, assume that we're in text mode
    var cursor = editor.session.selection.getCursor();
    var contents = editor.session.getLine(cursor.row).substring(0, cursor.column);

    return getFirstSetPropertyParamFromCode(contents);
  }
  // We have a block. Parse it to find our first socket.
  var token = block.start;
  do {
    if (token.type === 'socketStart') {
      var textToken = token.next;
      if (textToken.type !== 'text') {
        throw new Error('unexpected');
      }
      return textToken.value;
    }
    token = token.next;
  } while (token);
  return null;
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
 * Given an element and a friendly name for that element, returns an object
 * containing the internal equivalent for that friendly name, or undefined
 * if we don't have info for this element/property.
 */
module.exports.getInternalPropertyInfo = function (element, friendlyPropName) {
  var elementType = library.getElementType(element, true);
  var info;
  if (elementType) {
    info = PROPS_PER_TYPE[elementType][friendlyPropName];
  }
  return info;
};

/**
 * @returns {function} Gets the value of the first param for this block, gets
 *   the element that it refers to, and then enumerates a list of possible
 *   properties that can be set on this element. If it can't determine element
 *   types, provides full list of properties across all types.
 */
module.exports.setPropertyDropdown = function () {
  return function (editor) {
    // Note: We depend on "this" being the droplet socket when in block mode,
    // such that parent ends up being the block. In text mode, this.parent
    // ends up being undefined.
    var param1 = getFirstSetPropertyParam(this.parent, editor);
    if (!param1) {
      return fullDropdownOptions;
    }

    var elementId = stripQuotes(param1);
    var element = document.querySelector("#divApplab #" + elementId);
    if (!element) {
      return fullDropdownOptions;
    }

    var elementType = library.getElementType(element);
    if (!elementType) {
      return fullDropdownOptions;
    }

    var keys = Object.keys(PROPS_PER_TYPE[elementType]);
    if (!keys) {
      return fullDropdownOptions;
    }

    return keys.map(function (key) { return '"' + key + '"'; });
  };
};

module.exports.__TestInterface = {
  getFirstSetPropertyParamFromCode: getFirstSetPropertyParamFromCode,
  stripQuotes: stripQuotes
};
