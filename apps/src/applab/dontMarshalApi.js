var errorHandler = require('../errorHandler');
var outputError = errorHandler.outputError;
var ErrorLevel = errorHandler.ErrorLevel;

var OPTIONAL = true;


function outputWarning(errorString) {
  var line = 1 + window.Applab.JSInterpreter.getNearestUserCodeLine();
  outputError(errorString, ErrorLevel.WARNING, line);
}

// APIs designed specifically to run on interpreter data structures without marshalling
// (valuable for performance or to support in/out parameters)
//
// dropletConfig for each of these APIs should be marked with dontMarshal:true


function dmapiValidateType(funcName, varName, varValue, expectedType, opt) {
  var properType;
  if (typeof varValue !== 'undefined') {
    if (expectedType === 'number') {
      properType = (typeof varValue.data === 'number' ||
                    (typeof varValue.data === 'string' && !isNaN(varValue.data)));
    } else if (expectedType === 'array') {
      properType = varValue.parent == window.Applab.JSInterpreter.interpreter.ARRAY;
    } else {
      properType = (typeof varValue.data === expectedType);
    }
  }
  properType = properType ||
              (opt === OPTIONAL &&
               (varValue === window.Applab.JSInterpreter.interpreter.UNDEFINED ||
                typeof varValue === 'undefined'));
  if (!properType) {
    outputWarning(funcName + "() " + varName + " parameter value (" +
                    varValue + ") is not a " + expectedType + ".");
  }
}

// Array functions

var getInt = function(obj, def) {
  // Return an integer, or the default.
  var n = obj ? Math.floor(obj.toNumber()) : def;
  if (isNaN(n)) {
    n = def;
  }
  return n;
};

exports.insertItem = function (array, index, item) {
  dmapiValidateType('insertItem', 'list', array, 'array');
  dmapiValidateType('insertItem', 'index', index, 'number');

  index = getInt(index, 0);
  if (index < 0) {
    index = Math.max(array.length + index, 0);
  } else {
    index = Math.min(index, array.length);
  }
  // Insert item.
  for (var i = array.length - 1; i >= index; i--) {
    array.properties[i + 1] = array.properties[i];
  }
  array.length += 1;
  array.properties[index] = item;
};

exports.removeItem = function (array, index) {
  dmapiValidateType('removeItem', 'list', array, 'array');
  dmapiValidateType('removeItem', 'index', index, 'number');

  index = getInt(index, 0);
  if (index < 0) {
    index = Math.max(array.length + index, 0);
  }
  // Remove by shifting items after index downward.
  for (var i = index; i < array.length - 1; i++) {
    array.properties[i] = array.properties[i + 1];
  }
  if (index < array.length) {
    delete array.properties[array.length - 1];
    array.length -= 1;
  } else {
    // index is out of bounds (too large):
    outputWarning("removeItem() index parameter value (" + index +
                    ") is larger than the number of items in the list (" +
                    array.length + ").");
  }
};

exports.appendItem = function (array, item) {
  dmapiValidateType('appendItem', 'list', array, 'array');

  array.properties[array.length] = item;
  array.length++;
  return window.Applab.JSInterpreter.createPrimitive(array.length);
};

// ImageData RGB helper functions

// TODO: more parameter validation (data array type, length), error output

exports.getRed = function (imageData, x, y) {
  if (imageData.properties.data && imageData.properties.width) {
    var pixelOffset = y * imageData.properties.width * 4 + x * 4;
    return imageData.properties.data.properties[pixelOffset].toNumber();
  }
};
exports.getGreen = function (imageData, x, y) {
  if (imageData.properties.data && imageData.properties.width) {
    var pixelOffset = y * imageData.properties.width * 4 + x * 4;
    return imageData.properties.data.properties[pixelOffset + 1].toNumber();
  }
};
exports.getBlue = function (imageData, x, y) {
  if (imageData.properties.data && imageData.properties.width) {
    var pixelOffset = y * imageData.properties.width * 4 + x * 4;
    return imageData.properties.data.properties[pixelOffset + 2].toNumber();
  }
};
exports.getAlpha = function (imageData, x, y) {
  if (imageData.properties.data && imageData.properties.width) {
    var pixelOffset = y * imageData.properties.width * 4 + x * 4;
    return imageData.properties.data.properties[pixelOffset + 3].toNumber();
  }
};

exports.setRed = function (imageData, x, y, value) {
  if (imageData.properties.data && imageData.properties.width) {
    var pixelOffset = y * imageData.properties.width * 4 + x * 4;
    imageData.properties.data.properties[pixelOffset] = value;
  }
};
exports.setGreen = function (imageData, x, y, value) {
  if (imageData.properties.data && imageData.properties.width) {
    var pixelOffset = y * imageData.properties.width * 4 + x * 4;
    imageData.properties.data.properties[pixelOffset + 1] = value;
  }
};
exports.setBlue = function (imageData, x, y, value) {
  if (imageData.properties.data && imageData.properties.width) {
    var pixelOffset = y * imageData.properties.width * 4 + x * 4;
    imageData.properties.data.properties[pixelOffset + 2] = value;
  }
};
exports.setAlpha = function (imageData, x, y, value) {
  if (imageData.properties.data && imageData.properties.width) {
    var pixelOffset = y * imageData.properties.width * 4 + x * 4;
    imageData.properties.data.properties[pixelOffset + 3] = value;
  }
};
exports.setRGB = function (imageData, x, y, r, g, b, a) {
  if (imageData.properties.data && imageData.properties.width) {
    var pixelOffset = y * imageData.properties.width * 4 + x * 4;
    imageData.properties.data.properties[pixelOffset] = r;
    imageData.properties.data.properties[pixelOffset + 1] = g;
    imageData.properties.data.properties[pixelOffset + 2] = b;
    imageData.properties.data.properties[pixelOffset + 3] =
      (typeof a === 'undefined') ? window.Applab.JSInterpreter.createPrimitive(255) : a;
  }
};
