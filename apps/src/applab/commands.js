import ChartApi from './ChartApi';
import EventSandboxer from './EventSandboxer';
import sanitizeHtml from './sanitizeHtml';
import * as utils from '../utils';
import elementLibrary from './designElements/library';
import * as elementUtils from './designElements/elementUtils';
import * as setPropertyDropdown from './setPropertyDropdown';
import * as assetPrefix from '../assetManagement/assetPrefix';
import applabTurtle from './applabTurtle';
import ChangeEventHandler from './ChangeEventHandler';
import logToCloud from '../logToCloud';
import {
  OPTIONAL,
  apiValidateType,
  apiValidateTypeAndRange,
  getAsyncOutputWarning,
  outputError,
  outputWarning
} from '../lib/util/javascriptMode';
import {commands as audioCommands} from '@cdo/apps/lib/util/audioApi';
import {commands as timeoutCommands} from '@cdo/apps/lib/util/timeoutApi';
import * as makerCommands from '@cdo/apps/lib/kits/maker/commands';
import {getAppOptions} from '@cdo/apps/code-studio/initApp/loadApp';
import {AllowedWebRequestHeaders} from '@cdo/apps/util/sharedConstants';
import {actions, REDIRECT_RESPONSE} from './redux/applab';
import {getStore} from '../redux';
import $ from 'jquery';
import i18n from '@cdo/applab/locale';

// For proxying non-https xhr requests
var XHR_PROXY_PATH = '//' + location.host + '/xhr';

import {ICON_PREFIX_REGEX} from './constants';

var applabCommands = {};
export default applabCommands;

/**
 * Lookup table of asset URLs. If an asset isn't listed here, initiate a
 * separate request to ensure it is downloaded without interruption. Otherwise
 * a quickly changing src could cancel the download before it can be cached by
 * the browser.
 */
var toBeCached = {};

/**
 * Utility for converting browser events into standardized, sandboxed event
 * objects for use in student code.
 * @type {EventSandboxer}
 */
var eventSandboxer = new EventSandboxer();

function apiValidateActiveCanvas(opts, funcName) {
  var validatedActiveCanvasKey = 'validated_active_canvas';
  if (!opts || typeof opts[validatedActiveCanvasKey] === 'undefined') {
    var activeCanvas = Boolean(Applab.activeCanvas);
    if (!activeCanvas) {
      outputWarning(
        funcName +
          '() called without an active canvas. Call ' +
          'createCanvas() first.'
      );
    }
    if (opts) {
      opts[validatedActiveCanvasKey] = activeCanvas;
    }
  }
}

/**
 * Validate that the supplied id exists. If not, output a warning.
 * @param {object} opts
 * @param {string} funcName
 * @param {string} varName
 * @param {string} id
 * @param {boolean} shouldExist
 * @param {function} callback optional, called if a warning is needed with a
 *  single parameter indicating whether or not the element existsInApplab. If the
 *  return value is true, the built-in warning is suppressed.
 */
function apiValidateDomIdExistence(
  opts,
  funcName,
  varName,
  id,
  shouldExist,
  callback
) {
  var divApplab = document.getElementById('divApplab');
  var validatedTypeKey = 'validated_type_' + varName;
  var validatedDomKey = 'validated_id_' + varName;
  apiValidateType(opts, funcName, varName, id, 'string');
  if (opts[validatedTypeKey] && typeof opts[validatedDomKey] === 'undefined') {
    var element = document.getElementById(id);

    var existsInApplab = Boolean(element && divApplab.contains(element));
    var options = {
      allowCodeElements: true,
      allowDesignPrefix: true,
      allowDesignElements: true,
      allowTurtleCanvas: Boolean(opts.turtleCanvas)
    };
    var existsOutsideApplab = !elementUtils.isIdAvailable(id, options);

    var valid = true;
    var message;
    if (existsOutsideApplab) {
      message =
        'is already being used outside of App Lab. Please use a different id.';
      throw new Error(invalidIdMessage(funcName, varName, id, message));
    }

    if (
      shouldExist !== existsInApplab &&
      (!callback || !callback(existsInApplab))
    ) {
      valid = false;
      message = existsInApplab ? 'already exists.' : 'does not exist.';
      outputWarning(invalidIdMessage(funcName, varName, id, message));
    }

    var idContainsWhiteSpace = -1 !== id.search(/\s/);
    if (idContainsWhiteSpace) {
      valid = false;
      var validId = id.replace(/\s+/g, '');
      message = `contains whitespace. Change the id name to ("${validId}")`;
      outputWarning(invalidIdMessage(funcName, varName, id, message));
    }
    opts[validatedDomKey] = valid;
  }
}

// (brent) We may in the future also provide a second option that allows you to
// reset the state of the screen to it's original (design mode) state.
applabCommands.setScreen = function(opts) {
  apiValidateDomIdExistence(opts, 'setScreen', 'screenId', opts.screenId, true);
  var element = document.getElementById(opts.screenId);
  var divApplab = document.getElementById('divApplab');
  if (!element || element.parentNode !== divApplab) {
    return;
  }

  Applab.changeScreen(opts.screenId);
};

function reportUnsafeHtml(removed, unsafe, safe, warnings) {
  var msg =
    'The following lines of HTML were modified or removed:\n' +
    removed +
    '\noriginal html:\n' +
    unsafe +
    '\nmodified html:\n' +
    safe;
  if (warnings.length > 0) {
    msg += '\nwarnings:\n' + warnings.join('\n');
  }
  outputWarning(msg);
}

applabCommands.container = function(opts) {
  if (opts.elementId) {
    apiValidateDomIdExistence(opts, 'container', 'id', opts.elementId, false);
  }
  var newDiv = document.createElement('div');
  if (typeof opts.elementId !== 'undefined') {
    newDiv.id = opts.elementId;
  }
  var sanitized = sanitizeHtml(
    opts.html,
    reportUnsafeHtml,
    false,
    true /* rejectExistingIds */
  );
  newDiv.innerHTML = sanitized;
  newDiv.style.position = 'relative';

  return Boolean(Applab.activeScreen().appendChild(newDiv));
};

applabCommands.write = function(opts) {
  apiValidateType(opts, 'write', 'text', opts.html, 'uistring');
  return applabCommands.container(opts);
};

applabCommands.button = function(opts) {
  // PARAMNAME: button: id vs. buttonId
  apiValidateDomIdExistence(opts, 'button', 'id', opts.elementId, false);
  apiValidateType(opts, 'button', 'text', opts.text, 'uistring');

  var newButton = document.createElement('button');
  var textNode = document.createTextNode(opts.text);
  newButton.id = opts.elementId;
  newButton.style.position = 'relative';
  newButton.style.borderStyle = 'solid';
  elementLibrary.setAllPropertiesToCurrentTheme(
    newButton,
    Applab.activeScreen()
  );

  return Boolean(
    newButton.appendChild(textNode) &&
      Applab.activeScreen().appendChild(newButton)
  );
};

applabCommands.image = function(opts) {
  apiValidateDomIdExistence(opts, 'image', 'id', opts.elementId, false);
  apiValidateType(opts, 'image', 'id', opts.elementId, 'string');
  apiValidateType(opts, 'image', 'url', opts.src, 'string');

  var newImage = document.createElement('img');
  if (ICON_PREFIX_REGEX.test(opts.src)) {
    newImage.src = assetPrefix.renderIconToString(opts.src, newImage);
    newImage.width = newImage.height = 200;
  } else {
    newImage.src = assetPrefix.fixPath(opts.src);
  }
  newImage.setAttribute('data-canonical-image-url', opts.src);
  newImage.id = opts.elementId;
  newImage.style.position = 'relative';
  elementUtils.setDefaultBorderStyles(newImage, {forceDefaults: true});

  Applab.updateProperty(newImage, 'objectFit', 'contain');

  return Boolean(Applab.activeScreen().appendChild(newImage));
};

applabCommands.imageUploadButton = function(opts) {
  apiValidateDomIdExistence(
    opts,
    'imageUploadButton',
    'id',
    opts.elementId,
    false
  );
  // To avoid showing the ugly fileupload input element, we create a label
  // element with an img-upload class that will ensure it looks like a button
  var newLabel = document.createElement('label');
  var textNode = document.createTextNode(opts.text);
  newLabel.id = opts.elementId;
  newLabel.className = 'img-upload';
  newLabel.style.position = 'relative';

  // We then create an offscreen input element and make it a child of the new
  // label element
  var newInput = document.createElement('input');
  newInput.type = 'file';
  newInput.accept = 'image/*';
  newInput.capture = 'camera';
  newInput.style.position = 'absolute';
  newInput.style.left = '-9999px';

  return Boolean(
    newLabel.appendChild(newInput) &&
      newLabel.appendChild(textNode) &&
      Applab.activeScreen().appendChild(newLabel)
  );
};

applabCommands.show = function(opts) {
  applabTurtle.turtleSetVisibility(true);
};

applabCommands.hide = function(opts) {
  applabTurtle.turtleSetVisibility(false);
};

applabCommands.moveTo = function(opts) {
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

applabCommands.move = function(opts) {
  apiValidateType(opts, 'move', 'x', opts.x, 'number');
  apiValidateType(opts, 'move', 'y', opts.y, 'number');
  opts.x += Applab.turtle.x;
  opts.y += Applab.turtle.y;
  applabCommands.moveTo(opts);
};

applabCommands.moveForward = function(opts) {
  apiValidateType(
    opts,
    'moveForward',
    'pixels',
    opts.distance,
    'number',
    OPTIONAL
  );
  var newOpts = {};
  var distance = 25;
  if (typeof opts.distance !== 'undefined') {
    distance = opts.distance;
  }
  newOpts.x =
    Applab.turtle.x +
    distance * Math.sin((2 * Math.PI * Applab.turtle.heading) / 360);
  newOpts.y =
    Applab.turtle.y -
    distance * Math.cos((2 * Math.PI * Applab.turtle.heading) / 360);
  applabCommands.moveTo(newOpts);
};

applabCommands.moveBackward = function(opts) {
  apiValidateType(
    opts,
    'moveBackward',
    'pixels',
    opts.distance,
    'number',
    OPTIONAL
  );
  var distance = -25;
  if (typeof opts.distance !== 'undefined') {
    distance = -opts.distance;
  }
  applabCommands.moveForward({distance: distance});
};

applabCommands.turnRight = function(opts) {
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

applabCommands.turnLeft = function(opts) {
  apiValidateType(opts, 'turnLeft', 'angle', opts.degrees, 'number', OPTIONAL);
  var degrees = -90;
  if (typeof opts.degrees !== 'undefined') {
    degrees = -opts.degrees;
  }
  applabCommands.turnRight({degrees: degrees});
};

applabCommands.turnTo = function(opts) {
  apiValidateType(opts, 'turnTo', 'angle', opts.direction, 'number');
  var degrees = opts.direction - Applab.turtle.heading;
  applabCommands.turnRight({degrees: degrees});
};

// Turn along an arc with a specified radius (by default, turn clockwise, so
// the center of the arc is 90 degrees clockwise of the current heading)
// if opts.counterclockwise, the center point is 90 degrees counterclockwise

applabCommands.arcRight = function(opts) {
  apiValidateType(opts, 'arcRight', 'angle', opts.degrees, 'number');
  apiValidateType(opts, 'arcRight', 'radius', opts.radius, 'number');

  // call this first to ensure there is a turtle (in case this is the first API)
  var centerAngle = opts.counterclockwise ? -90 : 90;
  var clockwiseDegrees = opts.counterclockwise ? -opts.degrees : opts.degrees;
  var ctx = applabTurtle.getTurtleContext();
  if (ctx) {
    var centerX =
      Applab.turtle.x +
      opts.radius *
        Math.sin((2 * Math.PI * (Applab.turtle.heading + centerAngle)) / 360);
    var centerY =
      Applab.turtle.y -
      opts.radius *
        Math.cos((2 * Math.PI * (Applab.turtle.heading + centerAngle)) / 360);

    var startAngle =
      (2 *
        Math.PI *
        (Applab.turtle.heading + (opts.counterclockwise ? 0 : 180))) /
      360;
    var endAngle = startAngle + (2 * Math.PI * clockwiseDegrees) / 360;

    ctx.beginPath();
    ctx.arc(
      centerX,
      centerY,
      opts.radius,
      startAngle,
      endAngle,
      opts.counterclockwise
    );
    ctx.stroke();

    Applab.turtle.heading =
      (Applab.turtle.heading + clockwiseDegrees + 360) % 360;
    var xMovement =
      opts.radius * Math.cos((2 * Math.PI * Applab.turtle.heading) / 360);
    var yMovement =
      opts.radius * Math.sin((2 * Math.PI * Applab.turtle.heading) / 360);
    Applab.turtle.x =
      centerX + (opts.counterclockwise ? xMovement : -xMovement);
    Applab.turtle.y =
      centerY + (opts.counterclockwise ? yMovement : -yMovement);
    applabTurtle.updateTurtleImage();
  }
};

applabCommands.arcLeft = function(opts) {
  apiValidateType(opts, 'arcLeft', 'angle', opts.degrees, 'number');
  apiValidateType(opts, 'arcLeft', 'radius', opts.radius, 'number');

  opts.counterclockwise = true;
  applabCommands.arcRight(opts);
};

applabCommands.getX = function(opts) {
  return Applab.turtle.x;
};

applabCommands.getY = function(opts) {
  return Applab.turtle.y;
};

applabCommands.getDirection = function(opts) {
  return Applab.turtle.heading;
};

applabCommands.dot = function(opts) {
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
      ctx.strokeStyle = 'rgba(255, 255, 255, 0)';
    }
    ctx.lineWidth = savedLineWidth;
    return true;
  }
};

applabCommands.penUp = function(opts) {
  var ctx = applabTurtle.getTurtleContext();
  if (ctx) {
    if (ctx.strokeStyle !== 'rgba(255, 255, 255, 0)') {
      Applab.turtle.penUpColor = ctx.strokeStyle;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0)';
    }
  }
};

applabCommands.penDown = function(opts) {
  var ctx = applabTurtle.getTurtleContext();
  if (ctx && Applab.turtle.penUpColor) {
    ctx.strokeStyle = Applab.turtle.penUpColor;
    delete Applab.turtle.penUpColor;
  }
};

applabCommands.penWidth = function(opts) {
  apiValidateTypeAndRange(
    opts,
    'penWidth',
    'width',
    opts.width,
    'number',
    0.0001
  );
  var ctx = applabTurtle.getTurtleContext();
  if (ctx) {
    ctx.lineWidth = opts.width;
  }
};

applabCommands.penColorInternal = function(rgbstring) {
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

applabCommands.penColor = function(opts) {
  apiValidateType(opts, 'penColor', 'color', opts.color, 'color');
  applabCommands.penColorInternal(opts.color);
};

applabCommands.penRGB = function(opts) {
  // PARAMNAME: penRGB: red vs. r
  // PARAMNAME: penRGB: green vs. g
  // PARAMNAME: penRGB: blue vs. b
  apiValidateTypeAndRange(opts, 'penRGB', 'r', opts.r, 'number', 0, 255);
  apiValidateTypeAndRange(opts, 'penRGB', 'g', opts.g, 'number', 0, 255);
  apiValidateTypeAndRange(opts, 'penRGB', 'b', opts.b, 'number', 0, 255);
  apiValidateTypeAndRange(
    opts,
    'penRGB',
    'a',
    opts.a,
    'number',
    0,
    1,
    OPTIONAL
  );
  var alpha = typeof opts.a === 'undefined' ? 1 : opts.a;
  var rgbstring =
    'rgba(' + opts.r + ',' + opts.g + ',' + opts.b + ',' + alpha + ')';
  applabCommands.penColorInternal(rgbstring);
};

applabCommands.speed = function(opts) {
  // DOCBUG: range is 0-100, not 1-100
  apiValidateTypeAndRange(
    opts,
    'speed',
    'value',
    opts.percent,
    'number',
    0,
    100
  );
  if (opts.percent >= 0 && opts.percent <= 100) {
    Applab.setStepSpeed(opts.percent / 100);
  }
};

applabCommands.createCanvas = function(opts) {
  // PARAMNAME: createCanvas: id vs. canvasId
  apiValidateDomIdExistence(
    opts,
    'createCanvas',
    'canvasId',
    opts.elementId,
    false
  );
  apiValidateType(opts, 'createCanvas', 'width', width, 'number', OPTIONAL);
  apiValidateType(opts, 'createCanvas', 'height', height, 'number', OPTIONAL);

  var newElement = document.createElement('canvas');
  var ctx = newElement.getContext('2d');
  if (newElement && ctx) {
    newElement.id = opts.elementId;
    // default width/height if params are missing
    var width = opts.width || Applab.appWidth;
    var height = opts.height || Applab.footerlessAppHeight;
    newElement.width = width;
    newElement.height = height;
    newElement.setAttribute('width', width + 'px');
    newElement.setAttribute('height', height + 'px');
    // Unlike other elements, we use absolute position, otherwise our z-index
    // doesn't work
    newElement.style.position = 'absolute';
    if (!opts.turtleCanvas) {
      // set transparent fill by default (unless it is the turtle canvas):
      ctx.fillStyle = 'rgba(255, 255, 255, 0)';
    }
    ctx.lineCap = 'round';

    if (!Applab.activeCanvas && !opts.turtleCanvas) {
      // If there is no active canvas and this isn't the turtleCanvas,
      // we'll make this the active canvas for subsequent API calls:
      Applab.activeCanvas = newElement;
    }

    return Boolean(Applab.activeScreen().appendChild(newElement));
  }
  return false;
};

applabCommands.setActiveCanvas = function(opts) {
  var divApplab = document.getElementById('divApplab');
  // PARAMNAME: setActiveCanvas: id vs. canvasId
  apiValidateDomIdExistence(
    opts,
    'setActiveCanvas',
    'canvasId',
    opts.elementId,
    true
  );
  var canvas = document.getElementById(opts.elementId);
  if (divApplab.contains(canvas)) {
    Applab.activeCanvas = canvas;
    return true;
  }
  return false;
};

applabCommands.line = function(opts) {
  apiValidateActiveCanvas(opts, 'line');
  apiValidateType(opts, 'line', 'x1', opts.x1, 'number');
  apiValidateType(opts, 'line', 'x2', opts.x2, 'number');
  apiValidateType(opts, 'line', 'y1', opts.y1, 'number');
  apiValidateType(opts, 'line', 'y2', opts.y2, 'number');
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext('2d');
  if (ctx) {
    ctx.beginPath();
    ctx.moveTo(opts.x1, opts.y1);
    ctx.lineTo(opts.x2, opts.y2);
    ctx.stroke();
    return true;
  }
  return false;
};

applabCommands.circle = function(opts) {
  apiValidateActiveCanvas(opts, 'circle');
  // PARAMNAME: circle: centerX vs. x
  // PARAMNAME: circle: centerY vs. y
  apiValidateType(opts, 'circle', 'centerX', opts.x, 'number');
  apiValidateType(opts, 'circle', 'centerY', opts.y, 'number');
  apiValidateType(opts, 'circle', 'radius', opts.radius, 'number');
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext('2d');
  if (ctx) {
    ctx.beginPath();
    ctx.arc(opts.x, opts.y, opts.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    return true;
  }
  return false;
};

applabCommands.rect = function(opts) {
  apiValidateActiveCanvas(opts, 'rect');
  // PARAMNAME: rect: upperLeftX vs. x
  // PARAMNAME: rect: upperLeftY vs. y
  apiValidateType(opts, 'rect', 'upperLeftX', opts.x, 'number');
  apiValidateType(opts, 'rect', 'upperLeftY', opts.y, 'number');
  apiValidateType(opts, 'rect', 'width', opts.width, 'number');
  apiValidateType(opts, 'rect', 'height', opts.height, 'number');
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext('2d');
  if (ctx) {
    ctx.beginPath();
    ctx.rect(opts.x, opts.y, opts.width, opts.height);
    ctx.fill();
    ctx.stroke();
    return true;
  }
  return false;
};

applabCommands.setStrokeWidth = function(opts) {
  apiValidateActiveCanvas(opts, 'setStrokeWidth');
  apiValidateTypeAndRange(
    opts,
    'setStrokeWidth',
    'width',
    opts.width,
    'number',
    0.0001
  );
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext('2d');
  if (ctx) {
    ctx.lineWidth = opts.width;
    return true;
  }
  return false;
};

// Returns an rbg or rgba color string that can be used as a parameter to other functions.
applabCommands.rgb = function(opts) {
  apiValidateTypeAndRange(opts, 'rgb', 'number', opts.r, 'number');
  apiValidateTypeAndRange(opts, 'rgb', 'number', opts.g, 'number');
  apiValidateTypeAndRange(opts, 'rgb', 'number', opts.b, 'number');
  apiValidateTypeAndRange(
    opts,
    'rgb',
    'number',
    opts.a,
    'number',
    0,
    1,
    OPTIONAL
  );

  // Convert any decimal values into integers between 0 and 255
  opts.r = Math.min(255, Math.max(0, Math.round(opts.r)));
  opts.g = Math.min(255, Math.max(0, Math.round(opts.g)));
  opts.b = Math.min(255, Math.max(0, Math.round(opts.b)));
  const alpha = typeof opts.a === 'undefined' ? 1 : opts.a;
  return `rgba(${opts.r}, ${opts.g}, ${opts.b}, ${alpha})`;
};

applabCommands.setStrokeColor = function(opts) {
  apiValidateActiveCanvas(opts, 'setStrokeColor');
  apiValidateType(opts, 'setStrokeColor', 'color', opts.color, 'color');
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext('2d');
  if (ctx) {
    ctx.strokeStyle = String(opts.color);
    return true;
  }
  return false;
};

applabCommands.setFillColor = function(opts) {
  apiValidateActiveCanvas(opts, 'setFillColor');
  apiValidateType(opts, 'setFillColor', 'color', opts.color, 'color');
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = String(opts.color);
    return true;
  }
  return false;
};

applabCommands.clearCanvas = function(opts) {
  apiValidateActiveCanvas(opts, 'clearCanvas');
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, Applab.activeCanvas.width, Applab.activeCanvas.height);
    return true;
  }
  return false;
};

/**
 * Semi-deprecated. We still support this API, but no longer expose it in the
 * toolbox. Replaced by drawImageURL
 */
applabCommands.drawImage = function(opts) {
  var divApplab = document.getElementById('divApplab');
  // PARAMNAME: drawImage: imageId vs. id
  apiValidateActiveCanvas(opts, 'drawImage');
  apiValidateDomIdExistence(opts, 'drawImage', 'id', opts.imageId, true);
  apiValidateType(opts, 'drawImage', 'x', opts.x, 'number');
  apiValidateType(opts, 'drawImage', 'y', opts.y, 'number');
  var image = document.getElementById(opts.imageId);
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext('2d');
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

/**
 * We support a couple different version of this API
 * drawImageURL(url, [callback])
 * drawImageURL(url, x, y, width, height, [callback])
 */
applabCommands.drawImageURL = function(opts) {
  apiValidateActiveCanvas(opts, 'drawImageURL');
  apiValidateType(opts, 'drawImageURL', 'url', opts.url, 'string');
  apiValidateType(opts, 'drawImageURL', 'x', opts.x, 'number', OPTIONAL);
  apiValidateType(opts, 'drawImageURL', 'y', opts.y, 'number', OPTIONAL);
  apiValidateType(
    opts,
    'drawImageURL',
    'width',
    opts.width,
    'number',
    OPTIONAL
  );
  apiValidateType(
    opts,
    'drawImageURL',
    'height',
    opts.height,
    'number',
    OPTIONAL
  );
  apiValidateType(
    opts,
    'drawImageURL',
    'callback',
    opts.callback,
    'function',
    OPTIONAL
  );

  var callback = function(success) {
    if (typeof opts.callback === 'function') {
      opts.callback.call(null, success);
    }
  };

  var image = new Image();
  image.src = assetPrefix.fixPath(opts.url);
  image.onload = function() {
    var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext('2d');
    if (!ctx) {
      return;
    }
    var x = utils.valueOr(opts.x, 0);
    var y = utils.valueOr(opts.y, 0);

    // if given a width/height use that
    var renderWidth = utils.valueOr(opts.width, image.width);
    var renderHeight = utils.valueOr(opts.height, image.height);

    // if undefined, extra width/height from image and potentially resize to
    // fit
    if (opts.width === undefined || opts.height === undefined) {
      var aspectRatio = image.width / image.height;
      if (aspectRatio > 1) {
        renderWidth = Math.min(Applab.activeCanvas.width, image.width);
        renderHeight = renderWidth / aspectRatio;
      } else {
        renderHeight = Math.min(Applab.activeCanvas.height, image.height);
        renderWidth = renderHeight * aspectRatio;
      }
    }

    ctx.save();
    ctx.setTransform(
      renderWidth / image.width,
      0,
      0,
      renderHeight / image.height,
      x,
      y
    );
    ctx.drawImage(image, 0, 0);
    ctx.restore();

    callback(true);
  };
  image.onerror = function() {
    callback(false);
  };
};

applabCommands.getImageData = function(opts) {
  apiValidateActiveCanvas(opts, 'getImageData');
  // PARAMNAME: getImageData: all params + doc bugs
  apiValidateType(opts, 'getImageData', 'x', opts.x, 'number');
  apiValidateType(opts, 'getImageData', 'y', opts.y, 'number');
  apiValidateType(opts, 'getImageData', 'width', opts.width, 'number');
  apiValidateType(opts, 'getImageData', 'height', opts.height, 'number');
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext('2d');
  if (ctx) {
    return ctx.getImageData(opts.x, opts.y, opts.width, opts.height);
  }
};

applabCommands.putImageData = function(opts) {
  apiValidateActiveCanvas(opts, 'putImageData');
  // PARAMNAME: putImageData: imageData vs. imgData
  // PARAMNAME: putImageData: startX vs. x
  // PARAMNAME: putImageData: startY vs. y
  apiValidateType(opts, 'putImageData', 'imgData', opts.imageData, 'object');
  apiValidateType(opts, 'putImageData', 'x', opts.x, 'number');
  apiValidateType(opts, 'putImageData', 'y', opts.y, 'number');
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext('2d');
  if (ctx) {
    // Create tmpImageData and initialize it because opts.imageData is not
    // going to be a real ImageData object if it came from the interpreter
    var tmpImageData = ctx.createImageData(
      opts.imageData.width,
      opts.imageData.height
    );
    tmpImageData.data.set(opts.imageData.data);
    return ctx.putImageData(tmpImageData, opts.x, opts.y);
  }
};

applabCommands.textInput = function(opts) {
  // PARAMNAME: textInput: id vs. inputId
  apiValidateDomIdExistence(opts, 'textInput', 'id', opts.elementId, false);
  apiValidateType(opts, 'textInput', 'text', opts.text, 'uistring');

  var newInput = document.createElement('input');
  newInput.value = opts.text;
  newInput.id = opts.elementId;
  newInput.style.position = 'relative';
  newInput.style.height = '30px';
  newInput.style.width = '200px';
  newInput.style.borderStyle = 'solid';
  elementLibrary.setAllPropertiesToCurrentTheme(
    newInput,
    Applab.activeScreen()
  );

  return Boolean(Applab.activeScreen().appendChild(newInput));
};

applabCommands.textLabel = function(opts) {
  // PARAMNAME: textLabel: id vs. labelId
  apiValidateDomIdExistence(opts, 'textLabel', 'id', opts.elementId, false);
  apiValidateType(opts, 'textLabel', 'text', opts.text, 'uistring');
  if (typeof opts.forId !== 'undefined') {
    apiValidateDomIdExistence(opts, 'textLabel', 'forId', opts.forId, true);
  }

  var newLabel = document.createElement('label');
  var textNode = document.createTextNode(opts.text);
  newLabel.id = opts.elementId;
  newLabel.style.position = 'relative';
  newLabel.style.borderStyle = 'solid';
  // Set optimizeSpeed to ensure better text size consistency between Safari and Chrome
  newLabel.style.textRendering = 'optimizeSpeed';
  elementLibrary.setAllPropertiesToCurrentTheme(
    newLabel,
    Applab.activeScreen()
  );
  var forElement = document.getElementById(opts.forId);
  if (forElement && Applab.activeScreen().contains(forElement)) {
    newLabel.setAttribute('for', opts.forId);
  }

  return Boolean(
    newLabel.appendChild(textNode) &&
      Applab.activeScreen().appendChild(newLabel)
  );
};

applabCommands.checkbox = function(opts) {
  // PARAMNAME: checkbox: id vs. checkboxId
  apiValidateDomIdExistence(opts, 'checkbox', 'id', opts.elementId, false);
  // apiValidateType(opts, 'checkbox', 'checked', opts.checked, 'boolean');

  var newCheckbox = document.createElement('input');
  newCheckbox.setAttribute('type', 'checkbox');
  newCheckbox.checked = opts.checked;
  newCheckbox.id = opts.elementId;
  newCheckbox.style.position = 'relative';

  return Boolean(Applab.activeScreen().appendChild(newCheckbox));
};

applabCommands.radioButton = function(opts) {
  apiValidateDomIdExistence(opts, 'radioButton', 'id', opts.elementId, false);
  // apiValidateType(opts, 'radioButton', 'checked', opts.checked, 'boolean');
  apiValidateType(opts, 'radioButton', 'group', opts.name, 'string', OPTIONAL);

  var newRadio = document.createElement('input');
  newRadio.setAttribute('type', 'radio');
  newRadio.name = opts.name;
  newRadio.checked = opts.checked;
  newRadio.id = opts.elementId;
  newRadio.style.position = 'relative';

  return Boolean(Applab.activeScreen().appendChild(newRadio));
};

applabCommands.dropdown = function(opts) {
  // PARAMNAME: dropdown: id vs. dropdownId
  apiValidateDomIdExistence(opts, 'dropdown', 'id', opts.elementId, false);

  var newSelect = document.createElement('select');

  if (opts.optionsArray) {
    for (var i = 0; i < opts.optionsArray.length; i++) {
      var option = document.createElement('option');
      apiValidateType(
        opts,
        'dropdown',
        'option_' + (i + 1),
        opts.optionsArray[i],
        'uistring'
      );
      option.text = opts.optionsArray[i];
      newSelect.add(option);
    }
  }
  newSelect.id = opts.elementId;
  newSelect.style.position = 'relative';
  newSelect.style.borderStyle = 'solid';
  elementLibrary.setAllPropertiesToCurrentTheme(
    newSelect,
    Applab.activeScreen()
  );

  return Boolean(Applab.activeScreen().appendChild(newSelect));
};

applabCommands.getAttribute = function(opts) {
  var divApplab = document.getElementById('divApplab');
  var element = document.getElementById(opts.elementId);
  var attribute = String(opts.attribute);
  return divApplab.contains(element) ? String(element[attribute]) : false;
};

// Allowlist of HTML Element attributes which can be modified, to
// prevent DOM manipulation which would violate the sandbox.
var MUTABLE_ATTRIBUTES = ['scrollTop'];

applabCommands.setAttribute = function(opts) {
  var divApplab = document.getElementById('divApplab');
  var element = document.getElementById(opts.elementId);
  var attribute = String(opts.attribute);
  if (
    divApplab.contains(element) &&
    MUTABLE_ATTRIBUTES.indexOf(attribute) !== -1
  ) {
    element[attribute] = opts.value;
    return true;
  }
  return false;
};

applabCommands.setSelectionRange = function(opts) {
  const {elementId, selectionStart, selectionEnd, selectionDirection} = opts;

  apiValidateDomIdExistence(
    opts,
    'setSelectionRange',
    'elementId',
    elementId,
    true
  );
  apiValidateType(opts, 'setSelectionRange', 'start', selectionStart, 'number');
  apiValidateType(opts, 'setSelectionRange', 'end', selectionEnd, 'number');
  apiValidateType(
    opts,
    'setSelectionRange',
    'direction',
    selectionDirection,
    'string',
    OPTIONAL
  );

  const divApplab = document.getElementById('divApplab');
  const element = document.getElementById(elementId);
  if (divApplab.contains(element)) {
    element.setSelectionRange(selectionStart, selectionEnd, selectionDirection);
    return true;
  }
  return false;
};

applabCommands.getText = function(opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(opts, 'getText', 'id', opts.elementId, true);

  var element = document.getElementById(opts.elementId);
  if (divApplab.contains(element)) {
    if (element.tagName === 'INPUT' || element.tagName === 'SELECT') {
      return String(element.value);
    } else if (element.tagName === 'IMG') {
      return String(element.alt);
    } else {
      return applabCommands.getElementInnerText_(element);
    }
  }
  return false;
};

applabCommands.setText = function(opts) {
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
      applabCommands.setElementInnerText_(element, opts.text);
    }
    return true;
  }
  return false;
};

applabCommands.getNumber = function(opts) {
  apiValidateDomIdExistence(opts, 'getNumber', 'id', opts.elementId, true);
  return parseFloat(applabCommands.getText(opts), 10);
};

applabCommands.setNumber = function(opts) {
  apiValidateDomIdExistence(opts, 'setNumber', 'id', opts.elementId, true);
  apiValidateType(opts, 'setNumber', 'value', opts.number, 'number');
  opts.text = opts.number;
  return applabCommands.setText(opts);
};

/**
 * Attempts to emulate Chrome's version of innerText by way of innerHTML, only
 * for the simplified case of plain text content (in, for example, a
 * contentEditable div).
 * @param {Element} element
 * @private
 */
applabCommands.getElementInnerText_ = function(element) {
  return utils.unescapeText(element.innerHTML);
};

/**
 * Attempts to emulate Chrome's version of innerText by way of innerHTML, only
 * for the simplified case of plain text content (in, for example, a
 * contentEditable div).
 * @param {Element} element
 * @param {string} newText
 * @private
 */
applabCommands.setElementInnerText_ = function(element, newText) {
  element.innerHTML = utils.escapeText(newText.toString());
};

applabCommands.getChecked = function(opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(opts, 'getChecked', 'id', opts.elementId, true);

  var element = document.getElementById(opts.elementId);
  if (divApplab.contains(element) && element.tagName === 'INPUT') {
    return element.checked;
  }
  return false;
};

applabCommands.setChecked = function(opts) {
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

applabCommands.getImageURL = function(opts) {
  var divApplab = document.getElementById('divApplab');
  // PARAMNAME: getImageURL: id vs. imageId
  apiValidateDomIdExistence(opts, 'getImageURL', 'id', opts.elementId, true);

  var element = document.getElementById(opts.elementId);
  if (divApplab.contains(element)) {
    // We return a URL if it is an IMG element or our special img-upload label
    if (element.tagName === 'IMG') {
      return element.getAttribute('data-canonical-image-url');
    } else if (
      element.tagName === 'LABEL' &&
      $(element).hasClass('img-upload')
    ) {
      var fileObj = element.children[0].files[0];
      if (fileObj) {
        return window.URL.createObjectURL(fileObj);
      }
    }
  }
};

applabCommands.setImageURL = function(opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(opts, 'setImageURL', 'id', opts.elementId, true);
  apiValidateType(opts, 'setImageURL', 'url', opts.src, 'string');

  var element = document.getElementById(opts.elementId);
  if (divApplab.contains(element) && element.tagName === 'IMG') {
    if (ICON_PREFIX_REGEX.test(opts.src)) {
      element.src = assetPrefix.renderIconToString(opts.src, element);
    } else {
      element.src = assetPrefix.fixPath(opts.src);
    }
    element.setAttribute('data-canonical-image-url', opts.src);

    if (!toBeCached[element.src]) {
      var img = new Image();
      img.src = element.src;
      toBeCached[element.src] = true;
    }

    return true;
  }
  return false;
};

applabCommands.innerHTML = function(opts) {
  var divApplab = document.getElementById('divApplab');
  var div = document.getElementById(opts.elementId);
  if (divApplab.contains(div)) {
    div.innerHTML = sanitizeHtml(
      opts.html,
      reportUnsafeHtml,
      false,
      true /* rejectExistingIds */
    );
    return true;
  }
  return false;
};

applabCommands.deleteElement = function(opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(opts, 'deleteElement', 'id', opts.elementId, true);

  var div = document.getElementById(opts.elementId);
  if (divApplab.contains(div)) {
    // Special check to see if the active canvas is being deleted
    if (div === Applab.activeCanvas || div.contains(Applab.activeCanvas)) {
      delete Applab.activeCanvas;
    }
    return Boolean(div.parentElement.removeChild(div));
  }
  return false;
};

applabCommands.showElement = function(opts) {
  return applabCommands.setProperty({
    elementId: opts.elementId,
    property: 'hidden',
    value: false
  });
};

applabCommands.hideElement = function(opts) {
  return applabCommands.setProperty({
    elementId: opts.elementId,
    property: 'hidden',
    value: true
  });
};

applabCommands.setStyle = function(opts) {
  var divApplab = document.getElementById('divApplab');
  var div = document.getElementById(opts.elementId);
  if (divApplab.contains(div)) {
    div.style.cssText += opts.style;
    return true;
  }
  return false;
};

applabCommands.setParent = function(opts) {
  var divApplab = document.getElementById('divApplab');
  var div = document.getElementById(opts.elementId);
  var divNewParent = document.getElementById(opts.parentId);
  if (divApplab.contains(div) && divApplab.contains(divNewParent)) {
    return Boolean(
      div.parentElement.removeChild(div) && divNewParent.appendChild(div)
    );
  }
  return false;
};

applabCommands.setPosition = function(opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(opts, 'setPosition', 'id', opts.elementId, true);
  apiValidateType(opts, 'setPosition', 'x', opts.left, 'number');
  apiValidateType(opts, 'setPosition', 'y', opts.top, 'number');

  var el = document.getElementById(opts.elementId);
  if (divApplab.contains(el)) {
    el.style.position = 'absolute';
    el.style.left = opts.left + 'px';
    el.style.top = opts.top + 'px';
    el.style.margin = 0;

    // if we have a width and/or height given, validate args and setSize
    if (opts.width !== undefined || opts.height !== undefined) {
      apiValidateType(
        opts,
        'setPosition',
        'width',
        opts.width,
        'number',
        OPTIONAL
      );
      apiValidateType(
        opts,
        'setPosition',
        'height',
        opts.height,
        'number',
        OPTIONAL
      );
      setSize_(opts.elementId, opts.width, opts.height);
    }
    return true;
  }
  return false;
};

applabCommands.setSize = function(opts) {
  apiValidateType(opts, 'setSize', 'width', opts.width, 'number');
  apiValidateType(opts, 'setSize', 'height', opts.height, 'number');
  setSize_(opts.elementId, opts.width, opts.height);

  return true;
};

/**
 * Logic shared between setPosition and setSize for setting the size
 */
function setSize_(elementId, width, height) {
  var element = document.getElementById(elementId);
  var divApplab = document.getElementById('divApplab');
  if (divApplab.contains(element)) {
    element.style.width = width + 'px';
    element.style.height = height + 'px';
  }
}

function invalidIdMessage(functionName, variableName, id, message) {
  return `The ${functionName}() ${variableName} parameter refers to an id ("${id}") which ${message}`;
}

applabCommands.setProperty = function(opts) {
  apiValidateDomIdExistence(
    opts,
    'setProperty',
    'id',
    opts.elementId,
    true,
    exists => {
      var idExistsMessage = exists ? 'already exists.' : 'does not exist.';
      var warningMessage = `${idExistsMessage} You should be able to find the list of all the possible ids in the dropdown (unless you created the element inside your code).`;
      outputWarning(
        invalidIdMessage('setProperty', 'id', opts.elementId, warningMessage)
      );
      return true;
    }
  );
  apiValidateType(opts, 'setProperty', 'property', opts.property, 'string');

  var elementId = opts.elementId;
  var property = opts.property;
  var value = opts.value;

  var element = document.getElementById(elementId);
  if (!element) {
    return;
  }

  var info = setPropertyDropdown.getInternalPropertyInfo(element, property);
  if (!info) {
    outputError(
      'There is no property named "' +
        property +
        '" for element "' +
        elementId +
        '". Make sure you choose a property from the dropdown.'
    );
    return;
  }

  var valid = apiValidateType(
    opts,
    'setProperty',
    'value',
    opts.value,
    info.type
  );
  if (!valid) {
    return;
  }

  Applab.updateProperty(element, info.internalName, value);
};

applabCommands.getProperty = function(opts) {
  apiValidateDomIdExistence(opts, 'getProperty', 'id', opts.elementId, true);
  apiValidateType(opts, 'getProperty', 'property', opts.property, 'string');

  const elementId = opts.elementId;
  const property = opts.property;

  const element = document.getElementById(elementId);
  if (!element) {
    return;
  }

  const info = setPropertyDropdown.getInternalPropertyInfo(element, property);
  if (!info) {
    outputError(`Cannot get property "${property}" on element "${elementId}".`);
    return;
  }

  return Applab.readProperty(element, info.internalName);
};

applabCommands.getXPosition = function(opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(opts, 'getXPosition', 'id', opts.elementId, true);

  var div = document.getElementById(opts.elementId);
  if (divApplab.contains(div)) {
    var x = div.offsetLeft;
    while (div && div !== divApplab) {
      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent
      // This property will return null on Webkit if the element is hidden
      // (the style.display of this element or any ancestor is "none") or if the
      // style.position of the element itself is set to "fixed".
      // This property will return null on Internet Explorer (9) if the
      // style.position of the element itself is set to "fixed".
      // (Having display:none does not affect this browser.)
      div = div.offsetParent;
      if (div) {
        x += div.offsetLeft;
      }
    }
    return x;
  }
  return 0;
};

applabCommands.getYPosition = function(opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(opts, 'getYPosition', 'id', opts.elementId, true);

  var div = document.getElementById(opts.elementId);
  if (divApplab.contains(div)) {
    var y = div.offsetTop;
    while (div && div !== divApplab) {
      div = div.offsetParent;
      if (div) {
        y += div.offsetTop;
      }
    }
    return y;
  }
  return 0;
};

applabCommands.onEventFired = function(opts, e) {
  var funcArgs = opts.extraArgs;
  if (typeof e !== 'undefined') {
    eventSandboxer.setTransformFromElement(
      document.getElementById('divApplab')
    );
    var applabEvent = eventSandboxer.sandboxEvent(e);

    // Push a function call on the queue with an array of arguments consisting
    // of the applabEvent parameter (and any extraArgs originally supplied)
    funcArgs = [applabEvent].concat(opts.extraArgs);
  }
  // Call the callback function:
  return opts.func.apply(null, funcArgs);
};

applabCommands.onEvent = function(opts) {
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
    var elementType = elementLibrary.getElementType(domElement);
    if (
      (elementType === elementLibrary.ElementType.TEXT_INPUT ||
        elementType === elementLibrary.ElementType.TEXT_AREA) &&
      opts.eventName === 'change'
    ) {
      // contentEditable divs don't generate a change event, and change events
      // on text inputs behave differently across browsers, so synthesize a
      // change event here.
      var callback = applabCommands.onEventFired.bind(this, opts);
      ChangeEventHandler.addChangeEventHandler(domElement, callback);
      return true;
    }
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
          applabCommands.onEventFired.bind(this, opts)
        );

        // Touch events will be mapped to mouse events in the EventSandboxer
        if (opts.eventName === 'mousedown') {
          domElement.addEventListener(
            'touchstart',
            applabCommands.onEventFired.bind(this, opts)
          );
        }
        if (opts.eventName === 'mouseup') {
          domElement.addEventListener(
            'touchend',
            applabCommands.onEventFired.bind(this, opts)
          );
        }
        // To allow INPUT type="range" (Slider) events to work on downlevel browsers, we need to
        // register a 'change' listener whenever an 'input' listner is requested.  Downlevel
        // browsers typically only sent 'change' events.
        if (
          opts.eventName === 'input' &&
          domElement.tagName.toUpperCase() === 'INPUT' &&
          domElement.type === 'range'
        ) {
          domElement.addEventListener(
            'change',
            applabCommands.onEventFired.bind(this, opts)
          );
        }
        break;
      case 'mousemove':
        domElement.addEventListener(
          opts.eventName,
          applabCommands.onEventFired.bind(this, opts)
        );
        // Touch events will be mapped to mouse events in the EventSandboxer
        domElement.addEventListener(
          'touchmove',
          applabCommands.onEventFired.bind(this, opts)
        );
        // Additional handler needed to ensure correct calculation of
        // movementX and movementY.
        domElement.addEventListener(
          'mouseout',
          eventSandboxer.clearLastMouseMoveEvent.bind(eventSandboxer)
        );
        break;
      default:
        return false;
    }
    return true;
  }
  return false;
};

function filterUrl(urlToCheck) {
  $.ajax({
    url: '/safe_browsing/',
    method: 'POST',
    contentType: 'application/json',
    dataType: 'json',
    data: JSON.stringify({url: urlToCheck})
  })
    .success(data => {
      let response = data['approved']
        ? REDIRECT_RESPONSE.APPROVED
        : REDIRECT_RESPONSE.REJECTED;
      getStore().dispatch(actions.addRedirectNotice(response, urlToCheck));
    })
    .fail((jqXhr, status) => {
      // When this query fails, default to the dialog that allows the user to choose
      getStore().dispatch(
        actions.addRedirectNotice(REDIRECT_RESPONSE.APPROVED, urlToCheck)
      );
    });
}

applabCommands.openUrl = function(opts) {
  if (apiValidateType(opts, 'openUrl', 'url', opts.url, 'string')) {
    // Studio and code.org links are immediately opened, other links are filtered
    // Remove protocol from url string if present
    let hostname = opts.url;
    let protocols = ['https://', 'http://', 'www.'];
    protocols.forEach(protocol => {
      if (hostname.startsWith(protocol)) {
        hostname = hostname.slice(protocol.length);
      }
    });
    if (
      hostname.startsWith('studio.code.org') ||
      hostname.startsWith('code.org')
    ) {
      if (opts.url.startsWith('http')) {
        window.open(opts.url);
      } else {
        // If url doesn't have a protocol, add one
        window.open('https://' + opts.url);
      }
    } else if (hostname.startsWith('mailto')) {
      getStore().dispatch(
        actions.addRedirectNotice(REDIRECT_RESPONSE.UNSUPPORTED, opts.url)
      );
    } else {
      filterUrl(opts.url);
    }
  }
};

applabCommands.onHttpRequestEvent = function(opts) {
  if (this.readyState === 4) {
    // Call the callback function:
    opts.func.call(
      null,
      Number(this.status),
      String(this.getResponseHeader('content-type')),
      String(this.responseText)
    );
  }
};

/**
 * Log the hostname and url to New Relic as a StartWebRequest event.
 * @param {string} url
 */
function logWebRequest(url) {
  var a = document.createElement('a');
  a.href = url;
  var hostname = a.hostname;

  logToCloud.addPageAction(logToCloud.PageAction.StartWebRequest, {
    hostname: hostname,
    url: url
  });
}

applabCommands.startWebRequest = function(opts) {
  apiValidateType(opts, 'startWebRequest', 'url', opts.url, 'string');
  apiValidateType(opts, 'startWebRequest', 'callback', opts.func, 'function');
  apiValidateType(
    opts,
    'startWebRequest',
    'headers',
    opts.headers,
    'object',
    OPTIONAL
  );
  logWebRequest(opts.url);
  var req = new XMLHttpRequest();
  req.onreadystatechange = applabCommands.onHttpRequestEvent.bind(req, opts);
  if (!Applab.channelId) {
    // In the unlikely event that the rest of App Lab hasn't broken in the absence
    // of a channel id, let the user know its out fault that startWebRequest is failing.
    throw new Error(
      'Internal error: A channel id is required to execute startWebRequest.'
    );
  }
  var url =
    XHR_PROXY_PATH +
    '?u=' +
    encodeURIComponent(opts.url) +
    '&c=' +
    encodeURIComponent(Applab.channelId);
  const {isExported} = getAppOptions() || {};
  req.open('GET', isExported ? opts.url : url, true);
  const headers = opts.headers || {};
  Object.keys(headers).forEach(key => {
    if (AllowedWebRequestHeaders.includes(key)) {
      req.setRequestHeader(key, headers[key]);
    }
  });
  req.send();
};

applabCommands.startWebRequestSync = function(opts) {
  applabCommands.startWebRequest({
    ...opts,
    func: (status, contentType, responseText) => {
      opts.func(responseText);
    }
  });
};

applabCommands.createRecord = function(opts) {
  // PARAMNAME: createRecord: table vs. tableName
  // PARAMNAME: createRecord: callback vs. callbackFunction
  apiValidateType(opts, 'createRecord', 'table', opts.table, 'string');
  var validRecord = apiValidateType(
    opts,
    'createRecord',
    'record',
    opts.record,
    'record'
  );
  apiValidateType(
    opts,
    'createRecord',
    'callback',
    opts.onSuccess,
    'function',
    OPTIONAL
  );
  apiValidateType(
    opts,
    'createRecord',
    'onError',
    opts.onError,
    'function',
    OPTIONAL
  );
  if (!validRecord) {
    return;
  }
  if (!opts.table) {
    outputError('missing required parameter "tableName"');
    return;
  }
  if (opts.record.id) {
    outputError('record must not have an "id" property');
    return;
  }
  var onSuccess = applabCommands.handleCreateRecord.bind(this, opts);
  var onError = opts.onError || getAsyncOutputWarning();
  Applab.storage.createRecord(opts.table, opts.record, onSuccess, onError);
};

applabCommands.handleCreateRecord = function(opts, record) {
  if (opts.onSuccess) {
    opts.onSuccess.call(null, record);
  }
};

applabCommands.getKeyValue = function(opts) {
  // PARAMNAME: getKeyValue: callback vs. callbackFunction
  apiValidateType(opts, 'getKeyValue', 'key', opts.key, 'string');
  apiValidateType(opts, 'getKeyValue', 'callback', opts.onSuccess, 'function');
  apiValidateType(
    opts,
    'getKeyValue',
    'onError',
    opts.onError,
    'function',
    OPTIONAL
  );
  var onSuccess = applabCommands.handleReadValue.bind(this, opts);
  var onError = opts.onError || getAsyncOutputWarning();
  Applab.storage.getKeyValue(opts.key, onSuccess, onError);
};

applabCommands.handleReadValue = function(opts, value) {
  if (opts.onSuccess) {
    opts.onSuccess.call(null, value);
  }
};

applabCommands.getKeyValueSync = function(opts) {
  apiValidateType(opts, 'getKeyValueSync', 'key', opts.key, 'string');
  var onSuccess = handleGetKeyValueSync.bind(this, opts);
  var onError = handleGetKeyValueSyncError.bind(this, opts);
  Applab.storage.getKeyValue(opts.key, onSuccess, onError);
};

var handleGetKeyValueSync = function(opts, value) {
  opts.callback(value);
};

var handleGetKeyValueSyncError = function(opts, message) {
  // Call callback with no value parameter (sync func will return undefined)
  opts.callback();
  outputWarning(message);
};

applabCommands.setKeyValue = function(opts) {
  // PARAMNAME: setKeyValue: callback vs. callbackFunction
  apiValidateType(opts, 'setKeyValue', 'key', opts.key, 'string');
  apiValidateType(opts, 'setKeyValue', 'value', opts.value, 'primitive');
  apiValidateType(
    opts,
    'setKeyValue',
    'callback',
    opts.onSuccess,
    'function',
    OPTIONAL
  );
  apiValidateType(
    opts,
    'setKeyValue',
    'onError',
    opts.onError,
    'function',
    OPTIONAL
  );
  var onSuccess = applabCommands.handleSetKeyValue.bind(this, opts);
  var onError = opts.onError || getAsyncOutputWarning();
  Applab.storage.setKeyValue(opts.key, opts.value, onSuccess, onError);
};

applabCommands.handleSetKeyValue = function(opts) {
  if (opts.onSuccess) {
    opts.onSuccess.call(null);
  }
};

applabCommands.setKeyValueSync = function(opts) {
  apiValidateType(opts, 'setKeyValueSync', 'key', opts.key, 'string');
  apiValidateType(opts, 'setKeyValueSync', 'value', opts.value, 'primitive');
  var onSuccess = handleSetKeyValueSync.bind(this, opts);
  var onError = handleSetKeyValueSyncError.bind(this, opts);
  Applab.storage.setKeyValue(opts.key, opts.value, onSuccess, onError);
};

var handleSetKeyValueSync = function(opts) {
  // Return 'true' to indicate the setKeyValueSync succeeded
  opts.callback(true);
};

var handleSetKeyValueSyncError = function(opts, message) {
  // Return 'false' to indicate the setKeyValueSync failed
  opts.callback(false);
  outputWarning(message);
};

applabCommands.getColumn = function(opts) {
  apiValidateType(opts, 'getColumn', 'table', opts.table, 'string');
  apiValidateType(opts, 'getColumn', 'column', opts.column, 'string');

  Applab.storage.readRecords(
    opts.table,
    {},
    handleGetColumn.bind(this, opts),
    handleGetColumnError.bind(this, opts)
  );
};

var handleGetColumn = function(opts, records) {
  let columnList = [];
  let columnName = opts.column;
  let tableName = opts.table;
  if (records === null) {
    outputError(i18n.tableDoesNotExistError({tableName}));
  } else {
    records.forEach(row => columnList.push(row[opts.column]));
    if (columnList.every(element => element === undefined)) {
      outputError(i18n.columnDoesNotExistError({columnName, tableName}));
    }
  }
  opts.callback(columnList);
};

var handleGetColumnError = function(opts, message) {
  opts.callback([]);
  outputWarning(message);
};

applabCommands.readRecords = function(opts) {
  // PARAMNAME: readRecords: table vs. tableName
  // PARAMNAME: readRecords: callback vs. callbackFunction
  // PARAMNAME: readRecords: terms vs. searchTerms
  apiValidateType(opts, 'readRecords', 'table', opts.table, 'string');
  apiValidateType(
    opts,
    'readRecords',
    'searchTerms',
    opts.searchParams,
    'object'
  );
  apiValidateType(opts, 'readRecords', 'callback', opts.onSuccess, 'function');
  apiValidateType(
    opts,
    'readRecords',
    'onError',
    opts.onError,
    'function',
    OPTIONAL
  );
  if (!opts.table) {
    outputError('missing required parameter "tableName"');
    return;
  }
  var onSuccess = applabCommands.handleReadRecords.bind(this, opts);
  var onError = opts.onError || getAsyncOutputWarning();
  Applab.storage.readRecords(opts.table, opts.searchParams, onSuccess, onError);
};

applabCommands.handleReadRecords = function(opts, records) {
  if (records === null) {
    let tableName = opts.table;
    outputError(i18n.tableDoesNotExistError({tableName}));
  }
  if (opts.onSuccess) {
    opts.onSuccess.call(null, records);
  }
};

applabCommands.updateRecord = function(opts) {
  // PARAMNAME: updateRecord: table vs. tableName
  // PARAMNAME: updateRecord: callback vs. callbackFunction
  apiValidateType(opts, 'updateRecord', 'table', opts.table, 'string');
  var validRecord = apiValidateType(
    opts,
    'updateRecord',
    'record',
    opts.record,
    'record'
  );
  apiValidateTypeAndRange(
    opts,
    'updateRecord',
    'record.id',
    opts.record.id,
    'number',
    1,
    Infinity
  );
  apiValidateType(
    opts,
    'updateRecord',
    'callback',
    opts.onComplete,
    'function',
    OPTIONAL
  );
  apiValidateType(
    opts,
    'updateRecord',
    'onError',
    opts.onError,
    'function',
    OPTIONAL
  );
  if (!validRecord) {
    return;
  }
  if (!opts.table) {
    outputError('missing required parameter "tableName"');
    return;
  }
  if (opts.record.id === undefined) {
    outputError('missing required property "id"');
    return;
  }
  var onComplete = applabCommands.handleUpdateRecord.bind(this, opts);
  var onError = opts.onError || getAsyncOutputWarning();
  Applab.storage.updateRecord(opts.table, opts.record, onComplete, onError);
};

applabCommands.handleUpdateRecord = function(opts, record, success) {
  if (opts.onComplete) {
    opts.onComplete.call(null, record, success);
  }
};

applabCommands.deleteRecord = function(opts) {
  // PARAMNAME: deleteRecord: table vs. tableName
  // PARAMNAME: deleteRecord: callback vs. callbackFunction
  apiValidateType(opts, 'deleteRecord', 'table', opts.table, 'string');
  var validRecord = apiValidateType(
    opts,
    'deleteRecord',
    'record',
    opts.record,
    'record'
  );
  apiValidateTypeAndRange(
    opts,
    'deleteRecord',
    'record.id',
    opts.record.id,
    'number',
    1,
    Infinity
  );
  apiValidateType(
    opts,
    'deleteRecord',
    'callback',
    opts.onComplete,
    'function',
    OPTIONAL
  );
  apiValidateType(
    opts,
    'deleteRecord',
    'onError',
    opts.onError,
    'function',
    OPTIONAL
  );
  if (!validRecord) {
    return;
  }
  if (!opts.table) {
    outputError('missing required parameter "tableName"');
    return;
  }
  if (opts.record.id === undefined) {
    outputError('missing required property "id"');
    return;
  }
  var onComplete = applabCommands.handleDeleteRecord.bind(this, opts);
  var onError = opts.onError || getAsyncOutputWarning();
  Applab.storage.deleteRecord(opts.table, opts.record, onComplete, onError);
};

applabCommands.handleDeleteRecord = function(opts, success) {
  if (opts.onComplete) {
    opts.onComplete.call(null, success);
  }
};

applabCommands.onRecordEvent = function(opts) {
  apiValidateType(opts, 'onRecordEvent', 'table', opts.table, 'string');
  apiValidateType(opts, 'onRecordEvent', 'callback', opts.onRecord, 'function');
  apiValidateType(
    opts,
    'onRecordEvent',
    'includeAll',
    opts.includeAll,
    'boolean',
    OPTIONAL
  );
  Applab.storage.onRecordEvent(
    opts.table,
    opts.onRecord,
    getAsyncOutputWarning(),
    opts.includeAll
  );
};

applabCommands.getUserId = function(opts) {
  if (!Applab.user.labUserId) {
    throw new Error('User ID failed to load.');
  }
  return Applab.user.labUserId;
};

/**
 * How to execute the 'drawChart' function.
 * Delegates most work to ChartApi.drawChart, but a few things are
 * handled directly at this layer:
 *   - Type validation (before execution)
 *   - Queueing callbacks (after execution)
 *   - Reporting errors and warnings (after execution)
 * @see {ChartApi}
 * @param {Object} opts
 * @param {string} opts.chartId
 * @param {ChartType} opts.chartType
 * @param {Object[]} opts.chartData
 * @param {Object} opts.options
 * @param {function} opts.callback
 */
applabCommands.drawChart = function(opts) {
  apiValidateType(opts, 'drawChart', 'chartId', opts.chartId, 'string');
  apiValidateType(opts, 'drawChart', 'chartType', opts.chartType, 'string');
  apiValidateType(opts, 'drawChart', 'chartData', opts.chartData, 'array');
  apiValidateType(
    opts,
    'drawChart',
    'options',
    opts.options,
    'object',
    OPTIONAL
  );
  apiValidateType(
    opts,
    'drawChart',
    'callback',
    opts.callback,
    'function',
    OPTIONAL
  );
  apiValidateDomIdExistence(opts, 'drawChart', 'chartId', opts.chartId, true);

  var chartApi = new ChartApi();

  /**
   * What to do after drawing the chart succeeds/completes:
   *   1. Report any warnings, attributed to the current line.
   *   2. Queue the user-provided success callback.
   *
   * @param {Error[]} warnings - Any non-terminal errors generated by the
   *        drawChartFromRecords call, which we will report on after the fact
   *        without halting execution.
   */
  var onSuccess = function() {
    stopLoadingSpinnerFor(opts.chartId);
    chartApi.warnings.forEach(function(warning) {
      outputWarning(warning.message);
    });
    if (typeof opts.callback === 'function') {
      opts.callback.call(null);
    }
  };

  /**
   * What to do if something goes wrong:
   *   1. Report the error.
   *
   * @param {Error} error - A rejected promise usually passes an error.
   */
  var onError = function(error) {
    stopLoadingSpinnerFor(opts.chartId);
    outputError(error.message);
  };

  startLoadingSpinnerFor(opts.chartId);
  chartApi
    .drawChart(opts.chartId, opts.chartType, opts.chartData, opts.options)
    .then(onSuccess, onError);
};

/**
 * How to execute the 'drawChartFromRecords' function.
 * Delegates most work to ChartApi.drawChartFromRecords, but a few things are
 * handled directly at this layer:
 *   - Type validation (before execution)
 *   - Queueing callbacks (after execution)
 *   - Reporting errors and warnings (after execution)
 * @see {ChartApi}
 * @param {Object} opts
 * @param {string} opts.chartId
 * @param {ChartType} opts.chartType
 * @param {string} opts.tableName
 * @param {string[]} opts.columns
 * @param {Object} opts.options
 * @param {function} opts.callback
 */
applabCommands.drawChartFromRecords = function(opts) {
  apiValidateType(
    opts,
    'drawChartFromRecords',
    'chartId',
    opts.chartId,
    'string'
  );
  apiValidateType(
    opts,
    'drawChartFromRecords',
    'chartType',
    opts.chartType,
    'string'
  );
  apiValidateType(
    opts,
    'drawChartFromRecords',
    'tableName',
    opts.tableName,
    'string'
  );
  apiValidateType(
    opts,
    'drawChartFromRecords',
    'columns',
    opts.columns,
    'array'
  );
  apiValidateType(
    opts,
    'drawChartFromRecords',
    'options',
    opts.options,
    'object',
    OPTIONAL
  );
  apiValidateType(
    opts,
    'drawChartFromRecords',
    'callback',
    opts.callback,
    'function',
    OPTIONAL
  );
  apiValidateDomIdExistence(
    opts,
    'drawChartFromRecords',
    'chartId',
    opts.chartId,
    true
  );

  var chartApi = new ChartApi();

  /**
   * What to do after drawing the chart succeeds/completes:
   *   1. Report any warnings, attributed to the current line.
   *   2. Queue the user-provided success callback.
   *
   * @param {Error[]} warnings - Any non-terminal errors generated by the
   *        drawChartFromRecords call, which we will report on after the fact
   *        without halting execution.
   */
  var onSuccess = function() {
    stopLoadingSpinnerFor(opts.chartId);
    chartApi.warnings.forEach(function(warning) {
      outputWarning(warning.message);
    });
    if (typeof opts.callback === 'function') {
      opts.callback.call(null);
    }
  };

  /**
   * What to do if something goes wrong:
   *   1. Report the error.
   *
   * @param {Error} error - A rejected promise usually passes an error.
   */
  var onError = function(error) {
    stopLoadingSpinnerFor(opts.chartId);
    outputError(error.message);
  };

  startLoadingSpinnerFor(opts.chartId);
  chartApi
    .drawChartFromRecords(
      opts.chartId,
      opts.chartType,
      opts.tableName,
      opts.columns,
      opts.options
    )
    .then(onSuccess, onError);
};

/**
 * If the element is found, add the 'loading' class to it so that it
 * displays the loading spinner.
 * @param {string} elementId
 */
function startLoadingSpinnerFor(elementId) {
  var element = document.getElementById(elementId);
  if (!element) {
    return;
  }

  // Add 'loading' class
  element.className += ' loading';
}

/**
 * If the element is found, make sure to remove the 'loading' class from it
 * so that it hides the loading spinner.
 * @param {string} elementId
 */
function stopLoadingSpinnerFor(elementId) {
  var element = document.getElementById(elementId);
  if (!element) {
    return;
  }

  // Remove 'loading' class
  element.className = element.className
    .split(/\s+/)
    .filter(function(x) {
      return !/loading/i.test(x);
    })
    .join(' ');
}

// Include playSound, stopSound, etc.
Object.assign(applabCommands, audioCommands);
Object.assign(applabCommands, timeoutCommands);
Object.assign(applabCommands, makerCommands);
