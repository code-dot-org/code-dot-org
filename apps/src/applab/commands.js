/* global $ */

var studioApp = require('../StudioApp').singleton;
var AppStorage = require('./appStorage');
var apiTimeoutList = require('../timeoutList');
var RGBColor = require('./rgbcolor.js');
var codegen = require('../codegen');
var keyEvent = require('./keyEvent');

var errorHandler = require('./errorHandler');
var outputApplabConsole = errorHandler.outputApplabConsole;
var outputError = errorHandler.outputError;
var ErrorLevel = errorHandler.ErrorLevel;
var applabTurtle = require('./applabTurtle');

var OPTIONAL = true;

var applabCommands = module.exports;

/**
 * @param value
 * @returns {boolean} true if value is a string, number, boolean, undefined or null.
 *     returns false for other values, including instances of Number or String.
 */
function isPrimitiveType(value) {
  switch (typeof value) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'undefined':
      return true;
    case 'object':
      return (value === null);
    default:
      return false;
  }
}

function apiValidateType(opts, funcName, varName, varValue, expectedType, opt) {
  var validatedTypeKey = 'validated_type_' + varName;
  if (typeof opts[validatedTypeKey] === 'undefined') {
    var properType;
    if (expectedType === 'color') {
      // Special handling for colors, must be a string and a valid RGBColor:
      properType = (typeof varValue === 'string');
      if (properType) {
        var color = new RGBColor(varValue);
        properType = color.ok;
      }
    } else if (expectedType === 'uistring') {
      properType = (typeof varValue === 'string') ||
                   (typeof varValue === 'number') ||
                   (typeof varValue === 'boolean');
    } else if (expectedType === 'function') {
      // Special handling for functions, it must be an interpreter function:
      properType = (typeof varValue === 'object') && (varValue.type === 'function');
    } else if (expectedType === 'number') {
      properType = (typeof varValue === 'number' ||
                    (typeof varValue === 'string' && !isNaN(varValue)));
    } else if (expectedType === 'primitive') {
      properType = isPrimitiveType(varValue);
      if (!properType) {
        // Ensure a descriptive error message is displayed.
        expectedType = 'string, number, boolean, undefined or null';
      }
    } else if (expectedType === 'array') {
      properType = Array.isArray(varValue);
    } else {
      properType = (typeof varValue === expectedType);
    }
    properType = properType || (opt === OPTIONAL && (typeof varValue === 'undefined'));
    if (!properType) {
      var line = 1 + Applab.JSInterpreter.getNearestUserCodeLine();
      var errorString = funcName + "() " + varName + " parameter value (" +
        varValue + ") is not a " + expectedType + ".";
      outputError(errorString, ErrorLevel.WARNING, line);
    }
    opts[validatedTypeKey] = properType;
  }
}

function apiValidateTypeAndRange(opts, funcName, varName, varValue,
                                 expectedType, minValue, maxValue, opt) {
  var validatedTypeKey = 'validated_type_' + varName;
  var validatedRangeKey = 'validated_range_' + varName;
  apiValidateType(opts, funcName, varName, varValue, expectedType, opt);
  if (opts[validatedTypeKey] && typeof opts[validatedRangeKey] === 'undefined') {
    var inRange = (typeof minValue === 'undefined') || (varValue >= minValue);
    if (inRange) {
      inRange = (typeof maxValue === 'undefined') || (varValue <= maxValue);
    }
    inRange = inRange || (opt === OPTIONAL && (typeof varValue === 'undefined'));
    if (!inRange) {
      var line = 1 + Applab.JSInterpreter.getNearestUserCodeLine();
      var errorString = funcName + "() " + varName + " parameter value (" +
        varValue + ") is not in the expected range.";
      outputError(errorString, ErrorLevel.WARNING, line);
    }
    opts[validatedRangeKey] = inRange;
  }
}

function apiValidateActiveCanvas(opts, funcName) {
  var validatedActiveCanvasKey = 'validated_active_canvas';
  if (!opts || typeof opts[validatedActiveCanvasKey] === 'undefined') {
    var activeCanvas = Boolean(Applab.activeCanvas);
    if (!activeCanvas) {
      var line = 1 + Applab.JSInterpreter.getNearestUserCodeLine();
      var errorString = funcName + "() called without an active canvas. Call " +
        "createCanvas() first.";
      outputError(errorString, ErrorLevel.WARNING, line);
    }
    if (opts) {
      opts[validatedActiveCanvasKey] = activeCanvas;
    }
  }
}

function apiValidateDomIdExistence(opts, funcName, varName, id, shouldExist) {
  var divApplab = document.getElementById('divApplab');
  var validatedTypeKey = 'validated_type_' + varName;
  var validatedDomKey = 'validated_id_' + varName;
  apiValidateType(opts, funcName, varName, id, 'string');
  if (opts[validatedTypeKey] && typeof opts[validatedDomKey] === 'undefined') {
    var element = document.getElementById(id);
    var exists = Boolean(element && divApplab.contains(element));
    var valid = exists == shouldExist;
    if (!valid) {
      var line = 1 + Applab.JSInterpreter.getNearestUserCodeLine();
      var errorString = funcName + "() " + varName +
        " parameter refers to an id (" +id + ") which " +
        (exists ? "already exists." : "does not exist.");
      outputError(errorString, ErrorLevel.WARNING, line);
    }
    opts[validatedDomKey] = valid;
  }
}

function activeScreen() {
  return $('.screen').filter(function () {
    return this.style.display !== 'none';
  }).first()[0];
}

// (brent) We may in the future also provide a second option that allows you to
// reset the state of the screen to it's original (design mode) state.
applabCommands.setScreen = function (opts) {
  apiValidateDomIdExistence(opts, 'setScreen', 'screenId', opts.screenId, true);
  var element = document.getElementById(opts.screenId);
  var divApplab = document.getElementById('divApplab');
  if (!divApplab.contains(element)) {
    return;
  }

  // toggle all screens to be visible if equal to given id, hidden otherwise
  $('.screen').each(function () {
    $(this).toggle(this.id === opts.screenId);
  });
};

applabCommands.container = function (opts) {
  var newDiv = document.createElement("div");
  if (typeof opts.elementId !== "undefined") {
    newDiv.id = opts.elementId;
  }
  newDiv.innerHTML = opts.html;
  newDiv.style.position = 'relative';

  return Boolean(activeScreen().appendChild(newDiv));
};

applabCommands.write = function (opts) {
  apiValidateType(opts, 'write', 'text', opts.html, 'uistring');
  return applabCommands.container(opts);
};

applabCommands.button = function (opts) {
  // PARAMNAME: button: id vs. buttonId
  apiValidateDomIdExistence(opts, 'button', 'id', opts.elementId, false);
  apiValidateType(opts, 'button', 'text', opts.text, 'uistring');

  var newButton = document.createElement("button");
  var textNode = document.createTextNode(opts.text);
  newButton.id = opts.elementId;
  newButton.style.position = 'relative';

  return Boolean(newButton.appendChild(textNode) &&
    activeScreen().appendChild(newButton));
};

applabCommands.image = function (opts) {
  apiValidateType(opts, 'image', 'id', opts.elementId, 'string');
  apiValidateType(opts, 'image', 'url', opts.src, 'string');

  var newImage = document.createElement("img");
  newImage.src = opts.src;
  newImage.id = opts.elementId;
  newImage.style.position = 'relative';

  return Boolean(activeScreen().appendChild(newImage));
};

applabCommands.imageUploadButton = function (opts) {
  // To avoid showing the ugly fileupload input element, we create a label
  // element with an img-upload class that will ensure it looks like a button
  var newLabel = document.createElement("label");
  var textNode = document.createTextNode(opts.text);
  newLabel.id = opts.elementId;
  newLabel.className = 'img-upload';
  newLabel.style.position = 'relative';

  // We then create an offscreen input element and make it a child of the new
  // label element
  var newInput = document.createElement("input");
  newInput.type = "file";
  newInput.accept = "image/*";
  newInput.capture = "camera";
  newInput.style.position = "absolute";
  newInput.style.left = "-9999px";

  return Boolean(newLabel.appendChild(newInput) &&
                 newLabel.appendChild(textNode) &&
                 activeScreen().appendChild(newLabel));
};

applabCommands.show = function (opts) {
  applabTurtle.turtleSetVisibility(true);
};

applabCommands.hide = function (opts) {
  applabTurtle.turtleSetVisibility(false);
};

applabCommands.moveTo = function (opts) {
  apiValidateType(opts, 'moveTo', 'x', opts.x, 'number');
  apiValidateType(opts, 'moveTo', 'y', opts.y, 'number');
  var ctx = applabTurtle.getTurtleContext();
  if (ctx) {
    ctx.beginPath();
    ctx.moveTo(Applab.turtle.x, Applab.turtle.y);
    Applab.turtle.x = opts.x;
    Applab.turtle.y = opts.y;
    ctx.lineTo(Applab.turtle.x, Applab.turtle.y);
    ctx.stroke();
    applabTurtle.updateTurtleImage();
  }
};

applabCommands.move = function (opts) {
  apiValidateType(opts, 'move', 'x', opts.x, 'number');
  apiValidateType(opts, 'move', 'y', opts.y, 'number');
  opts.x += Applab.turtle.x;
  opts.y += Applab.turtle.y;
  applabCommands.moveTo(opts);
};

applabCommands.moveForward = function (opts) {
  apiValidateType(opts, 'moveForward', 'pixels', opts.distance, 'number', OPTIONAL);
  var newOpts = {};
  var distance = 25;
  if (typeof opts.distance !== 'undefined') {
    distance = opts.distance;
  }
  newOpts.x = Applab.turtle.x +
    distance * Math.sin(2 * Math.PI * Applab.turtle.heading / 360);
  newOpts.y = Applab.turtle.y -
    distance * Math.cos(2 * Math.PI * Applab.turtle.heading / 360);
  applabCommands.moveTo(newOpts);
};

applabCommands.moveBackward = function (opts) {
  apiValidateType(opts, 'moveBackward', 'pixels', opts.distance, 'number', OPTIONAL);
  var distance = -25;
  if (typeof opts.distance !== 'undefined') {
    distance = -opts.distance;
  }
  applabCommands.moveForward({'distance': distance });
};

applabCommands.turnRight = function (opts) {
  apiValidateType(opts, 'turnRight', 'angle', opts.degrees, 'number', OPTIONAL);
  // call this first to ensure there is a turtle (in case this is the first API)
  applabTurtle.getTurtleContext();

  var degrees = 90;
  if (typeof opts.degrees !== 'undefined') {
    degrees = opts.degrees;
  }

  Applab.turtle.heading += degrees;
  Applab.turtle.heading = (Applab.turtle.heading + 360) % 360;
  applabTurtle.updateTurtleImage();
};

applabCommands.turnLeft = function (opts) {
  apiValidateType(opts, 'turnLeft', 'angle', opts.degrees, 'number', OPTIONAL);
  var degrees = -90;
  if (typeof opts.degrees !== 'undefined') {
    degrees = -opts.degrees;
  }
  applabCommands.turnRight({'degrees': degrees });
};

applabCommands.turnTo = function (opts) {
  apiValidateType(opts, 'turnTo', 'angle', opts.direction, 'number');
  var degrees = opts.direction - Applab.turtle.heading;
  applabCommands.turnRight({'degrees': degrees });
};

// Turn along an arc with a specified radius (by default, turn clockwise, so
// the center of the arc is 90 degrees clockwise of the current heading)
// if opts.counterclockwise, the center point is 90 degrees counterclockwise

applabCommands.arcRight = function (opts) {
  apiValidateType(opts, 'arcRight', 'angle', opts.degrees, 'number');
  apiValidateType(opts, 'arcRight', 'radius', opts.radius, 'number');

  // call this first to ensure there is a turtle (in case this is the first API)
  var centerAngle = opts.counterclockwise ? -90 : 90;
  var clockwiseDegrees = opts.counterclockwise ? -opts.degrees : opts.degrees;
  var ctx = applabTurtle.getTurtleContext();
  if (ctx) {
    var centerX = Applab.turtle.x +
      opts.radius * Math.sin(2 * Math.PI * (Applab.turtle.heading + centerAngle) / 360);
    var centerY = Applab.turtle.y -
      opts.radius * Math.cos(2 * Math.PI * (Applab.turtle.heading + centerAngle) / 360);

    var startAngle =
      2 * Math.PI * (Applab.turtle.heading + (opts.counterclockwise ? 0 : 180)) / 360;
    var endAngle = startAngle + (2 * Math.PI * clockwiseDegrees / 360);

    ctx.beginPath();
    ctx.arc(centerX, centerY, opts.radius, startAngle, endAngle, opts.counterclockwise);
    ctx.stroke();

    Applab.turtle.heading = (Applab.turtle.heading + clockwiseDegrees + 360) % 360;
    var xMovement = opts.radius * Math.cos(2 * Math.PI * Applab.turtle.heading / 360);
    var yMovement = opts.radius * Math.sin(2 * Math.PI * Applab.turtle.heading / 360);
    Applab.turtle.x = centerX + (opts.counterclockwise ? xMovement : -xMovement);
    Applab.turtle.y = centerY + (opts.counterclockwise ? yMovement : -yMovement);
    applabTurtle.updateTurtleImage();
  }
};

applabCommands.arcLeft = function (opts) {
  apiValidateType(opts, 'arcLeft', 'angle', opts.degrees, 'number');
  apiValidateType(opts, 'arcLeft', 'radius', opts.radius, 'number');

  opts.counterclockwise = true;
  applabCommands.arcRight(opts);
};

applabCommands.getX = function (opts) {
  var ctx = applabTurtle.getTurtleContext();
  return Applab.turtle.x;
};

applabCommands.getY = function (opts) {
  var ctx = applabTurtle.getTurtleContext();
  return Applab.turtle.y;
};

applabCommands.getDirection = function (opts) {
  var ctx = applabTurtle.getTurtleContext();
  return Applab.turtle.heading;
};

applabCommands.dot = function (opts) {
  apiValidateTypeAndRange(opts, 'dot', 'radius', opts.radius, 'number', 0.0001);
  var ctx = applabTurtle.getTurtleContext();
  if (ctx && opts.radius > 0) {
    ctx.beginPath();
    if (Applab.turtle.penUpColor) {
      // If the pen is up and the color has been changed, use that color:
      ctx.strokeStyle = Applab.turtle.penUpColor;
    }
    var savedLineWidth = ctx.lineWidth;
    ctx.lineWidth = 1;
    ctx.arc(Applab.turtle.x, Applab.turtle.y, opts.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    if (Applab.turtle.penUpColor) {
      // If the pen is up, reset strokeStyle back to transparent:
      ctx.strokeStyle = "rgba(255, 255, 255, 0)";
    }
    ctx.lineWidth = savedLineWidth;
    return true;
  }

};

applabCommands.penUp = function (opts) {
  var ctx = applabTurtle.getTurtleContext();
  if (ctx) {
    if (ctx.strokeStyle !== "rgba(255, 255, 255, 0)") {
      Applab.turtle.penUpColor = ctx.strokeStyle;
      ctx.strokeStyle = "rgba(255, 255, 255, 0)";
    }
  }
};

applabCommands.penDown = function (opts) {
  var ctx = applabTurtle.getTurtleContext();
  if (ctx && Applab.turtle.penUpColor) {
    ctx.strokeStyle = Applab.turtle.penUpColor;
    delete Applab.turtle.penUpColor;
  }
};

applabCommands.penWidth = function (opts) {
  apiValidateTypeAndRange(opts, 'penWidth', 'width', opts.width, 'number', 0.0001);
  var ctx = applabTurtle.getTurtleContext();
  if (ctx) {
    ctx.lineWidth = opts.width;
  }
};

applabCommands.penColorInternal = function (rgbstring) {
  var ctx = applabTurtle.getTurtleContext();
  if (ctx) {
    if (Applab.turtle.penUpColor) {
      // pen is currently up, store this color for pen down
      Applab.turtle.penUpColor = rgbstring;
    } else {
      ctx.strokeStyle = rgbstring;
    }
    ctx.fillStyle = rgbstring;
  }
};

applabCommands.penColor = function (opts) {
  apiValidateType(opts, 'penColor', 'color', opts.color, 'color');
  applabCommands.penColorInternal(opts.color);
};

applabCommands.penRGB = function (opts) {
  // PARAMNAME: penRGB: red vs. r
  // PARAMNAME: penRGB: green vs. g
  // PARAMNAME: penRGB: blue vs. b
  apiValidateTypeAndRange(opts, 'penRGB', 'r', opts.r, 'number', 0, 255);
  apiValidateTypeAndRange(opts, 'penRGB', 'g', opts.g, 'number', 0, 255);
  apiValidateTypeAndRange(opts, 'penRGB', 'b', opts.b, 'number', 0, 255);
  apiValidateTypeAndRange(opts, 'penRGB', 'a', opts.a, 'number', 0, 1, OPTIONAL);
  var alpha = (typeof opts.a === 'undefined') ? 1 : opts.a;
  var rgbstring = "rgba(" + opts.r + "," + opts.g + "," + opts.b + "," + alpha + ")";
  applabCommands.penColorInternal(rgbstring);
};

applabCommands.speed = function (opts) {
  // DOCBUG: range is 0-100, not 1-100
  apiValidateTypeAndRange(opts, 'speed', 'value', opts.percent, 'number', 0, 100);
  if (opts.percent >= 0 && opts.percent <= 100) {
    var sliderSpeed = opts.percent / 100;
    if (Applab.speedSlider) {
      Applab.speedSlider.setValue(sliderSpeed);
    }
    Applab.scale.stepSpeed = Applab.stepSpeedFromSliderSpeed(sliderSpeed);
  }
};

applabCommands.createCanvas = function (opts) {
  // PARAMNAME: createCanvas: id vs. canvasId
  apiValidateDomIdExistence(opts, 'createCanvas', 'canvasId', opts.elementId, false);
  apiValidateType(opts, 'createCanvas', 'width', width, 'number', OPTIONAL);
  apiValidateType(opts, 'createCanvas', 'height', height, 'number', OPTIONAL);

  var newElement = document.createElement("canvas");
  var ctx = newElement.getContext("2d");
  if (newElement && ctx) {
    newElement.id = opts.elementId;
    // default width/height if params are missing
    var width = opts.width || Applab.appWidth;
    var height = opts.height || Applab.appHeight;
    newElement.width = width;
    newElement.height = height;
    newElement.setAttribute('width', width + 'px');
    newElement.setAttribute('height', height + 'px');
    // Unlike other elements, we use absolute position, otherwise our z-index
    // doesn't work
    newElement.style.position = 'absolute';
    if (!opts.turtleCanvas) {
      // set transparent fill by default (unless it is the turtle canvas):
      ctx.fillStyle = "rgba(255, 255, 255, 0)";
    }
    ctx.lineCap = "round";

    if (!Applab.activeCanvas && !opts.turtleCanvas) {
      // If there is no active canvas and this isn't the turtleCanvas,
      // we'll make this the active canvas for subsequent API calls:
      Applab.activeCanvas = newElement;
    }

    return Boolean(activeScreen().appendChild(newElement));
  }
  return false;
};

applabCommands.setActiveCanvas = function (opts) {
  var divApplab = document.getElementById('divApplab');
  // PARAMNAME: setActiveCanvas: id vs. canvasId
  apiValidateDomIdExistence(opts, 'setActiveCanvas', 'canvasId', opts.elementId, true);
  var canvas = document.getElementById(opts.elementId);
  if (divApplab.contains(canvas)) {
    Applab.activeCanvas = canvas;
    return true;
  }
  return false;
};

applabCommands.line = function (opts) {
  apiValidateActiveCanvas(opts, 'line');
  apiValidateType(opts, 'line', 'x1', opts.x1, 'number');
  apiValidateType(opts, 'line', 'x2', opts.x2, 'number');
  apiValidateType(opts, 'line', 'y1', opts.y1, 'number');
  apiValidateType(opts, 'line', 'y2', opts.y2, 'number');
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext("2d");
  if (ctx) {
    ctx.beginPath();
    ctx.moveTo(opts.x1, opts.y1);
    ctx.lineTo(opts.x2, opts.y2);
    ctx.stroke();
    return true;
  }
  return false;
};

applabCommands.circle = function (opts) {
  apiValidateActiveCanvas(opts, 'circle');
  // PARAMNAME: circle: centerX vs. x
  // PARAMNAME: circle: centerY vs. y
  apiValidateType(opts, 'circle', 'centerX', opts.x, 'number');
  apiValidateType(opts, 'circle', 'centerY', opts.y, 'number');
  apiValidateType(opts, 'circle', 'radius', opts.radius, 'number');
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext("2d");
  if (ctx) {
    ctx.beginPath();
    ctx.arc(opts.x, opts.y, opts.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    return true;
  }
  return false;
};

applabCommands.rect = function (opts) {
  apiValidateActiveCanvas(opts, 'rect');
  // PARAMNAME: rect: upperLeftX vs. x
  // PARAMNAME: rect: upperLeftY vs. y
  apiValidateType(opts, 'rect', 'upperLeftX', opts.x, 'number');
  apiValidateType(opts, 'rect', 'upperLeftY', opts.y, 'number');
  apiValidateType(opts, 'rect', 'width', opts.width, 'number');
  apiValidateType(opts, 'rect', 'height', opts.height, 'number');
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext("2d");
  if (ctx) {
    ctx.beginPath();
    ctx.rect(opts.x, opts.y, opts.width, opts.height);
    ctx.fill();
    ctx.stroke();
    return true;
  }
  return false;
};

applabCommands.setStrokeWidth = function (opts) {
  apiValidateActiveCanvas(opts, 'setStrokeWidth');
  apiValidateTypeAndRange(opts, 'setStrokeWidth', 'width', opts.width, 'number', 0.0001);
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext("2d");
  if (ctx) {
    ctx.lineWidth = opts.width;
    return true;
  }
  return false;
};

applabCommands.setStrokeColor = function (opts) {
  apiValidateActiveCanvas(opts, 'setStrokeColor');
  apiValidateType(opts, 'setStrokeColor', 'color', opts.color, 'color');
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext("2d");
  if (ctx) {
    ctx.strokeStyle = String(opts.color);
    return true;
  }
  return false;
};

applabCommands.setFillColor = function (opts) {
  apiValidateActiveCanvas(opts, 'setFillColor');
  apiValidateType(opts, 'setFillColor', 'color', opts.color, 'color');
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = String(opts.color);
    return true;
  }
  return false;
};

applabCommands.clearCanvas = function (opts) {
  apiValidateActiveCanvas(opts, 'clearCanvas');
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0,
                  0,
                  Applab.activeCanvas.width,
                  Applab.activeCanvas.height);
    return true;
  }
  return false;
};

applabCommands.drawImage = function (opts) {
  var divApplab = document.getElementById('divApplab');
  // PARAMNAME: drawImage: imageId vs. id
  apiValidateActiveCanvas(opts, 'drawImage');
  apiValidateDomIdExistence(opts, 'drawImage', 'id', opts.imageId, true);
  apiValidateType(opts, 'drawImage', 'x', opts.x, 'number');
  apiValidateType(opts, 'drawImage', 'y', opts.y, 'number');
  var image = document.getElementById(opts.imageId);
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext("2d");
  if (ctx && divApplab.contains(image)) {
    var xScale, yScale;
    xScale = yScale = 1;
    if (typeof opts.width !== 'undefined') {
      apiValidateType(opts, 'drawImage', 'width', opts.width, 'number');
      xScale = xScale * (opts.width / image.width);
    }
    if (typeof opts.height !== 'undefined') {
      apiValidateType(opts, 'drawImage', 'height', opts.height, 'number');
      yScale = yScale * (opts.height / image.height);
    }
    ctx.save();
    ctx.setTransform(xScale, 0, 0, yScale, opts.x, opts.y);
    ctx.drawImage(image, 0, 0);
    ctx.restore();
    return true;
  }
  return false;
};

applabCommands.getImageData = function (opts) {
  apiValidateActiveCanvas(opts, 'getImageData');
  // PARAMNAME: getImageData: all params + doc bugs
  apiValidateType(opts, 'getImageData', 'x', opts.x, 'number');
  apiValidateType(opts, 'getImageData', 'y', opts.y, 'number');
  apiValidateType(opts, 'getImageData', 'width', opts.width, 'number');
  apiValidateType(opts, 'getImageData', 'height', opts.height, 'number');
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext("2d");
  if (ctx) {
    return ctx.getImageData(opts.x, opts.y, opts.width, opts.height);
  }
};

applabCommands.putImageData = function (opts) {
  apiValidateActiveCanvas(opts, 'putImageData');
  // PARAMNAME: putImageData: imageData vs. imgData
  // PARAMNAME: putImageData: startX vs. x
  // PARAMNAME: putImageData: startY vs. y
  apiValidateType(opts, 'putImageData', 'imgData', opts.imageData, 'object');
  apiValidateType(opts, 'putImageData', 'x', opts.x, 'number');
  apiValidateType(opts, 'putImageData', 'y', opts.y, 'number');
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext("2d");
  if (ctx) {
    // Create tmpImageData and initialize it because opts.imageData is not
    // going to be a real ImageData object if it came from the interpreter
    var tmpImageData = ctx.createImageData(opts.imageData.width,
                                           opts.imageData.height);
    tmpImageData.data.set(opts.imageData.data);
    return ctx.putImageData(tmpImageData, opts.x, opts.y);
  }
};

applabCommands.textInput = function (opts) {
  // PARAMNAME: textInput: id vs. inputId
  apiValidateDomIdExistence(opts, 'textInput', 'id', opts.elementId, false);
  apiValidateType(opts, 'textInput', 'text', opts.text, 'uistring');

  var newInput = document.createElement("input");
  newInput.value = opts.text;
  newInput.id = opts.elementId;
  newInput.style.position = 'relative';

  return Boolean(activeScreen().appendChild(newInput));
};

applabCommands.textLabel = function (opts) {
  // PARAMNAME: textLabel: id vs. labelId
  apiValidateDomIdExistence(opts, 'textLabel', 'id', opts.elementId, false);
  apiValidateType(opts, 'textLabel', 'text', opts.text, 'uistring');
  if (typeof opts.forId !== 'undefined') {
    apiValidateDomIdExistence(opts, 'textLabel', 'forId', opts.forId, true);
  }

  var newLabel = document.createElement("label");
  var textNode = document.createTextNode(opts.text);
  newLabel.id = opts.elementId;
  newLabel.style.position = 'relative';
  var forElement = document.getElementById(opts.forId);
  if (forElement && activeScreen().contains(forElement)) {
    newLabel.setAttribute('for', opts.forId);
  }

  return Boolean(newLabel.appendChild(textNode) &&
                 activeScreen().appendChild(newLabel));
};

applabCommands.checkbox = function (opts) {
  // PARAMNAME: checkbox: id vs. checkboxId
  apiValidateDomIdExistence(opts, 'checkbox', 'id', opts.elementId, false);
  // apiValidateType(opts, 'checkbox', 'checked', opts.checked, 'boolean');

  var newCheckbox = document.createElement("input");
  newCheckbox.setAttribute("type", "checkbox");
  newCheckbox.checked = opts.checked;
  newCheckbox.id = opts.elementId;
  newCheckbox.style.position = 'relative';

  return Boolean(activeScreen().appendChild(newCheckbox));
};

applabCommands.radioButton = function (opts) {
  apiValidateDomIdExistence(opts, 'radioButton', 'id', opts.elementId, false);
  // apiValidateType(opts, 'radioButton', 'checked', opts.checked, 'boolean');
  apiValidateType(opts, 'radioButton', 'group', opts.name, 'string', OPTIONAL);

  var newRadio = document.createElement("input");
  newRadio.setAttribute("type", "radio");
  newRadio.name = opts.name;
  newRadio.checked = opts.checked;
  newRadio.id = opts.elementId;
  newRadio.style.position = 'relative';

  return Boolean(activeScreen().appendChild(newRadio));
};

applabCommands.dropdown = function (opts) {
  // PARAMNAME: dropdown: id vs. dropdownId
  apiValidateDomIdExistence(opts, 'dropdown', 'id', opts.elementId, false);

  var newSelect = document.createElement("select");

  if (opts.optionsArray) {
    for (var i = 0; i < opts.optionsArray.length; i++) {
      var option = document.createElement("option");
      apiValidateType(opts, 'dropdown', 'option_' + (i + 1), opts.optionsArray[i], 'uistring');
      option.text = opts.optionsArray[i];
      newSelect.add(option);
    }
  }
  newSelect.id = opts.elementId;
  newSelect.style.position = 'relative';

  return Boolean(activeScreen().appendChild(newSelect));
};

applabCommands.getAttribute = function (opts) {
  var divApplab = document.getElementById('divApplab');
  var element = document.getElementById(opts.elementId);
  var attribute = String(opts.attribute);
  return divApplab.contains(element) ? element[attribute] : false;
};

// Whitelist of HTML Element attributes which can be modified, to
// prevent DOM manipulation which would violate the sandbox.
var MUTABLE_ATTRIBUTES = ['innerHTML', 'scrollTop'];

applabCommands.setAttribute = function (opts) {
  var divApplab = document.getElementById('divApplab');
  var element = document.getElementById(opts.elementId);
  var attribute = String(opts.attribute);
  if (divApplab.contains(element) &&
      MUTABLE_ATTRIBUTES.indexOf(attribute) !== -1) {
    element[attribute] = opts.value;
    return true;
  }
  return false;
};

applabCommands.getText = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(opts, 'getText', 'id', opts.elementId, true);

  var element = document.getElementById(opts.elementId);
  if (divApplab.contains(element)) {
    if (element.tagName === 'INPUT' || element.tagName === 'SELECT') {
      return String(element.value);
    } else if (element.tagName === 'IMG') {
      return String(element.alt);
    } else {
      return element.innerText;
    }
  }
  return false;
};

applabCommands.setText = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(opts, 'setText', 'id', opts.elementId, true);
  apiValidateType(opts, 'setText', 'text', opts.text, 'uistring');

  var element = document.getElementById(opts.elementId);
  if (divApplab.contains(element)) {
    if (element.tagName === 'INPUT' || element.tagName === 'SELECT') {
      element.value = opts.text;
    } else if (element.tagName === 'IMG') {
      element.alt = opts.text;
    } else {
      element.innerText = opts.text;
    }
    return true;
  }
  return false;
};

applabCommands.getChecked = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(opts, 'getChecked', 'id', opts.elementId, true);

  var element = document.getElementById(opts.elementId);
  if (divApplab.contains(element) && element.tagName === 'INPUT') {
    return element.checked;
  }
  return false;
};

applabCommands.setChecked = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(opts, 'setChecked', 'id', opts.elementId, true);
  // apiValidateType(opts, 'setChecked', 'checked', opts.checked, 'boolean');

  var element = document.getElementById(opts.elementId);
  if (divApplab.contains(element) && element.tagName === 'INPUT') {
    element.checked = opts.checked;
    return true;
  }
  return false;
};

applabCommands.getImageURL = function (opts) {
  var divApplab = document.getElementById('divApplab');
  // PARAMNAME: getImageURL: id vs. imageId
  apiValidateDomIdExistence(opts, 'getImageURL', 'id', opts.elementId, true);

  var element = document.getElementById(opts.elementId);
  if (divApplab.contains(element)) {
    // We return a URL if it is an IMG element or our special img-upload label
    if (element.tagName === 'IMG') {
      return element.src;
    } else if (element.tagName === 'LABEL' && element.className === 'img-upload') {
      var fileObj = element.children[0].files[0];
      if (fileObj) {
        return window.URL.createObjectURL(fileObj);
      }
    }
  }
};

applabCommands.setImageURL = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(opts, 'setImageURL', 'id', opts.elementId, true);
  apiValidateType(opts, 'setImageURL', 'url', opts.src, 'string');

  var element = document.getElementById(opts.elementId);
  if (divApplab.contains(element) && element.tagName === 'IMG') {
    element.src = opts.src;
    return true;
  }
  return false;
};

applabCommands.playSound = function (opts) {
  apiValidateType(opts, 'playSound', 'url', opts.url, 'string');

  if (studioApp.cdoSounds) {
    studioApp.cdoSounds.playURL(opts.url,
                               {volume: 1.0,
                                forceHTML5: true,
                                allowHTML5Mobile: true
    });
  }
};

applabCommands.innerHTML = function (opts) {
  var divApplab = document.getElementById('divApplab');
  var div = document.getElementById(opts.elementId);
  if (divApplab.contains(div)) {
    div.innerHTML = opts.html;
    return true;
  }
  return false;
};

applabCommands.deleteElement = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(opts, 'deleteElement', 'id', opts.elementId, true);

  var div = document.getElementById(opts.elementId);
  if (divApplab.contains(div)) {
    // Special check to see if the active canvas is being deleted
    if (div == Applab.activeCanvas || div.contains(Applab.activeCanvas)) {
      delete Applab.activeCanvas;
    }
    return Boolean(div.parentElement.removeChild(div));
  }
  return false;
};

applabCommands.showElement = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(opts, 'showElement', 'id', opts.elementId, true);

  var div = document.getElementById(opts.elementId);
  if (divApplab.contains(div)) {
    div.style.visibility = 'visible';
    return true;
  }
  return false;
};

applabCommands.hideElement = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(opts, 'hideElement', 'id', opts.elementId, true);

  var div = document.getElementById(opts.elementId);
  if (divApplab.contains(div)) {
    div.style.visibility = 'hidden';
    return true;
  }
  return false;
};

applabCommands.setStyle = function (opts) {
  var divApplab = document.getElementById('divApplab');
  var div = document.getElementById(opts.elementId);
  if (divApplab.contains(div)) {
    div.style.cssText += opts.style;
    return true;
  }
  return false;
};

applabCommands.setParent = function (opts) {
  var divApplab = document.getElementById('divApplab');
  var div = document.getElementById(opts.elementId);
  var divNewParent = document.getElementById(opts.parentId);
  if (divApplab.contains(div) && divApplab.contains(divNewParent)) {
    return Boolean(div.parentElement.removeChild(div) &&
                   divNewParent.appendChild(div));
  }
  return false;
};

applabCommands.setPosition = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(opts, 'setPosition', 'id', opts.elementId, true);
  apiValidateType(opts, 'setPosition', 'x', opts.left, 'number');
  apiValidateType(opts, 'setPosition', 'y', opts.top, 'number');

  var el = document.getElementById(opts.elementId);
  if (divApplab.contains(el)) {
    el.style.position = 'absolute';
    el.style.left = opts.left + 'px';
    el.style.top = opts.top + 'px';
    var setWidthHeight = false;
    // don't set width/height if
    // (1) both parameters are undefined AND
    // (2) width/height already specified OR IMG element with width/height attributes
    if ((el.style.width.length > 0 && el.style.height.length > 0) ||
        (el.tagName === 'IMG' && el.width > 0 && el.height > 0)) {
        if (typeof opts.width !== 'undefined' || typeof opts.height !== 'undefined') {
            setWidthHeight = true;
        }
    } else {
        setWidthHeight = true;
    }
    if (setWidthHeight) {
        apiValidateType(opts, 'setPosition', 'width', opts.width, 'number');
        apiValidateType(opts, 'setPosition', 'height', opts.height, 'number');
        el.style.width = opts.width + 'px';
        el.style.height = opts.height + 'px';
    }
    return true;
  }
  return false;
};

applabCommands.getXPosition = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(opts, 'getXPosition', 'id', opts.elementId, true);

  var div = document.getElementById(opts.elementId);
  if (divApplab.contains(div)) {
    var x = div.offsetLeft;
    while (div !== divApplab) {
      // TODO (brent) using offsetParent may be ill advised:
      // This property will return null on Webkit if the element is hidden
      // (the style.display of this element or any ancestor is "none") or if the
      // style.position of the element itself is set to "fixed".
      // This property will return null on Internet Explorer (9) if the
      // style.position of the element itself is set to "fixed".
      // (Having display:none does not affect this browser.)
      div = div.offsetParent;
      x += div.offsetLeft;
    }
    return x;
  }
  return 0;
};

applabCommands.getYPosition = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(opts, 'getYPosition', 'id', opts.elementId, true);

  var div = document.getElementById(opts.elementId);
  if (divApplab.contains(div)) {
    var y = div.offsetTop;
    while (div !== divApplab) {
      div = div.offsetParent;
      y += div.offsetTop;
    }
    return y;
  }
  return 0;
};

applabCommands.onEventFired = function (opts, e) {
  if (typeof e != 'undefined') {
    var div = document.getElementById('divApplab');
    var xScale = div.getBoundingClientRect().width / div.offsetWidth;
    var yScale = div.getBoundingClientRect().height / div.offsetHeight;
    var xOffset = 0;
    var yOffset = 0;
    while (div) {
      xOffset += div.offsetLeft;
      yOffset += div.offsetTop;
      div = div.offsetParent;
    }

    var applabEvent = {};
    // Pass these properties through to applabEvent:
    ['altKey', 'button', 'charCode', 'ctrlKey', 'keyCode', 'keyIdentifier',
      'keyLocation', 'location', 'metaKey', 'movementX', 'movementY', 'offsetX',
      'offsetY', 'repeat', 'shiftKey', 'type', 'which'].forEach(
      function (prop) {
        if (typeof e[prop] !== 'undefined') {
          applabEvent[prop] = e[prop];
        }
      });
    // Convert x coordinates and then pass through to applabEvent:
    ['clientX', 'pageX', 'x'].forEach(
      function (prop) {
        if (typeof e[prop] !== 'undefined') {
          applabEvent[prop] = (e[prop] - xOffset) / xScale;
        }
      });
    // Convert y coordinates and then pass through to applabEvent:
    ['clientY', 'pageY', 'y'].forEach(
      function (prop) {
        if (typeof e[prop] !== 'undefined') {
          applabEvent[prop] = (e[prop] - yOffset) / yScale;
        }
      });
    // Replace DOM elements with IDs and then add them to applabEvent:
    ['fromElement', 'srcElement', 'currentTarget', 'relatedTarget', 'target',
      'toElement'].forEach(
      function (prop) {
        if (e[prop]) {
          applabEvent[prop + "Id"] = e[prop].id;
        }
      });
    // Attempt to populate key property (not yet supported in Chrome/Safari):
    //
    // keyup/down has no charCode and can be translated with the keyEvent[] map
    // keypress can use charCode
    //
    var keyProp = e.charCode ? String.fromCharCode(e.charCode) : keyEvent[e.keyCode];
    if (typeof keyProp !== 'undefined') {
      applabEvent.key = keyProp;
    }

    // Push a function call on the queue with an array of arguments consisting
    // of the applabEvent parameter (and any extraArgs originally supplied)
    Applab.JSInterpreter.queueEvent(opts.func, [applabEvent].concat(opts.extraArgs));
  } else {
    Applab.JSInterpreter.queueEvent(opts.func, opts.extraArgs);
  }
  if (Applab.JSInterpreter) {
    // Execute the interpreter and if a return value is sent back from the
    // interpreter's event handler, pass that back in the native world

    // NOTE: the interpreter will not execute forever, if the event handler
    // takes too long, executeInterpreter() will return and the native side
    // will just see 'undefined' as the return value. The rest of the interpreter
    // event handler will run in the next onTick(), but the return value will
    // no longer have any effect.
    Applab.JSInterpreter.executeInterpreter(false, true);
    return Applab.JSInterpreter.lastCallbackRetVal;
  }
};

applabCommands.onEvent = function (opts) {
  var divApplab = document.getElementById('divApplab');
  // Special case the id of 'body' to mean the app's container (divApplab)
  // TODO (cpirich): apply this logic more broadly (setStyle, etc.)
  if (opts.elementId === 'body') {
    opts.elementId = 'divApplab';
  } else {
    apiValidateDomIdExistence(opts, 'onEvent', 'id', opts.elementId, true);
  }
  apiValidateType(opts, 'onEvent', 'type', opts.eventName, 'string');
  // PARAMNAME: onEvent: callback vs. callbackFunction
  apiValidateType(opts, 'onEvent', 'callback', opts.func, 'function');
  var domElement = document.getElementById(opts.elementId);
  if (divApplab.contains(domElement)) {
    switch (opts.eventName) {
      /*
      Check for a specific set of Hammer v1 event names (full set below) and if
      we find a match, instantiate Hammer on that element

      TODO (cpirich): review the following:
      * whether using Hammer v1 events is the right choice
      * choose the specific list of events
      * consider instantiating Hammer just once per-element or on divApplab
      * review use of preventDefault

      case 'hold':
      case 'tap':
      case 'doubletap':
      case 'swipe':
      case 'swipeup':
      case 'swipedown':
      case 'swipeleft':
      case 'swiperight':
      case 'rotate':
      case 'release':
      case 'gesture':
      case 'pinch':
      case 'pinchin':
      case 'pinchout':
        var hammerElement = new Hammer(divApplab, { 'preventDefault': true });
        hammerElement.on(opts.eventName,
                         applabCommands.onEventFired.bind(this, opts));
        break;
      */
      case 'click':
      case 'change':
      case 'keyup':
      case 'mousemove':
      case 'dblclick':
      case 'mousedown':
      case 'mouseup':
      case 'mouseover':
      case 'mouseout':
      case 'keydown':
      case 'keypress':
      case 'input':
        // For now, we're not tracking how many of these we add and we don't allow
        // the user to detach the handler. We detach all listeners by cloning the
        // divApplab DOM node inside of reset()
        domElement.addEventListener(
            opts.eventName,
            applabCommands.onEventFired.bind(this, opts));
        break;
      default:
        return false;
    }
    return true;
  }
  return false;
};

applabCommands.onHttpRequestEvent = function (opts) {
  // Ensure that this event was requested by the same instance of the interpreter
  // that is currently active before proceeding...
  if (opts.JSInterpreter === Applab.JSInterpreter) {
    if (this.readyState === 4) {
      Applab.JSInterpreter.queueEvent(
        opts.func,
        [ Number(this.status),
          String(this.getResponseHeader('content-type')),
          String(this.responseText)
        ]);
    }
  }
};

applabCommands.startWebRequest = function (opts) {
  apiValidateType(opts, 'startWebRequest', 'url', opts.url, 'string');
  apiValidateType(opts, 'startWebRequest', 'callback', opts.func, 'function');
  opts.JSInterpreter = Applab.JSInterpreter;
  var req = new XMLHttpRequest();
  req.onreadystatechange = applabCommands.onHttpRequestEvent.bind(req, opts);
  req.open('GET', opts.url, true);
  req.send();
};

applabCommands.onTimerFired = function (opts) {
  // ensure that this event came from the active interpreter instance:
  Applab.JSInterpreter.queueEvent(opts.func);
  // NOTE: the interpreter will not execute forever, if the event handler
  // takes too long, executeInterpreter() will return and the rest of the
  // user's code will execute in the next onTick()
  Applab.JSInterpreter.executeInterpreter(false, true);
};

applabCommands.setTimeout = function (opts) {
  // PARAMNAME: setTimeout: callback vs. function
  // PARAMNAME: setTimeout: ms vs. milliseconds
  apiValidateType(opts, 'setTimeout', 'callback', opts.func, 'function');
  apiValidateType(opts, 'setTimeout', 'milliseconds', opts.milliseconds, 'number');

  return apiTimeoutList.setTimeout(applabCommands.onTimerFired.bind(this, opts), opts.milliseconds);
};

applabCommands.clearTimeout = function (opts) {
  apiValidateType(opts, 'clearTimeout', 'timeout', opts.timeoutId, 'number');
  // NOTE: we do not currently check to see if this is a timer created by
  // our applabCommands.setTimeout() function
  apiTimeoutList.clearTimeout(opts.timeoutId);
};

applabCommands.setInterval = function (opts) {
  // PARAMNAME: setInterval: callback vs. function
  // PARAMNAME: setInterval: ms vs. milliseconds
  apiValidateType(opts, 'setInterval', 'callback', opts.func, 'function');
  apiValidateType(opts, 'setInterval', 'milliseconds', opts.milliseconds, 'number');

  return apiTimeoutList.setInterval(applabCommands.onTimerFired.bind(this, opts), opts.milliseconds);
};

applabCommands.clearInterval = function (opts) {
  apiValidateType(opts, 'clearInterval', 'interval', opts.intervalId, 'number');
  // NOTE: we do not currently check to see if this is a timer created by
  // our applabCommands.setInterval() function
  apiTimeoutList.clearInterval(opts.intervalId);
};

applabCommands.createRecord = function (opts) {
  // PARAMNAME: createRecord: table vs. tableName
  // PARAMNAME: createRecord: callback vs. callbackFunction
  apiValidateType(opts, 'createRecord', 'table', opts.table, 'string');
  apiValidateType(opts, 'createRecord', 'record', opts.record, 'object');
  apiValidateType(opts, 'createRecord', 'record.id', opts.record.id, 'undefined');
  apiValidateType(opts, 'createRecord', 'callback', opts.onSuccess, 'function', OPTIONAL);
  apiValidateType(opts, 'createRecord', 'onError', opts.onError, 'function', OPTIONAL);
  opts.JSInterpreter = Applab.JSInterpreter;
  var onSuccess = applabCommands.handleCreateRecord.bind(this, opts);
  var onError = errorHandler.handleError.bind(this, opts);
  AppStorage.createRecord(opts.table, opts.record, onSuccess, onError);
};

applabCommands.handleCreateRecord = function(opts, record) {
  // Ensure that this event was requested by the same instance of the interpreter
  // that is currently active before proceeding...
  if (opts.onSuccess && opts.JSInterpreter === Applab.JSInterpreter) {
    Applab.JSInterpreter.queueEvent(opts.onSuccess, [record]);
  }
};

applabCommands.getKeyValue = function(opts) {
  // PARAMNAME: getKeyValue: callback vs. callbackFunction
  apiValidateType(opts, 'getKeyValue', 'key', opts.key, 'string');
  apiValidateType(opts, 'getKeyValue', 'callback', opts.onSuccess, 'function');
  apiValidateType(opts, 'getKeyValue', 'onError', opts.onError, 'function', OPTIONAL);
  opts.JSInterpreter = Applab.JSInterpreter;
  var onSuccess = applabCommands.handleReadValue.bind(this, opts);
  var onError = errorHandler.handleError.bind(this, opts);
  AppStorage.getKeyValue(opts.key, onSuccess, onError);
};

applabCommands.handleReadValue = function(opts, value) {
  // Ensure that this event was requested by the same instance of the interpreter
  // that is currently active before proceeding...
  if (opts.onSuccess && opts.JSInterpreter === Applab.JSInterpreter) {
    Applab.JSInterpreter.queueEvent(opts.onSuccess, [value]);
  }
};

applabCommands.setKeyValue = function(opts) {
  // PARAMNAME: setKeyValue: callback vs. callbackFunction
  apiValidateType(opts, 'setKeyValue', 'key', opts.key, 'string');
  apiValidateType(opts, 'setKeyValue', 'value', opts.value, 'primitive');
  apiValidateType(opts, 'setKeyValue', 'callback', opts.onSuccess, 'function', OPTIONAL);
  apiValidateType(opts, 'setKeyValue', 'onError', opts.onError, 'function', OPTIONAL);
  opts.JSInterpreter = Applab.JSInterpreter;
  var onSuccess = applabCommands.handleSetKeyValue.bind(this, opts);
  var onError = errorHandler.handleError.bind(this, opts);
  AppStorage.setKeyValue(opts.key, opts.value, onSuccess, onError);
};

applabCommands.handleSetKeyValue = function(opts) {
  // Ensure that this event was requested by the same instance of the interpreter
  // that is currently active before proceeding...
  if (opts.onSuccess && opts.JSInterpreter === Applab.JSInterpreter) {
    Applab.JSInterpreter.queueEvent(opts.onSuccess);
  }
};

applabCommands.readRecords = function (opts) {
  // PARAMNAME: readRecords: table vs. tableName
  // PARAMNAME: readRecords: callback vs. callbackFunction
  // PARAMNAME: readRecords: terms vs. searchTerms
  apiValidateType(opts, 'readRecords', 'table', opts.table, 'string');
  apiValidateType(opts, 'readRecords', 'searchTerms', opts.searchParams, 'object');
  apiValidateType(opts, 'readRecords', 'callback', opts.onSuccess, 'function');
  apiValidateType(opts, 'readRecords', 'onError', opts.onError, 'function', OPTIONAL);
  opts.JSInterpreter = Applab.JSInterpreter;
  var onSuccess = applabCommands.handleReadRecords.bind(this, opts);
  var onError = errorHandler.handleError.bind(this, opts);
  AppStorage.readRecords(opts.table, opts.searchParams, onSuccess, onError);
};

applabCommands.handleReadRecords = function(opts, records) {
  // Ensure that this event was requested by the same instance of the interpreter
  // that is currently active before proceeding...
  if (opts.onSuccess && opts.JSInterpreter === Applab.JSInterpreter) {
    Applab.JSInterpreter.queueEvent(opts.onSuccess, [records]);
  }
};

applabCommands.updateRecord = function (opts) {
  // PARAMNAME: updateRecord: table vs. tableName
  // PARAMNAME: updateRecord: callback vs. callbackFunction
  apiValidateType(opts, 'updateRecord', 'table', opts.table, 'string');
  apiValidateType(opts, 'updateRecord', 'record', opts.record, 'object');
  apiValidateTypeAndRange(opts, 'updateRecord', 'record.id', opts.record.id, 'number', 1, Infinity);
  apiValidateType(opts, 'updateRecord', 'callback', opts.onSuccess, 'function', OPTIONAL);
  apiValidateType(opts, 'updateRecord', 'onError', opts.onError, 'function', OPTIONAL);
  opts.JSInterpreter = Applab.JSInterpreter;
  var onSuccess = applabCommands.handleUpdateRecord.bind(this, opts);
  var onError = errorHandler.handleError.bind(this, opts);
  AppStorage.updateRecord(opts.table, opts.record, onSuccess, onError);
};

applabCommands.handleUpdateRecord = function(opts, record) {
  // Ensure that this event was requested by the same instance of the interpreter
  // that is currently active before proceeding...
  if (opts.onSuccess && opts.JSInterpreter === Applab.JSInterpreter) {
    Applab.JSInterpreter.queueEvent(opts.onSuccess, [record]);
  }
};

applabCommands.deleteRecord = function (opts) {
  // PARAMNAME: deleteRecord: table vs. tableName
  // PARAMNAME: deleteRecord: callback vs. callbackFunction
  apiValidateType(opts, 'deleteRecord', 'table', opts.table, 'string');
  apiValidateType(opts, 'deleteRecord', 'record', opts.record, 'object');
  apiValidateTypeAndRange(opts, 'deleteRecord', 'record.id', opts.record.id, 'number', 1, Infinity);
  apiValidateType(opts, 'deleteRecord', 'callback', opts.onSuccess, 'function', OPTIONAL);
  apiValidateType(opts, 'deleteRecord', 'onError', opts.onError, 'function', OPTIONAL);
  opts.JSInterpreter = Applab.JSInterpreter;
  var onSuccess = applabCommands.handleDeleteRecord.bind(this, opts);
  var onError = errorHandler.handleError.bind(this, opts);
  AppStorage.deleteRecord(opts.table, opts.record, onSuccess, onError);
};

applabCommands.handleDeleteRecord = function(opts) {
  // Ensure that this event was requested by the same instance of the interpreter
  // that is currently active before proceeding...
  if (opts.onSuccess && opts.JSInterpreter === Applab.JSInterpreter) {
    Applab.JSInterpreter.queueEvent(opts.onSuccess);
  }
};

applabCommands.getUserId = function (opts) {
  if (!Applab.user.applabUserId) {
    throw new Error("User ID failed to load.");
  }
  return Applab.user.applabUserId;
};
