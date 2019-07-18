import {
  OPTIONAL,
  apiValidateType,
  outputWarning
} from '../lib/util/javascriptMode';

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

function dmapiValidateType(funcName, varName, varValue, expectedType, opt) {
  var properType;
  if (typeof varValue !== 'undefined') {
    if (expectedType === 'number') {
      properType =
        typeof varValue.data === 'number' ||
        (typeof varValue.data === 'string' && !isNaN(varValue.data));
    } else if (expectedType === 'array') {
      properType = window.Applab.JSInterpreter.interpreter.isa(
        varValue.proto,
        window.Applab.JSInterpreter.interpreter.ARRAY
      );
    } else {
      properType = typeof varValue.data === expectedType;
    }
  }
  properType =
    properType ||
    (opt === OPTIONAL &&
      (varValue === window.Applab.JSInterpreter.interpreter.UNDEFINED ||
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
  insertItem(array, index, item, true);
}

export function insertItem(array, index, item, calledWithinInterpreter) {
  if (calledWithinInterpreter) {
    dmapiValidateType('insertItem', 'list', array, 'array');
    dmapiValidateType('insertItem', 'index', index, 'number');
  } else {
    apiValidateType({}, 'insertItem', 'list', array, 'array');
    apiValidateType({}, 'insertItem', 'index', index, 'number');
  }

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
  removeItem(array, index, true);
}

export function removeItem(array, index, calledWithinInterpreter) {
  if (calledWithinInterpreter) {
    dmapiValidateType('removeItem', 'list', array, 'array');
    dmapiValidateType('removeItem', 'index', index, 'number');
  } else {
    apiValidateType({}, 'removeItem', 'list', array, 'array');
    apiValidateType({}, 'removeItem', 'index', index, 'number');
  }

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
  return appendItem(array, item, true);
}

export function appendItem(array, item, calledWithinInterpreter) {
  if (calledWithinInterpreter) {
    dmapiValidateType('appendItem', 'list', array, 'array');
  } else {
    apiValidateType({}, 'appendItem', 'list', array, 'array');
  }

  const arrayValues = calledWithinInterpreter ? array.properties : array;

  arrayValues[array.length] = item;
  if (calledWithinInterpreter) {
    // In the interpreter, we must manually update the length property:
    array.length++;
    // And we must create an interpreter primitive to wrap the return value:
    return window.Applab.JSInterpreter.createPrimitive(array.length);
  } else {
    return array.length;
  }
}

// ImageData RGB helper functions

// TODO: more parameter validation (data array type, length), error output

function interpreterGetRed(imageData, x, y) {
  return getRed(imageData, x, y, true);
}

export function getRed(imageData, x, y, calledWithinInterpreter) {
  const imageDataProperties = calledWithinInterpreter
    ? imageData.properties
    : imageData;
  if (imageDataProperties.data && imageDataProperties.width) {
    const pixelOffset = y * imageDataProperties.width * 4 + x * 4;
    const redOffset = pixelOffset;
    return calledWithinInterpreter
      ? imageDataProperties.data.properties[redOffset].toNumber()
      : imageDataProperties.data[redOffset];
  }
}

function interpreterGetGreen(imageData, x, y) {
  return getGreen(imageData, x, y, true);
}

export function getGreen(imageData, x, y, calledWithinInterpreter) {
  const imageDataProperties = calledWithinInterpreter
    ? imageData.properties
    : imageData;
  if (imageDataProperties.data && imageDataProperties.width) {
    const pixelOffset = y * imageDataProperties.width * 4 + x * 4;
    const greenOffset = pixelOffset + 1;
    return calledWithinInterpreter
      ? imageDataProperties.data.properties[greenOffset].toNumber()
      : imageDataProperties.data[greenOffset];
  }
}

function interpreterGetBlue(imageData, x, y) {
  return getBlue(imageData, x, y, true);
}

export function getBlue(imageData, x, y, calledWithinInterpreter) {
  const imageDataProperties = calledWithinInterpreter
    ? imageData.properties
    : imageData;
  if (imageDataProperties.data && imageDataProperties.width) {
    const pixelOffset = y * imageDataProperties.width * 4 + x * 4;
    const blueOffset = pixelOffset + 2;
    return calledWithinInterpreter
      ? imageDataProperties.data.properties[blueOffset].toNumber()
      : imageDataProperties.data[blueOffset];
  }
}

function interpreterGetAlpha(imageData, x, y) {
  return getAlpha(imageData, x, y, true);
}

export function getAlpha(imageData, x, y, calledWithinInterpreter) {
  const imageDataProperties = calledWithinInterpreter
    ? imageData.properties
    : imageData;
  if (imageDataProperties.data && imageDataProperties.width) {
    const pixelOffset = y * imageDataProperties.width * 4 + x * 4;
    const alphaOffset = pixelOffset + 3;
    return calledWithinInterpreter
      ? imageDataProperties.data.properties[alphaOffset].toNumber()
      : imageDataProperties.data[alphaOffset];
  }
}

function interpreterSetRed(imageData, x, y, value) {
  setRed(imageData, x, y, value, true);
}

export function setRed(imageData, x, y, value, calledWithinInterpreter) {
  const imageDataProperties = calledWithinInterpreter
    ? imageData.properties
    : imageData;
  if (imageDataProperties.data && imageDataProperties.width) {
    const pixelOffset = y * imageDataProperties.width * 4 + x * 4;
    const redOffset = pixelOffset;
    if (calledWithinInterpreter) {
      imageDataProperties.data.properties[redOffset] = value;
    } else {
      imageDataProperties.data[redOffset] = value;
    }
  }
}

function interpreterSetGreen(imageData, x, y, value) {
  setGreen(imageData, x, y, value, true);
}

export function setGreen(imageData, x, y, value, calledWithinInterpreter) {
  const imageDataProperties = calledWithinInterpreter
    ? imageData.properties
    : imageData;
  if (imageDataProperties.data && imageDataProperties.width) {
    const pixelOffset = y * imageDataProperties.width * 4 + x * 4;
    const greenOffset = pixelOffset + 1;
    if (calledWithinInterpreter) {
      imageDataProperties.data.properties[greenOffset] = value;
    } else {
      imageDataProperties.data[greenOffset] = value;
    }
  }
}

function interpreterSetBlue(imageData, x, y, value) {
  setBlue(imageData, x, y, value, true);
}

export function setBlue(imageData, x, y, value, calledWithinInterpreter) {
  const imageDataProperties = calledWithinInterpreter
    ? imageData.properties
    : imageData;
  if (imageDataProperties.data && imageDataProperties.width) {
    const pixelOffset = y * imageDataProperties.width * 4 + x * 4;
    const blueOffset = pixelOffset + 2;
    if (calledWithinInterpreter) {
      imageDataProperties.data.properties[blueOffset] = value;
    } else {
      imageDataProperties.data[blueOffset] = value;
    }
  }
}

function interpreterSetAlpha(imageData, x, y, value) {
  setAlpha(imageData, x, y, value, true);
}

export function setAlpha(imageData, x, y, value, calledWithinInterpreter) {
  const imageDataProperties = calledWithinInterpreter
    ? imageData.properties
    : imageData;
  if (imageDataProperties.data && imageDataProperties.width) {
    const pixelOffset = y * imageDataProperties.width * 4 + x * 4;
    const alphaOffset = pixelOffset + 3;
    if (calledWithinInterpreter) {
      imageDataProperties.data.properties[alphaOffset] = value;
    } else {
      imageDataProperties.data[alphaOffset] = value;
    }
  }
}

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
        ? window.Applab.JSInterpreter.createPrimitive(255)
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
