import {
  OPTIONAL,
  apiValidateType,
  outputWarning
} from './lib/util/javascriptMode';

// APIs designed specifically to run on interpreter data structures without marshalling
// (valuable for performance or to support in/out parameters)
//
// dropletConfig for each of these APIs should be marked with dontMarshal:true

/*
 * The interpreter functions are exported under a single 'default' object
 *
 * The same functions are exported individually with an extra final parameter
 * named calledWithinInterpreter. When called outside of the interpreter without
 * the final parameter, the functions will behave as expected in a normal JS
 * environment and will not use interpreter-specific data structures.
 *
 * This allows us to share a single implementation for both the normal versions
 * used by exported apps and for the interpreter optimized versions.
 *
 * To import the interpreter versions:
 * import dontMarshalApi from './dontMarshalApi'
 *
 * To import the normal JavaScript versions:
 * import * as dontMarshalApi from './dontMarshalApi'
 */

function getJSInterpreter() {
  if (window.Applab) {
    return window.Applab.JSInterpreter;
  }
  if (window.__mostRecentGameLabInstance) {
    return window.__mostRecentGameLabInstance.JSInterpreter;
  }
}

function dmapiValidateType(_, funcName, varName, varValue, expectedType, opt) {
  var properType;
  if (typeof varValue !== 'undefined') {
    if (expectedType === 'number') {
      properType =
        typeof varValue.data === 'number' ||
        (typeof varValue.data === 'string' && !isNaN(varValue.data));
    } else if (expectedType === 'array') {
      properType = getJSInterpreter().interpreter.isa(
        varValue.proto,
        getJSInterpreter().interpreter.ARRAY
      );
    } else {
      properType = typeof varValue.data === expectedType;
    }
  }
  properType =
    properType ||
    (opt === OPTIONAL &&
      (varValue === getJSInterpreter().interpreter.UNDEFINED ||
        typeof varValue === 'undefined'));
  if (!properType) {
    outputWarning(
      funcName +
        '() ' +
        varName +
        ' parameter value (' +
        varValue +
        ') is not a ' +
        expectedType +
        '.'
    );
  }
}

// Array functions

var getInt = function(obj, def, calledWithinInterpreter) {
  // Return an integer, or the default.
  let n;
  if (calledWithinInterpreter) {
    n = obj ? Math.floor(obj.toNumber()) : def;
  } else {
    n = typeof obj !== 'undefined' ? Math.floor(obj) : def;
  }
  if (isNaN(n)) {
    n = def;
  }
  return n;
};

function interpreterInsertItem(array, index, item) {
  insertItem(array, index, item, dmapiValidateType, true);
}

export function insertItem(
  array,
  index,
  item,
  validateType = apiValidateType,
  calledWithinInterpreter
) {
  validateType({}, 'insertItem', 'list', array, 'array');
  validateType({}, 'insertItem', 'index', index, 'number');

  const arrayValues = calledWithinInterpreter ? array.properties : array;

  index = getInt(index, 0, calledWithinInterpreter);
  if (index < 0) {
    index = Math.max(array.length + index, 0);
  } else {
    index = Math.min(index, array.length);
  }
  // Insert item.
  for (var i = array.length - 1; i >= index; i--) {
    arrayValues[i + 1] = arrayValues[i];
  }
  if (calledWithinInterpreter) {
    // In the interpreter, we must manually update the length property:
    array.length += 1;
  }
  arrayValues[index] = item;
}

function interpreterRemoveItem(array, index) {
  removeItem(array, index, dmapiValidateType, true);
}

export function removeItem(
  array,
  index,
  validateType = apiValidateType,
  calledWithinInterpreter
) {
  validateType({}, 'removeItem', 'list', array, 'array');
  validateType({}, 'removeItem', 'index', index, 'number');

  const arrayValues = calledWithinInterpreter ? array.properties : array;

  index = getInt(index, 0, calledWithinInterpreter);
  if (index < 0) {
    index = Math.max(array.length + index, 0);
  }
  // Remove by shifting items after index downward.
  for (var i = index; i < array.length - 1; i++) {
    arrayValues[i] = arrayValues[i + 1];
  }
  if (index < array.length) {
    if (calledWithinInterpreter) {
      // In the interpreter, the array is not a real array, so
      // simply reducing the length of the array is not enough. We must
      // delete the object stored as the last element before we
      // modify the length:
      delete arrayValues[array.length - 1];
    }
    array.length -= 1;
  } else {
    // index is out of bounds (too large):
    outputWarning(
      'removeItem() index parameter value (' +
        index +
        ') is larger than the number of items in the list (' +
        array.length +
        ').'
    );
  }
}

function interpreterAppendItem(array, item) {
  return appendItem(array, item, dmapiValidateType, true);
}

export function appendItem(
  array,
  item,
  validateType = apiValidateType,
  calledWithinInterpreter
) {
  validateType({}, 'appendItem', 'list', array, 'array');

  const arrayValues = calledWithinInterpreter ? array.properties : array;

  arrayValues[array.length] = item;
  if (calledWithinInterpreter) {
    // In the interpreter, we must manually update the length property:
    array.length++;
    // And we must create an interpreter primitive to wrap the return value:
    return getJSInterpreter().createPrimitive(array.length);
  } else {
    return array.length;
  }
}

function interpreterGetValue(object, key) {
  return getValue(object, key, dmapiValidateType, true);
}

export function getValue(
  object,
  key,
  validateType = apiValidateType,
  calledWithinInterpreter
) {
  validateType({}, 'getValue', 'key', key, 'string');

  const objectContents = calledWithinInterpreter ? object.properties : object;
  const keyData = key.data;
  const valueData = objectContents[keyData];
  if (valueData === undefined) {
    outputWarning(key + ' is not in ' + object);
    return undefined;
  }
  return objectContents[keyData].data;
}

function interpreterAddPair(object, key, value) {
  return addPair(object, key, value, dmapiValidateType, true);
}

export function addPair(
  object,
  key,
  value,
  validateType = apiValidateType,
  calledWithinInterpreter
) {
  validateType({}, 'addPair', 'key', key, 'string');

  const newKey = key.data;
  const objectContents = calledWithinInterpreter ? object.properties : object;
  objectContents[newKey] = value;
  return objectContents;
}

// ImageData RGB helper functions

// TODO: more parameter validation (data array type, length), error output

function getImageDataValue(
  calledWithinInterpreter,
  colorOffset,
  imageData,
  x,
  y
) {
  const imageDataProperties = calledWithinInterpreter
    ? imageData.properties
    : imageData;
  if (imageDataProperties.data && imageDataProperties.width) {
    const pixelOffset = y * imageDataProperties.width * 4 + x * 4;
    const totalOffset = pixelOffset + colorOffset;
    return calledWithinInterpreter
      ? imageDataProperties.data.properties[totalOffset].toNumber()
      : imageDataProperties.data[totalOffset];
  }
}

const interpreterGetRed = getImageDataValue.bind(null, true, 0);
const interpreterGetGreen = getImageDataValue.bind(null, true, 1);
const interpreterGetBlue = getImageDataValue.bind(null, true, 2);
const interpreterGetAlpha = getImageDataValue.bind(null, true, 3);

export const getRed = getImageDataValue.bind(null, false, 0);
export const getGreen = getImageDataValue.bind(null, false, 1);
export const getBlue = getImageDataValue.bind(null, false, 2);
export const getAlpha = getImageDataValue.bind(null, false, 3);

function setImageDataValue(
  calledWithinInterpreter,
  colorOffset,
  imageData,
  x,
  y,
  value
) {
  const imageDataProperties = calledWithinInterpreter
    ? imageData.properties
    : imageData;
  if (imageDataProperties.data && imageDataProperties.width) {
    const pixelOffset = y * imageDataProperties.width * 4 + x * 4;
    const totalOffset = pixelOffset + colorOffset;
    if (calledWithinInterpreter) {
      imageDataProperties.data.properties[totalOffset] = value;
    } else {
      imageDataProperties.data[totalOffset] = value;
    }
  }
}

const interpreterSetRed = setImageDataValue.bind(null, true, 0);
const interpreterSetGreen = setImageDataValue.bind(null, true, 1);
const interpreterSetBlue = setImageDataValue.bind(null, true, 2);
const interpreterSetAlpha = setImageDataValue.bind(null, true, 3);

export const setRed = setImageDataValue.bind(null, false, 0);
export const setGreen = setImageDataValue.bind(null, false, 1);
export const setBlue = setImageDataValue.bind(null, false, 2);
export const setAlpha = setImageDataValue.bind(null, false, 3);

function interpreterSetRGB(imageData, x, y, r, g, b, a) {
  setRGB(imageData, x, y, r, g, b, a, true);
}

export function setRGB(imageData, x, y, r, g, b, a, calledWithinInterpreter) {
  const imageDataProperties = calledWithinInterpreter
    ? imageData.properties
    : imageData;
  const imageDataDataValues = calledWithinInterpreter
    ? imageDataProperties.data.properties
    : imageDataProperties.data;
  if (imageDataProperties.data && imageDataProperties.width) {
    var pixelOffset = y * imageDataProperties.width * 4 + x * 4;
    imageDataDataValues[pixelOffset] = r;
    imageDataDataValues[pixelOffset + 1] = g;
    imageDataDataValues[pixelOffset + 2] = b;
    if (typeof a === 'undefined') {
      // In the interpreter, we must create an interpreter primitive
      // to wrap the default value of 255:
      imageDataDataValues[pixelOffset + 3] = calledWithinInterpreter
        ? getJSInterpreter().createPrimitive(255)
        : 255;
    } else {
      imageDataDataValues[pixelOffset + 3] = a;
    }
  }
}

const interpreterFunctions = {
  insertItem: interpreterInsertItem,
  removeItem: interpreterRemoveItem,
  appendItem: interpreterAppendItem,
  getValue: interpreterGetValue,
  addPair: interpreterAddPair,
  getRed: interpreterGetRed,
  getGreen: interpreterGetGreen,
  getBlue: interpreterGetBlue,
  getAlpha: interpreterGetAlpha,
  setRed: interpreterSetRed,
  setGreen: interpreterSetGreen,
  setBlue: interpreterSetBlue,
  setAlpha: interpreterSetAlpha,
  setRGB: interpreterSetRGB
};

export default interpreterFunctions;
