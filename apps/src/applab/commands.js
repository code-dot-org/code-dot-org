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

var turtle = require('./turtle');
var getTurtleContext = turtle.getTurtleContext;
var updateTurtleImage = turtle.updateTurtleImage;
var turtleSetVisibility = turtle.turtleSetVisibility;

var OPTIONAL = true;

// Because we're wanting to put everything onto the Applab namespace for now,
// we need that passed in (requiring it would lead to a circular dependency).
// That makes this all a little less clean, but I think there's still value
// in having the commands be separated
function loadCommands(Applab) {

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
        var line = 1 + codegen.getNearestUserCodeLine(Applab.interpreter,
                                                      Applab.cumulativeLength,
                                                      Applab.userCodeStartOffset,
                                                      Applab.userCodeLength);
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
        var line = 1 + codegen.getNearestUserCodeLine(Applab.interpreter,
                                                      Applab.cumulativeLength,
                                                      Applab.userCodeStartOffset,
                                                      Applab.userCodeLength);
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
        var line = 1 + codegen.getNearestUserCodeLine(Applab.interpreter,
                                                      Applab.cumulativeLength,
                                                      Applab.userCodeStartOffset,
                                                      Applab.userCodeLength);
        var errorString = funcName + "() called without an active canvas. Call " +
          "createCanvas() first.";
        outputError(errorString, ErrorLevel.WARNING, line);
      }
      if (opts) {
        opts[validatedActiveCanvasKey] = activeCanvas;
      }
    }
  }

  function apiValidateDomIdExistence(divApplab, opts, funcName, varName, id, shouldExist) {
    var validatedTypeKey = 'validated_type_' + varName;
    var validatedDomKey = 'validated_id_' + varName;
    apiValidateType(opts, funcName, varName, id, 'string');
    if (opts[validatedTypeKey] && typeof opts[validatedDomKey] === 'undefined') {
      var element = document.getElementById(id);
      var exists = Boolean(element && divApplab.contains(element));
      var valid = exists == shouldExist;
      if (!valid) {
        var line = 1 + codegen.getNearestUserCodeLine(Applab.interpreter,
                                                      Applab.cumulativeLength,
                                                      Applab.userCodeStartOffset,
                                                      Applab.userCodeLength);
        var errorString = funcName + "() " + varName +
          " parameter refers to an id (" +id + ") which " +
          (exists ? "already exists." : "does not exist.");
        outputError(errorString, ErrorLevel.WARNING, line);
      }
      opts[validatedDomKey] = valid;
    }
  }

  Applab.executeCmd = function (id, name, opts) {
    var cmd = {
      'id': id,
      'name': name,
      'opts': opts
    };
    return Applab.callCmd(cmd);
  };

  //
  // Execute an API command
  //

  Applab.callCmd = function (cmd) {
    var retVal = false;
    if (Applab[cmd.name] instanceof Function) {
      studioApp.highlight(cmd.id);
      retVal = Applab[cmd.name](cmd.opts);
    }
    return retVal;
  };

  Applab.container = function (opts) {
    var divApplab = document.getElementById('divApplab');

    var newDiv = document.createElement("div");
    if (typeof opts.elementId !== "undefined") {
      newDiv.id = opts.elementId;
    }
    newDiv.innerHTML = opts.html;

    return Boolean(divApplab.appendChild(newDiv));
  };

  Applab.write = function (opts) {
    apiValidateType(opts, 'write', 'text', opts.html, 'uistring');
    return Applab.container(opts);
  };

  Applab.button = function (opts) {
    var divApplab = document.getElementById('divApplab');

    // PARAMNAME: button: id vs. buttonId
    apiValidateDomIdExistence(divApplab, opts, 'button', 'id', opts.elementId, false);
    apiValidateType(opts, 'button', 'text', opts.text, 'uistring');

    var newButton = document.createElement("button");
    var textNode = document.createTextNode(opts.text);
    newButton.id = opts.elementId;

    return Boolean(newButton.appendChild(textNode) &&
                   divApplab.appendChild(newButton));
  };

  Applab.image = function (opts) {
    apiValidateType(opts, 'image', 'id', opts.elementId, 'string');
    apiValidateType(opts, 'image', 'url', opts.src, 'string');

    var divApplab = document.getElementById('divApplab');

    var newImage = document.createElement("img");
    newImage.src = opts.src;
    newImage.id = opts.elementId;

    return Boolean(divApplab.appendChild(newImage));
  };

  Applab.imageUploadButton = function (opts) {
    var divApplab = document.getElementById('divApplab');

    // To avoid showing the ugly fileupload input element, we create a label
    // element with an img-upload class that will ensure it looks like a button
    var newLabel = document.createElement("label");
    var textNode = document.createTextNode(opts.text);
    newLabel.id = opts.elementId;
    newLabel.className = 'img-upload';

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
                   divApplab.appendChild(newLabel));
  };



  Applab.show = function (opts) {
    turtleSetVisibility(true);
  };

  Applab.hide = function (opts) {
    turtleSetVisibility(false);
  };

  Applab.moveTo = function (opts) {
    apiValidateType(opts, 'moveTo', 'x', opts.x, 'number');
    apiValidateType(opts, 'moveTo', 'y', opts.y, 'number');
    var ctx = getTurtleContext();
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(Applab.turtle.x, Applab.turtle.y);
      Applab.turtle.x = opts.x;
      Applab.turtle.y = opts.y;
      ctx.lineTo(Applab.turtle.x, Applab.turtle.y);
      ctx.stroke();
      updateTurtleImage();
    }
  };

  Applab.move = function (opts) {
    apiValidateType(opts, 'move', 'x', opts.x, 'number');
    apiValidateType(opts, 'move', 'y', opts.y, 'number');
    opts.x += Applab.turtle.x;
    opts.y += Applab.turtle.y;
    Applab.moveTo(opts);
  };

  Applab.moveForward = function (opts) {
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
    Applab.moveTo(newOpts);
  };

  Applab.moveBackward = function (opts) {
    apiValidateType(opts, 'moveBackward', 'pixels', opts.distance, 'number', OPTIONAL);
    var distance = -25;
    if (typeof opts.distance !== 'undefined') {
      distance = -opts.distance;
    }
    Applab.moveForward({'distance': distance });
  };

  Applab.turnRight = function (opts) {
    apiValidateType(opts, 'turnRight', 'angle', opts.degrees, 'number', OPTIONAL);
    // call this first to ensure there is a turtle (in case this is the first API)
    getTurtleContext();

    var degrees = 90;
    if (typeof opts.degrees !== 'undefined') {
      degrees = opts.degrees;
    }

    Applab.turtle.heading += degrees;
    Applab.turtle.heading = (Applab.turtle.heading + 360) % 360;
    updateTurtleImage();
  };

  Applab.turnLeft = function (opts) {
    apiValidateType(opts, 'turnLeft', 'angle', opts.degrees, 'number', OPTIONAL);
    var degrees = -90;
    if (typeof opts.degrees !== 'undefined') {
      degrees = -opts.degrees;
    }
    Applab.turnRight({'degrees': degrees });
  };

  Applab.turnTo = function (opts) {
    apiValidateType(opts, 'turnTo', 'angle', opts.direction, 'number');
    var degrees = opts.direction - Applab.turtle.heading;
    Applab.turnRight({'degrees': degrees });
  };

  // Turn along an arc with a specified radius (by default, turn clockwise, so
  // the center of the arc is 90 degrees clockwise of the current heading)
  // if opts.counterclockwise, the center point is 90 degrees counterclockwise

  Applab.arcRight = function (opts) {
    apiValidateType(opts, 'arcRight', 'angle', opts.degrees, 'number');
    apiValidateType(opts, 'arcRight', 'radius', opts.radius, 'number');

    // call this first to ensure there is a turtle (in case this is the first API)
    var centerAngle = opts.counterclockwise ? -90 : 90;
    var clockwiseDegrees = opts.counterclockwise ? -opts.degrees : opts.degrees;
    var ctx = getTurtleContext();
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
      updateTurtleImage();
    }
  };

  Applab.arcLeft = function (opts) {
    apiValidateType(opts, 'arcLeft', 'angle', opts.degrees, 'number');
    apiValidateType(opts, 'arcLeft', 'radius', opts.radius, 'number');

    opts.counterclockwise = true;
    Applab.arcRight(opts);
  };

  Applab.getX = function (opts) {
    var ctx = getTurtleContext();
    return Applab.turtle.x;
  };

  Applab.getY = function (opts) {
    var ctx = getTurtleContext();
    return Applab.turtle.y;
  };

  Applab.getDirection = function (opts) {
    var ctx = getTurtleContext();
    return Applab.turtle.heading;
  };

  Applab.dot = function (opts) {
    apiValidateTypeAndRange(opts, 'dot', 'radius', opts.radius, 'number', 0.0001);
    var ctx = getTurtleContext();
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

  Applab.penUp = function (opts) {
    var ctx = getTurtleContext();
    if (ctx) {
      if (ctx.strokeStyle !== "rgba(255, 255, 255, 0)") {
        Applab.turtle.penUpColor = ctx.strokeStyle;
        ctx.strokeStyle = "rgba(255, 255, 255, 0)";
      }
    }
  };

  Applab.penDown = function (opts) {
    var ctx = getTurtleContext();
    if (ctx && Applab.turtle.penUpColor) {
      ctx.strokeStyle = Applab.turtle.penUpColor;
      delete Applab.turtle.penUpColor;
    }
  };

  Applab.penWidth = function (opts) {
    apiValidateTypeAndRange(opts, 'penWidth', 'width', opts.width, 'number', 0.0001);
    var ctx = getTurtleContext();
    if (ctx) {
      ctx.lineWidth = opts.width;
    }
  };

  Applab.penColorInternal = function (rgbstring) {
    var ctx = getTurtleContext();
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

  Applab.penColor = function (opts) {
    apiValidateType(opts, 'penColor', 'color', opts.color, 'color');
    Applab.penColorInternal(opts.color);
  };

  Applab.penRGB = function (opts) {
    // PARAMNAME: penRGB: red vs. r
    // PARAMNAME: penRGB: green vs. g
    // PARAMNAME: penRGB: blue vs. b
    apiValidateTypeAndRange(opts, 'penRGB', 'r', opts.r, 'number', 0, 255);
    apiValidateTypeAndRange(opts, 'penRGB', 'g', opts.g, 'number', 0, 255);
    apiValidateTypeAndRange(opts, 'penRGB', 'b', opts.b, 'number', 0, 255);
    apiValidateTypeAndRange(opts, 'penRGB', 'a', opts.a, 'number', 0, 1, OPTIONAL);
    var alpha = (typeof opts.a === 'undefined') ? 1 : opts.a;
    var rgbstring = "rgba(" + opts.r + "," + opts.g + "," + opts.b + "," + alpha + ")";
    Applab.penColorInternal(rgbstring);
  };

  Applab.speed = function (opts) {
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

  Applab.createCanvas = function (opts) {
    var divApplab = document.getElementById('divApplab');
    // PARAMNAME: createCanvas: id vs. canvasId
    apiValidateDomIdExistence(divApplab, opts, 'createCanvas', 'canvasId', opts.elementId, false);
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
      newElement.style.width = width + 'px';
      newElement.style.height = height + 'px';
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

      return Boolean(divApplab.appendChild(newElement));
    }
    return false;
  };

  Applab.setActiveCanvas = function (opts) {
    var divApplab = document.getElementById('divApplab');
    // PARAMNAME: setActiveCanvas: id vs. canvasId
    apiValidateDomIdExistence(divApplab, opts, 'setActiveCanvas', 'canvasId', opts.elementId, true);
    var canvas = document.getElementById(opts.elementId);
    if (divApplab.contains(canvas)) {
      Applab.activeCanvas = canvas;
      return true;
    }
    return false;
  };

  Applab.line = function (opts) {
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

  Applab.circle = function (opts) {
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

  Applab.rect = function (opts) {
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

  Applab.setStrokeWidth = function (opts) {
    apiValidateActiveCanvas(opts, 'setStrokeWidth');
    apiValidateTypeAndRange(opts, 'setStrokeWidth', 'width', opts.width, 'number', 0.0001);
    var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext("2d");
    if (ctx) {
      ctx.lineWidth = opts.width;
      return true;
    }
    return false;
  };

  Applab.setStrokeColor = function (opts) {
    apiValidateActiveCanvas(opts, 'setStrokeColor');
    apiValidateType(opts, 'setStrokeColor', 'color', opts.color, 'color');
    var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = String(opts.color);
      return true;
    }
    return false;
  };

  Applab.setFillColor = function (opts) {
    apiValidateActiveCanvas(opts, 'setFillColor');
    apiValidateType(opts, 'setFillColor', 'color', opts.color, 'color');
    var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = String(opts.color);
      return true;
    }
    return false;
  };

  Applab.clearCanvas = function (opts) {
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

  Applab.drawImage = function (opts) {
    var divApplab = document.getElementById('divApplab');
    // PARAMNAME: drawImage: imageId vs. id
    apiValidateActiveCanvas(opts, 'drawImage');
    apiValidateDomIdExistence(divApplab, opts, 'drawImage', 'id', opts.imageId, true);
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

  Applab.getImageData = function (opts) {
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

  Applab.putImageData = function (opts) {
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

  Applab.textInput = function (opts) {
    var divApplab = document.getElementById('divApplab');
    // PARAMNAME: textInput: id vs. inputId
    apiValidateDomIdExistence(divApplab, opts, 'textInput', 'id', opts.elementId, false);
    apiValidateType(opts, 'textInput', 'text', opts.text, 'uistring');

    var newInput = document.createElement("input");
    newInput.value = opts.text;
    newInput.id = opts.elementId;

    return Boolean(divApplab.appendChild(newInput));
  };

  Applab.textLabel = function (opts) {
    var divApplab = document.getElementById('divApplab');
    // PARAMNAME: textLabel: id vs. labelId
    apiValidateDomIdExistence(divApplab, opts, 'textLabel', 'id', opts.elementId, false);
    apiValidateType(opts, 'textLabel', 'text', opts.text, 'uistring');
    if (typeof opts.forId !== 'undefined') {
      apiValidateDomIdExistence(divApplab, opts, 'textLabel', 'forId', opts.forId, true);
    }

    var newLabel = document.createElement("label");
    var textNode = document.createTextNode(opts.text);
    newLabel.id = opts.elementId;
    var forElement = document.getElementById(opts.forId);
    if (forElement && divApplab.contains(forElement)) {
      newLabel.setAttribute('for', opts.forId);
    }

    return Boolean(newLabel.appendChild(textNode) &&
                   divApplab.appendChild(newLabel));
  };

  Applab.checkbox = function (opts) {
    var divApplab = document.getElementById('divApplab');
    // PARAMNAME: checkbox: id vs. checkboxId
    apiValidateDomIdExistence(divApplab, opts, 'checkbox', 'id', opts.elementId, false);
    // apiValidateType(opts, 'checkbox', 'checked', opts.checked, 'boolean');

    var newCheckbox = document.createElement("input");
    newCheckbox.setAttribute("type", "checkbox");
    newCheckbox.checked = opts.checked;
    newCheckbox.id = opts.elementId;

    return Boolean(divApplab.appendChild(newCheckbox));
  };

  Applab.radioButton = function (opts) {
    var divApplab = document.getElementById('divApplab');
    apiValidateDomIdExistence(divApplab, opts, 'radioButton', 'id', opts.elementId, false);
    // apiValidateType(opts, 'radioButton', 'checked', opts.checked, 'boolean');
    apiValidateType(opts, 'radioButton', 'group', opts.name, 'string', OPTIONAL);

    var newRadio = document.createElement("input");
    newRadio.setAttribute("type", "radio");
    newRadio.name = opts.name;
    newRadio.checked = opts.checked;
    newRadio.id = opts.elementId;

    return Boolean(divApplab.appendChild(newRadio));
  };

  Applab.dropdown = function (opts) {
    var divApplab = document.getElementById('divApplab');
    // PARAMNAME: dropdown: id vs. dropdownId
    apiValidateDomIdExistence(divApplab, opts, 'dropdown', 'id', opts.elementId, false);

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

    return Boolean(divApplab.appendChild(newSelect));
  };

  Applab.getAttribute = function (opts) {
    var divApplab = document.getElementById('divApplab');
    var element = document.getElementById(opts.elementId);
    var attribute = String(opts.attribute);
    return divApplab.contains(element) ? element[attribute] : false;
  };

  // Whitelist of HTML Element attributes which can be modified, to
  // prevent DOM manipulation which would violate the sandbox.
  Applab.mutableAttributes = ['innerHTML', 'scrollTop'];

  Applab.setAttribute = function (opts) {
    var divApplab = document.getElementById('divApplab');
    var element = document.getElementById(opts.elementId);
    var attribute = String(opts.attribute);
    if (divApplab.contains(element) &&
        Applab.mutableAttributes.indexOf(attribute) !== -1) {
      element[attribute] = opts.value;
      return true;
    }
    return false;
  };

  Applab.getText = function (opts) {
    var divApplab = document.getElementById('divApplab');
    apiValidateDomIdExistence(divApplab, opts, 'getText', 'id', opts.elementId, true);

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

  Applab.setText = function (opts) {
    var divApplab = document.getElementById('divApplab');
    apiValidateDomIdExistence(divApplab, opts, 'setText', 'id', opts.elementId, true);
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

  Applab.getChecked = function (opts) {
    var divApplab = document.getElementById('divApplab');
    apiValidateDomIdExistence(divApplab, opts, 'getChecked', 'id', opts.elementId, true);

    var element = document.getElementById(opts.elementId);
    if (divApplab.contains(element) && element.tagName === 'INPUT') {
      return element.checked;
    }
    return false;
  };

  Applab.setChecked = function (opts) {
    var divApplab = document.getElementById('divApplab');
    apiValidateDomIdExistence(divApplab, opts, 'setChecked', 'id', opts.elementId, true);
    // apiValidateType(opts, 'setChecked', 'checked', opts.checked, 'boolean');

    var element = document.getElementById(opts.elementId);
    if (divApplab.contains(element) && element.tagName === 'INPUT') {
      element.checked = opts.checked;
      return true;
    }
    return false;
  };

  Applab.getImageURL = function (opts) {
    var divApplab = document.getElementById('divApplab');
    // PARAMNAME: getImageURL: id vs. imageId
    apiValidateDomIdExistence(divApplab, opts, 'getImageURL', 'id', opts.elementId, true);

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

  Applab.setImageURL = function (opts) {
    var divApplab = document.getElementById('divApplab');
    apiValidateDomIdExistence(divApplab, opts, 'setImageURL', 'id', opts.elementId, true);
    apiValidateType(opts, 'setImageURL', 'url', opts.src, 'string');

    var element = document.getElementById(opts.elementId);
    if (divApplab.contains(element) && element.tagName === 'IMG') {
      element.src = opts.src;
      return true;
    }
    return false;
  };

  Applab.playSound = function (opts) {
    apiValidateType(opts, 'playSound', 'url', opts.url, 'string');

    if (studioApp.cdoSounds) {
      studioApp.cdoSounds.playURL(opts.url,
                                 {volume: 1.0,
                                  forceHTML5: true,
                                  allowHTML5Mobile: true
      });
    }
  };

  Applab.innerHTML = function (opts) {
    var divApplab = document.getElementById('divApplab');
    var div = document.getElementById(opts.elementId);
    if (divApplab.contains(div)) {
      div.innerHTML = opts.html;
      return true;
    }
    return false;
  };

  Applab.deleteElement = function (opts) {
    var divApplab = document.getElementById('divApplab');
    apiValidateDomIdExistence(divApplab, opts, 'deleteElement', 'id', opts.elementId, true);

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

  Applab.showElement = function (opts) {
    var divApplab = document.getElementById('divApplab');
    apiValidateDomIdExistence(divApplab, opts, 'showElement', 'id', opts.elementId, true);

    var div = document.getElementById(opts.elementId);
    if (divApplab.contains(div)) {
      div.style.visibility = 'visible';
      return true;
    }
    return false;
  };

  Applab.hideElement = function (opts) {
    var divApplab = document.getElementById('divApplab');
    apiValidateDomIdExistence(divApplab, opts, 'hideElement', 'id', opts.elementId, true);

    var div = document.getElementById(opts.elementId);
    if (divApplab.contains(div)) {
      div.style.visibility = 'hidden';
      return true;
    }
    return false;
  };

  Applab.setStyle = function (opts) {
    var divApplab = document.getElementById('divApplab');
    var div = document.getElementById(opts.elementId);
    if (divApplab.contains(div)) {
      div.style.cssText += opts.style;
      return true;
    }
    return false;
  };

  Applab.setParent = function (opts) {
    var divApplab = document.getElementById('divApplab');
    var div = document.getElementById(opts.elementId);
    var divNewParent = document.getElementById(opts.parentId);
    if (divApplab.contains(div) && divApplab.contains(divNewParent)) {
      return Boolean(div.parentElement.removeChild(div) &&
                     divNewParent.appendChild(div));
    }
    return false;
  };

  Applab.setPosition = function (opts) {
    var divApplab = document.getElementById('divApplab');
    apiValidateDomIdExistence(divApplab, opts, 'setPosition', 'id', opts.elementId, true);
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

  Applab.getXPosition = function (opts) {
    var divApplab = document.getElementById('divApplab');
    apiValidateDomIdExistence(divApplab, opts, 'getXPosition', 'id', opts.elementId, true);

    var div = document.getElementById(opts.elementId);
    if (divApplab.contains(div)) {
      var x = div.offsetLeft;
      while (div !== divApplab) {
        div = div.offsetParent;
        x += div.offsetLeft;
      }
      return x;
    }
    return 0;
  };

  Applab.getYPosition = function (opts) {
    var divApplab = document.getElementById('divApplab');
    apiValidateDomIdExistence(divApplab, opts, 'getYPosition', 'id', opts.elementId, true);

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

  Applab.onEventFired = function (opts, e) {
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
      Applab.eventQueue.push({
        'fn': opts.func,
        'arguments': [applabEvent].concat(opts.extraArgs)
      });
    } else {
      Applab.eventQueue.push({'fn': opts.func});
    }
    if (Applab.interpreter) {
      // Execute the interpreter and if a return value is sent back from the
      // interpreter's event handler, pass that back in the native world

      // NOTE: the interpreter will not execute forever, if the event handler
      // takes too long, executeInterpreter() will return and the native side
      // will just see 'undefined' as the return value. The rest of the interpreter
      // event handler will run in the next onTick(), but the return value will
      // no longer have any effect.
      Applab.executeInterpreter(true);
      return Applab.lastCallbackRetVal;
    }
  };

  Applab.onEvent = function (opts) {
    var divApplab = document.getElementById('divApplab');
    // Special case the id of 'body' to mean the app's container (divApplab)
    // TODO (cpirich): apply this logic more broadly (setStyle, etc.)
    if (opts.elementId === 'body') {
      opts.elementId = 'divApplab';
    } else {
      apiValidateDomIdExistence(divApplab, opts, 'onEvent', 'id', opts.elementId, true);
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
                           Applab.onEventFired.bind(this, opts));
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
              Applab.onEventFired.bind(this, opts));
          break;
        default:
          return false;
      }
      return true;
    }
    return false;
  };

  Applab.onHttpRequestEvent = function (opts) {
    // Ensure that this event was requested by the same instance of the interpreter
    // that is currently active before proceeding...
    if (opts.interpreter === Applab.interpreter) {
      if (this.readyState === 4) {
        Applab.eventQueue.push({
          'fn': opts.func,
          'arguments': [
            Number(this.status),
            String(this.getResponseHeader('content-type')),
            String(this.responseText)]
        });
      }
    }
  };

  Applab.startWebRequest = function (opts) {
    apiValidateType(opts, 'startWebRequest', 'url', opts.url, 'string');
    apiValidateType(opts, 'startWebRequest', 'callback', opts.func, 'function');
    opts.interpreter = Applab.interpreter;
    var req = new XMLHttpRequest();
    req.onreadystatechange = Applab.onHttpRequestEvent.bind(req, opts);
    req.open('GET', opts.url, true);
    req.send();
  };

  Applab.onTimerFired = function (opts) {
    // ensure that this event came from the active interpreter instance:
    Applab.eventQueue.push({
      'fn': opts.func
    });
    // NOTE: the interpreter will not execute forever, if the event handler
    // takes too long, executeInterpreter() will return and the rest of the
    // user's code will execute in the next onTick()
    Applab.executeInterpreter(true);
  };

  Applab.setTimeout = function (opts) {
    // PARAMNAME: setTimeout: callback vs. function
    // PARAMNAME: setTimeout: ms vs. milliseconds
    apiValidateType(opts, 'setTimeout', 'callback', opts.func, 'function');
    apiValidateType(opts, 'setTimeout', 'milliseconds', opts.milliseconds, 'number');

    return apiTimeoutList.setTimeout(Applab.onTimerFired.bind(this, opts), opts.milliseconds);
  };

  Applab.clearTimeout = function (opts) {
    apiValidateType(opts, 'clearTimeout', 'timeout', opts.timeoutId, 'number');
    // NOTE: we do not currently check to see if this is a timer created by
    // our Applab.setTimeout() function
    apiTimeoutList.clearTimeout(opts.timeoutId);
  };

  Applab.setInterval = function (opts) {
    // PARAMNAME: setInterval: callback vs. function
    // PARAMNAME: setInterval: ms vs. milliseconds
    apiValidateType(opts, 'setInterval', 'callback', opts.func, 'function');
    apiValidateType(opts, 'setInterval', 'milliseconds', opts.milliseconds, 'number');

    return apiTimeoutList.setInterval(Applab.onTimerFired.bind(this, opts), opts.milliseconds);
  };

  Applab.clearInterval = function (opts) {
    apiValidateType(opts, 'clearInterval', 'interval', opts.intervalId, 'number');
    // NOTE: we do not currently check to see if this is a timer created by
    // our Applab.setInterval() function
    apiTimeoutList.clearInterval(opts.intervalId);
  };

  Applab.createRecord = function (opts) {
    // PARAMNAME: createRecord: table vs. tableName
    // PARAMNAME: createRecord: callback vs. callbackFunction
    apiValidateType(opts, 'createRecord', 'table', opts.table, 'string');
    apiValidateType(opts, 'createRecord', 'record', opts.record, 'object');
    apiValidateType(opts, 'createRecord', 'record.id', opts.record.id, 'undefined');
    apiValidateType(opts, 'createRecord', 'callback', opts.onSuccess, 'function', OPTIONAL);
    apiValidateType(opts, 'createRecord', 'onError', opts.onError, 'function', OPTIONAL);
    opts.interpreter = Applab.interpreter;
    var onSuccess = Applab.handleCreateRecord.bind(this, opts);
    var onError = Applab.handleError.bind(this, opts);
    AppStorage.createRecord(opts.table, opts.record, onSuccess, onError);
  };

  Applab.handleCreateRecord = function(opts, record) {
    // Ensure that this event was requested by the same instance of the interpreter
    // that is currently active before proceeding...
    if (opts.onSuccess && opts.interpreter === Applab.interpreter) {
      Applab.eventQueue.push({
        'fn': opts.onSuccess,
        'arguments': [record]
      });
    }
  };

  Applab.getKeyValue = function(opts) {
    // PARAMNAME: getKeyValue: callback vs. callbackFunction
    apiValidateType(opts, 'getKeyValue', 'key', opts.key, 'string');
    apiValidateType(opts, 'getKeyValue', 'callback', opts.onSuccess, 'function');
    apiValidateType(opts, 'getKeyValue', 'onError', opts.onError, 'function', OPTIONAL);
    opts.interpreter = Applab.interpreter;
    var onSuccess = Applab.handleReadValue.bind(this, opts);
    var onError = Applab.handleError.bind(this, opts);
    AppStorage.getKeyValue(opts.key, onSuccess, onError);
  };

  Applab.handleReadValue = function(opts, value) {
    // Ensure that this event was requested by the same instance of the interpreter
    // that is currently active before proceeding...
    if (opts.onSuccess && opts.interpreter === Applab.interpreter) {
      Applab.eventQueue.push({
        'fn': opts.onSuccess,
        'arguments': [value]
      });
    }
  };

  Applab.setKeyValue = function(opts) {
    // PARAMNAME: setKeyValue: callback vs. callbackFunction
    apiValidateType(opts, 'setKeyValue', 'key', opts.key, 'string');
    apiValidateType(opts, 'setKeyValue', 'value', opts.value, 'primitive');
    apiValidateType(opts, 'setKeyValue', 'callback', opts.onSuccess, 'function', OPTIONAL);
    apiValidateType(opts, 'setKeyValue', 'onError', opts.onError, 'function', OPTIONAL);
    opts.interpreter = Applab.interpreter;
    var onSuccess = Applab.handleSetKeyValue.bind(this, opts);
    var onError = Applab.handleError.bind(this, opts);
    AppStorage.setKeyValue(opts.key, opts.value, onSuccess, onError);
  };

  Applab.handleSetKeyValue = function(opts) {
    // Ensure that this event was requested by the same instance of the interpreter
    // that is currently active before proceeding...
    if (opts.onSuccess && opts.interpreter === Applab.interpreter) {
      Applab.eventQueue.push({
        'fn': opts.onSuccess,
        'arguments': []
      });
    }
  };

  Applab.readRecords = function (opts) {
    // PARAMNAME: readRecords: table vs. tableName
    // PARAMNAME: readRecords: callback vs. callbackFunction
    // PARAMNAME: readRecords: terms vs. searchTerms
    apiValidateType(opts, 'readRecords', 'table', opts.table, 'string');
    apiValidateType(opts, 'readRecords', 'searchTerms', opts.searchParams, 'object');
    apiValidateType(opts, 'readRecords', 'callback', opts.onSuccess, 'function');
    apiValidateType(opts, 'readRecords', 'onError', opts.onError, 'function', OPTIONAL);
    opts.interpreter = Applab.interpreter;
    var onSuccess = Applab.handleReadRecords.bind(this, opts);
    var onError = Applab.handleError.bind(this, opts);
    AppStorage.readRecords(opts.table, opts.searchParams, onSuccess, onError);
  };

  Applab.handleReadRecords = function(opts, records) {
    // Ensure that this event was requested by the same instance of the interpreter
    // that is currently active before proceeding...
    if (opts.onSuccess && opts.interpreter === Applab.interpreter) {
      Applab.eventQueue.push({
        'fn': opts.onSuccess,
        'arguments': [records]
      });
    }
  };

  Applab.updateRecord = function (opts) {
    // PARAMNAME: updateRecord: table vs. tableName
    // PARAMNAME: updateRecord: callback vs. callbackFunction
    apiValidateType(opts, 'updateRecord', 'table', opts.table, 'string');
    apiValidateType(opts, 'updateRecord', 'record', opts.record, 'object');
    apiValidateTypeAndRange(opts, 'updateRecord', 'record.id', opts.record.id, 'number', 1, Infinity);
    apiValidateType(opts, 'updateRecord', 'callback', opts.onSuccess, 'function', OPTIONAL);
    apiValidateType(opts, 'updateRecord', 'onError', opts.onError, 'function', OPTIONAL);
    opts.interpreter = Applab.interpreter;
    var onSuccess = Applab.handleUpdateRecord.bind(this, opts);
    var onError = Applab.handleError.bind(this, opts);
    AppStorage.updateRecord(opts.table, opts.record, onSuccess, onError);
  };

  Applab.handleUpdateRecord = function(opts, record) {
    // Ensure that this event was requested by the same instance of the interpreter
    // that is currently active before proceeding...
    if (opts.onSuccess && opts.interpreter === Applab.interpreter) {
      Applab.eventQueue.push({
        'fn': opts.onSuccess,
        'arguments': [record]
      });
    }
  };

  Applab.deleteRecord = function (opts) {
    // PARAMNAME: deleteRecord: table vs. tableName
    // PARAMNAME: deleteRecord: callback vs. callbackFunction
    apiValidateType(opts, 'deleteRecord', 'table', opts.table, 'string');
    apiValidateType(opts, 'deleteRecord', 'record', opts.record, 'object');
    apiValidateTypeAndRange(opts, 'deleteRecord', 'record.id', opts.record.id, 'number', 1, Infinity);
    apiValidateType(opts, 'deleteRecord', 'callback', opts.onSuccess, 'function', OPTIONAL);
    apiValidateType(opts, 'deleteRecord', 'onError', opts.onError, 'function', OPTIONAL);
    opts.interpreter = Applab.interpreter;
    var onSuccess = Applab.handleDeleteRecord.bind(this, opts);
    var onError = Applab.handleError.bind(this, opts);
    AppStorage.deleteRecord(opts.table, opts.record, onSuccess, onError);
  };

  Applab.handleDeleteRecord = function(opts) {
    // Ensure that this event was requested by the same instance of the interpreter
    // that is currently active before proceeding...
    if (opts.onSuccess && opts.interpreter === Applab.interpreter) {
      Applab.eventQueue.push({
        'fn': opts.onSuccess,
        'arguments': []
      });
    }
  };

  Applab.getUserId = function (opts) {
    if (!Applab.user.applabUserId) {
      throw new Error("User ID failed to load.");
    }
    return Applab.user.applabUserId;
  };
}

module.exports = {
  loadCommands: loadCommands
};
