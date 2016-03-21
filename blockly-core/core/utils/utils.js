/**
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * http://blockly.googlecode.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Utility methods.
 * These methods are not specific to Blockly, and could be factored out if
 * a JavaScript framework such as Closure were used.
 * @author fraser@google.com (Neil Fraser)
 */

goog.provide('Blockly.utils');

goog.require('goog.array');
goog.require('goog.memoize');
goog.require('goog.events');
goog.require('goog.math.Rect');

/**
 * Add a CSS class to a element.
 * Similar to Closure's goog.dom.classes.add, except it handles SVG elements.
 * @param {!Element} element DOM element to add class to.
 * @param {string} className Name of class to add.
 * @private
 */
Blockly.addClass_ = function(element, className) {
  var classes = element.getAttribute('class') || '';
  if (Blockly.stringContainsClass_(classes, className)) {
    if (classes) {
      classes += ' ';
    }
    element.setAttribute('class', classes + className);
  }
};

Blockly.elementHasClass_ = function (element, className) {
  return Blockly.stringContainsClass_(element.getAttribute('class') || '', className);
};

Blockly.stringContainsClass_ = function (classes, className) {
  return (' ' + classes + ' ').indexOf(' ' + className + ' ') == -1;
};

/**
 * Remove a CSS class from a element.
 * Similar to Closure's goog.dom.classes.remove, except it handles SVG elements.
 * @param {!Element} element DOM element to remove class from.
 * @param {string} className Name of class to remove.
 * @private
 */
Blockly.removeClass_ = function(element, className) {
  var classes = element.getAttribute('class');
  if ((' ' + classes + ' ').indexOf(' ' + className + ' ') != -1) {
    var classList = classes.split(/\s+/);
    for (var i = 0; i < classList.length; i++) {
      if (!classList[i] || classList[i] == className) {
        classList.splice(i, 1);
        i--;
      }
    }
    if (classList.length) {
      element.setAttribute('class', classList.join(' '));
    } else {
      element.removeAttribute('class');
    }
  }
};

/** @typedef {!Array.<!Array>} BindData */

/**
 * Bind an event to a function call.
 * @param {!Element} element Element upon which to listen.
 * @param {string} name Event name to listen to (e.g. 'mousedown').
 * @param {Object} thisObject The value of 'this' in the function.
 * @param {!Function} func Function to call when event is triggered.
 * @param {boolean} [useCapture=false] If true, bind event against capture
 *        phase instead of bubble phase.
 * @return {BindData} Opaque data that can be passed to unbindEvent_.
 * @private
 */
Blockly.bindEvent_ = function(element, name, thisObject, func, useCapture) {
  // Coerce useCapture to boolean
  useCapture = !!useCapture;
  var bindData = [];
  var wrapFunc;
  if (!element.addEventListener) {
    throw 'Element is not a DOM node with addEventListener.';
  }
  wrapFunc = function(e) {
    func.apply(thisObject, arguments);
  };
  // Add equivalent touch event.
  var equivTouchEvent = Blockly.bindEvent_.TOUCH_MAP[name];
  if (equivTouchEvent) {
    // Also bind the mouse event, unless the browser supports pointer events.
    if (!window.navigator.pointerEnabled && !window.navigator.msPointerEnabled) {
      element.addEventListener(name, wrapFunc, useCapture);
      bindData.push([element, name, wrapFunc, useCapture]);
    }
    wrapFunc = function (e) {
      if (e.target && e.target.style) {
        var targetStyle = e.target.style;
        if (targetStyle.touchAction) {  // required for IE 11+
          targetStyle.touchAction = "none";
        } else if (targetStyle.msTouchAction) {  // required for IE 10
          targetStyle.msTouchAction = "none";
        }
      }

      // Punt on multitouch events.
      var touchPoints = e.changedTouches || [e];
      for (var i = 0; i < touchPoints.length; ++i) {
        // Map the touch event's properties to the event.
        e.clientX = touchPoints[i].clientX;
        e.clientY = touchPoints[i].clientY;

        func.apply(thisObject, arguments);
      }
    };
    element.addEventListener(equivTouchEvent, wrapFunc, useCapture);
    bindData.push([element, equivTouchEvent, wrapFunc, useCapture]);
  } else {
    element.addEventListener(name, wrapFunc, useCapture);
    bindData.push([element, name, wrapFunc, useCapture]);
  }
  return bindData;
};

/**
 * The TOUCH_MAP lookup dictionary specifies additional touch events to fire,
 * in conjunction with mouse events.
 *
 * Note that this order is important; if pointer events are available,
 * we always want to prefer them. In some cases such as Windows 8.1
 * phones, both pointer and touch events are available.
 *
 * @type {Object}
 */
Blockly.bindEvent_.TOUCH_MAP = {};
if (window.navigator.pointerEnabled) {  // IE 11+ support
  Blockly.bindEvent_.TOUCH_MAP = {
    mousedown: 'pointerdown',
    mousemove: 'pointermove',
    mouseup: 'pointerup'
  };
} else if (window.navigator.msPointerEnabled) {  // IE 10 support
  Blockly.bindEvent_.TOUCH_MAP = {
    mousedown: 'MSPointerDown',
    mousemove: 'MSPointerMove',
    mouseup: 'MSPointerUp'
  };
} else if ('ontouchstart' in document.documentElement) {
  Blockly.bindEvent_.TOUCH_MAP = {
    mousedown: 'touchstart',
    mousemove: 'touchmove',
    mouseup: 'touchend'
  };
}

/**
 * Unbind one or more events event from a function call.
 * @param {BindData} BindData Opaque data from bindEvent_.  This list is
 *     emptied during the course of calling this function.
 * @return {!Function} The function call.
 * @private
 */
Blockly.unbindEvent_ = function(bindData) {
  while (bindData.length) {
    var bindDatum = bindData.pop();
    var element = bindDatum[0];
    var name = bindDatum[1];
    var func = bindDatum[2];
    var useCapture = bindDatum[3];
    element.removeEventListener(name, func, useCapture);
  }
  return func;
};

/**
 * Fire a synthetic event.
 * @param {!Element} element The event's target element.
 * @param {string} eventName Name of event (e.g. 'click').
 */
Blockly.fireUiEvent = function(element, eventName) {
  var doc = document;
  if (doc.createEvent) {
    // W3
    var evt = doc.createEvent('UIEvents');
    evt.initEvent(eventName, true, true);  // event type, bubbling, cancelable
    element.dispatchEvent(evt);
  } else if (doc.createEventObject) {
    // MSIE
    var evt = doc.createEventObject();
    element.fireEvent('on' + eventName, evt);
  } else {
    throw 'FireEvent: No event creation mechanism.';
  }
};

/**
 * Don't do anything for this event, just halt propagation.
 * @param {!Event} e An event.
 */
Blockly.noEvent = function(e) {
  // This event has been handled.  No need to bubble up to the document.
  e.preventDefault();
  e.stopPropagation();
};

/**
 * Return the coordinates of the top-left corner of this element relative to
 * its parent.
 * @param {!Element} element Element to find the coordinates of.
 * @return {!Object} Object with .x and .y properties.
 * @private
 */
Blockly.getRelativeXY = function(element) {
  var xy = {x: 0, y: 0};
  // First, check for x and y attributes.
  var x = element.getAttribute('x');
  if (x) {
    xy.x = parseFloat(x);
  }
  var y = element.getAttribute('y');
  if (y) {
    xy.y = parseFloat(y);
  }
  // Second, check for transform="translate(...)" attribute.
  var transform = element.getAttribute('transform');
  // Note that Firefox and IE (9,10) return 'translate(12)' instead of
  // 'translate(12, 0)'.
  // Note that IE (9,10) returns 'translate(16 8)' instead of
  // 'translate(16, 8)'.
  var r = transform &&
    transform.match(/translate\(\s*([-\d.]+)([ ,]\s*([-\d.]+)\s*\))?/);
  if (r) {
    xy.x += parseFloat(r[1]);
    if (r[3]) {
      xy.y += parseFloat(r[3]);
    }
  }
  return xy;
};

/**
 * Return the absolute coordinates of the top-left corner of this element.
 * The origin (0,0) is the top-left corner of the Blockly svg.
 * @param {!Element} element Element to find the coordinates of.
 * @param {Element=} opt_svgParent optional parent <svg> element, otherwise
 *    `element`'s parents will be searched
 * @return {!Object} Object with .x and .y properties.
 * @private
 */
Blockly.getSvgXY_ = function(element, opt_svgParent) {
  var x = 0;
  var y = 0;
  var topMostSVG = opt_svgParent || Blockly.topMostSVGParent(element);
  do {
    // Loop through this block and every parent.
    var xy = Blockly.getRelativeXY(element);
    x += xy.x;
    y += xy.y;
    element = element.parentNode;
  } while (element && element !== topMostSVG);
  return {x: x, y: y};
};

/**
 * Return the absolute coordinates of the top-left corner of this element.
 * The origin (0,0) is the top-left corner of the page body.
 * @param {!Element} element Element to find the coordinates of.
 * @param {Element=} opt_svgParent optional parent <svg> element, otherwise
 *    `element`'s parents will be searched
 * @return {!Object} Object with .x and .y properties.
 * @private
 */
Blockly.getAbsoluteXY_ = function(element, opt_svgParent) {
  var xy = Blockly.getSvgXY_(element, opt_svgParent);
  return Blockly.convertCoordinates(xy.x, xy.y, opt_svgParent || Blockly.topMostSVGParent(element), false);
};

/**
 * Find top-most SVG element the given element is a child of
 * @param {!Element} element Element to find the coordinates of.
 * @return {!Element} topmost SVG element, if one exists, or the main editor SVG
 */
Blockly.topMostSVGParent = function(element) {
  var topMostSVG = null;

  while (element) {
    if (element.tagName === 'svg') {
      topMostSVG = element;
    }
    element = goog.dom.getParentElement(element);
  }

  return (topMostSVG || Blockly.mainBlockSpaceEditor.getSVGElement());
};

/**
 * Helper method for creating SVG elements.
 * @param {string} name Element's tag name.
 * @param {!Object} attrs Dictionary of attribute names and values.
 * @param {Element=} opt_parent Optional parent on which to append the element.
 * @param {Object=} opt_options
 * @return {!SVGElement} Newly created SVG element.
 */
Blockly.createSvgElement = function(name, attrs, opt_parent, opt_options) {
  opt_options = opt_options || {};

  var e = /** @type {!SVGElement} */ (
      document.createElementNS(Blockly.SVG_NS, name));
  for (var key in attrs) {
    e.setAttribute(key, attrs[key]);
  }
  // IE defines a unique attribute "runtimeStyle", it is NOT applied to
  // elements created with createElementNS. However, Closure checks for IE
  // and assumes the presence of the attribute and crashes.
  if (document.body.runtimeStyle) {  // Indicates presence of IE-only attr.
    e.runtimeStyle = e.currentStyle = e.style;
  }
  if (opt_parent) {
    if (opt_options.belowExisting) {
      goog.dom.insertChildAt(opt_parent, e, 0);
    } else {
      goog.dom.appendChild(opt_parent, e);
    }
  }
  return e;
};

/**
 * Is this event a right-click?
 * @param {!Event} e Mouse event.
 * @return {boolean} True if right-click.
 */
Blockly.isRightButton = function(e) {
  // Control-clicking in WebKit on Mac OS X fails to change button to 2.
  return e.button == 2 || e.ctrlKey;
};

/**
 * Convert between HTML coordinates and SVG coordinates.
 * @param {number} x X input coordinate.
 * @param {number} y Y input coordinate.
 * @param {Element} svg parent SVG element
 * @param {boolean} toSvg True to convert to SVG coordinates.
 *     False to convert to mouse/HTML coordinates.
 * @return {!Object} Object with x and y properties in output coordinates.
 */
Blockly.convertCoordinates = function(x, y, svg, toSvg) {
  if (toSvg) {
    x -= window.pageXOffset;
    y -= window.pageYOffset;
  }
  var svgPoint = svg.createSVGPoint();
  svgPoint.x = x;
  svgPoint.y = y;
  var matrix = svg.getScreenCTM();
  if (toSvg) {
    matrix = matrix.inverse();
  }
  var xy = svgPoint.matrixTransform(matrix);
  if (!toSvg) {
    if (!((goog.userAgent.IPAD || goog.userAgent.IPHONE) &&
        !goog.userAgent.isVersionOrHigher(538))) {
      // Do nothing here on iOS 7 and earlier. svg.getScreenCTM
      // ignores scrolling in those iOS versions, so the scroll
      // position is already accounted for.
      // https://bugs.webkit.org/show_bug.cgi?id=44083

      xy.x += window.pageXOffset;
      xy.y += window.pageYOffset;
    }
  }
  return xy;
};

/**
 * Return the converted coordinates of the given mouse event.
 * The origin (0,0) is the top-left corner of the Blockly svg.
 * @param {!Event} e Mouse event.
 * @param {Element=} opt_svgParent optional parent <svg> element, otherwise
 *    `element`'s parents will be searched
 * @return {!Object} Object with .x and .y properties.
 */
Blockly.mouseToSvg = function(e, opt_svgParent) {
  return Blockly.mouseCoordinatesToSvg(
    e.clientX,
    e.clientY,
    opt_svgParent || Blockly.topMostSVGParent(e.target));
};

/**
 * Return the converted coordinates of the given mouse coordinates.
 * The origin (0,0) is the top-left corner of the Blockly svg.
 * @param {number} clientX Mouse client X.
 * @param {number} clientY Mouse client Y.
 * @param {Element=} target element.
 * @return {Object} coordinate with .x and .y properties.
 */
Blockly.mouseCoordinatesToSvg = function(clientX, clientY, target) {
  return Blockly.convertCoordinates(
      clientX + window.pageXOffset,
      clientY + window.pageYOffset,
      target, true);
};

/**
 * Converts given SVG coordinates to blockspace coordinates
 * @param {goog.math.Coordinate} coordinates
 * @param {Blockly.BlockSpace} blockSpace
 * @returns {goog.math.Coordinate}
 */
Blockly.svgCoordinatesToViewport = function(coordinates, blockSpace) {
  var blockSpaceMetrics = blockSpace.getMetrics();
  return new goog.math.Coordinate(
    coordinates.x - blockSpaceMetrics.absoluteLeft,
    coordinates.y - blockSpaceMetrics.absoluteTop);
};

/**
 * Converts given SVG coordinates to blockspace coordinates
 * @param {goog.math.Coordinate} coordinates
 * @param {Blockly.BlockSpace} blockSpace
 * @returns {goog.math.Coordinate}
 */
Blockly.viewportCoordinateToBlockSpace = function(coordinates, blockSpace) {
  var viewportBox = blockSpace.getViewportBox();
  return new goog.math.Coordinate(coordinates.x + viewportBox.left,
    coordinates.y + viewportBox.top);
};

/**
 * Given an array of strings, return the length of the shortest one.
 * @param {!Array<string>} array Array of strings.
 * @return {number} Length of shortest string.
 */
Blockly.shortestStringLength = function(array) {
  if (!array.length) {
    return 0;
  }
  var len = array[0].length;
  for (var i = 1; i < array.length; i++) {
    len = Math.min(len, array[i].length);
  }
  return len;
};

/**
 * Given an array of strings, return the length of the common prefix.
 * Words may not be split.  Any space after a word is included in the length.
 * @param {!Array<string>} array Array of strings.
 * @param {?number} opt_shortest Length of shortest string.
 * @return {number} Length of common prefix.
 */
Blockly.commonWordPrefix = function(array, opt_shortest) {
  if (!array.length) {
    return 0;
  } else if (array.length == 1) {
    return array[0].length;
  }
  var wordPrefix = 0;
  var max = opt_shortest || Blockly.shortestStringLength(array);
  for (var len = 0; len < max; len++) {
    var letter = array[0][len];
    for (var i = 1; i < array.length; i++) {
      if (letter != array[i][len]) {
        return wordPrefix;
      }
    }
    if (letter == ' ') {
      wordPrefix = len + 1;
    }
  }
  for (var i = 1; i < array.length; i++) {
    var letter = array[i][len];
    if (letter && letter != ' ') {
      return wordPrefix;
    }
  }
  return max;
};

/**
 * Given an array of strings, return the length of the common suffix.
 * Words may not be split.  Any space after a word is included in the length.
 * @param {!Array<string>} array Array of strings.
 * @param {?number} opt_shortest Length of shortest string.
 * @return {number} Length of common suffix.
 */
Blockly.commonWordSuffix = function(array, opt_shortest) {
  if (!array.length) {
    return 0;
  } else if (array.length == 1) {
    return array[0].length;
  }
  var wordPrefix = 0;
  var max = opt_shortest || Blockly.shortestStringLength(array);
  for (var len = 0; len < max; len++) {
    var letter = array[0].substr(-len - 1, 1);
    for (var i = 1; i < array.length; i++) {
      if (letter != array[i].substr(-len - 1, 1)) {
        return wordPrefix;
      }
    }
    if (letter == ' ') {
      wordPrefix = len + 1;
    }
  }
  for (var i = 1; i < array.length; i++) {
    var letter = array[i].charAt(array[i].length - len - 1);
    if (letter && letter != ' ') {
      return wordPrefix;
    }
  }
  return max;
};

/**
 * Is the given string a number (includes negative and decimals).
 * @param {string} str Input string.
 * @return {boolean} True if number, false otherwise.
 */
Blockly.isNumber = function(str) {
  return !!str.match(/^\s*-?\d+(\.\d+)?\s*$/);
};

Blockly.isMsie = function() {
  return window.navigator.userAgent.indexOf("MSIE") >= 0;
};

Blockly.isTrident = function() {
  return window.navigator.userAgent.indexOf("Trident") >= 0;
};

Blockly.isIOS = function() {
  return /iP(hone|od|ad)/.test(navigator.platform);
};

// Return the version of Internet Explorer (8+) or undefined if not IE.
Blockly.ieVersion = function() {
  return document.documentMode;
};

/**
 * Determine what colour overlaying the given foreground and background would result in,
 * given the opacity of the foreground colour
 * @param foregroundColor {string} hex foreground colour
 * @param backgroundColor {string} hex background colour
 * @param foregroundOpacity {number} opacity, number from 0.0 to 1.0
 * @returns {string} the hex value of the resulting colour
 */
Blockly.mixColoursWithForegroundOpacity = function(foregroundColor, backgroundColor, foregroundOpacity) {
  var foregroundRGB = goog.color.hexToRgb(foregroundColor);
  var backgroundRGB = goog.color.hexToRgb(backgroundColor);
  var resultRed = Math.round(backgroundRGB[0] * (1 - foregroundOpacity) + foregroundRGB[0] * foregroundOpacity);
  var resultGreen = Math.round(backgroundRGB[1] * (1 - foregroundOpacity) + foregroundRGB[1] * foregroundOpacity);
  var resultBlue = Math.round(backgroundRGB[2] * (1 - foregroundOpacity) + foregroundRGB[2] * foregroundOpacity);
  return goog.color.rgbToHex(resultRed, resultGreen, resultBlue);
};

/**
 * Converts a printer-style string range to an array of numbers
 * e.g., "1,2,3-5" becomes [1,2,3,4,5]
 * @param rangeString {string} printer-style range, e.g., "1,2,3-5"
 * @returns  {Array.<!Number>}
 */
Blockly.printerRangeToNumbers = function(rangeString) {
  var rangeStringNoSpaces = rangeString.replace(/ /g, '');
  var rangeItems = rangeStringNoSpaces.split(',');
  var fullNumberList = [];
  var rangeRegexp = /^(\d+)\-(\d+)$/; // e.g., "5-10", "20-30"
  var numberRegexp = /^(\d+)$/; // e.g., "3", "500"
  for (var i = 0; i < rangeItems.length; i++) {
    var numberOrRange = rangeItems[i];
    var rangeResult = rangeRegexp.exec(numberOrRange);
    var numberResult = numberRegexp.exec(numberOrRange);
    if (rangeResult) {
      var lowerRange = Number(rangeResult[1]);
      var upperNonInclusive = Number(rangeResult[2]) + 1;
      var rangeArray = goog.array.range(lowerRange, upperNonInclusive);
      fullNumberList = fullNumberList.concat(rangeArray);
    } else if (numberResult) {
      fullNumberList.push(Number(numberResult[1]));
    }
  }
  return fullNumberList;
};

/**
 * Generates a globally unique ID
 * @returns {string|*}
 */
Blockly.getUID = function() {
  return goog.events.getUniqueId('blocklyUID');
};

/**
 * Is this event targeting a text input widget?
 * @param {!Event} e An event.
 * @return {boolean} True if text or textarea input.
 */
Blockly.isTargetInput = function (e) {
  return e.target.type == 'textarea' || e.target.type == 'text';
};

/**
 * Cancel the native context menu, unless the focus is on an HTML input widget.
 * @param {!Event} e contextmenu event.
 * @private
 */
Blockly.blockContextMenu = function (e) {
  if (!Blockly.isTargetInput(e)) {
    e.preventDefault();
  }
};

/**
 * Get normalized wheel scrolling amount from a given wheel or scrollwheel event
 * - in Safari, processes e.wheelDeltaY instead of e.deltaY, and normalizes
 *   so + is down
 * - in Firefox, multiplies event by 10 to account for browser's smaller deltas
 * @param {!Event} e scrollwheel or wheel event.
 * @return {number|null} wheelDeltaY normalized scroll dy, + is down, or null if
 * no wheel delta present in event
*/
Blockly.getNormalizedWheelDeltaY = function (e) {
  // Safari uses wheelDeltaY (- is down), others use deltaY (+ is down)
  var wheelDeltaY = e.deltaY || -e.wheelDeltaY; // + is down

  if (!wheelDeltaY) {
    return null;
  }

  if (goog.userAgent.GECKO) {
    // Firefox's deltas are a tenth that of Chrome/Safari.
    wheelDeltaY *= 10;
  }

  return wheelDeltaY;
};

/**
 * Given an outer box, returns a box with the amounts of an inner box's overflow
 * on each side.
 * @param {goog.math.Box} outerBox
 * @param {goog.math.Box} innerBox
 * @return {goog.math.Box} overflow on each side, (+) is amount hanging off
 */
Blockly.getBoxOverflow = function (outerBox, innerBox) {
  return new goog.math.Box(
    Math.max(0, outerBox.top - innerBox.top),
    Math.max(0, innerBox.right - outerBox.right),
    Math.max(0, innerBox.bottom - outerBox.bottom),
    Math.max(0, outerBox.left - innerBox.left));
};

/**
 * Gets a point's distance outside each side (or negative if inside box)
 * @param {goog.math.Box} outerBox
 * @param {goog.math.Coordinate} innerPoint
 * @return {goog.math.Box} distances to each side, from point's perspective
 */
Blockly.getPointBoxOverflow = function (outerBox, innerPoint) {
  return new goog.math.Box(
    outerBox.top - innerPoint.y,
    innerPoint.x - outerBox.right,
    innerPoint.y - outerBox.bottom,
    outerBox.left - innerPoint.x);
};

/**
 * @param {goog.math.Box} boxA
 * @param {goog.math.Box} boxB
 * @returns {boolean} whether boxA is wider than boxB
 */
Blockly.isBoxWiderThan = function (boxA, boxB) {
  return Blockly.getBoxWidth(boxA) > Blockly.getBoxWidth(boxB);
};

/**
 * @param {goog.math.Box} boxA
 * @param {goog.math.Box} boxB
 * @returns {boolean} whether boxA is taller than boxB
 */
Blockly.isBoxTallerThan = function (boxA, boxB) {
  return Blockly.getBoxHeight(boxA) > Blockly.getBoxHeight(boxB);
};

/**
 * @param {goog.math.Box} box
 * @return {number} width of box
 */
Blockly.getBoxWidth = function (box) {
  return box.right - box.left;
};

/**
 * @param {goog.math.Box} box
 * @return {number} height of box
 */
Blockly.getBoxHeight = function (box) {
  return box.bottom - box.top;
};

/**
 * @param {number} number
 * @param {number} min
 * @param {number} max
 * @param {boolean} inclusive
 * @return {boolean} whether given number is within range
 */
Blockly.numberWithin = function (number, min, max, inclusive) {
  return inclusive?
    (number >= min && number <= max) :
    (number > min && number < max);
};

/**
 * @param {SVGRect} svgRect
 * @returns {goog.math.Rect}
 */
Blockly.svgRectToRect = function (svgRect) {
  return new goog.math.Rect(svgRect.x, svgRect.y, svgRect.width,
    svgRect.height);
};


/**
 * @param {Object} dialogOptions simple dialog options
 * @see FeedbackUtils.prototype.showSimpleDialog in cdo/apps/src/feedback.js
 *     for options
 */
Blockly.showSimpleDialog = function (dialogOptions) {
  if (Blockly.customSimpleDialog) {
    Blockly.customSimpleDialog(dialogOptions);
  }
};

/**
 * Direction properties for goog.math.Boxes
 * @type {string[]}
 */
Blockly.BOX_DIRECTIONS = ['top', 'right', 'bottom', 'left'];

/**
 * Given a box, adds a given amount to any non-zero side.
 * @param {goog.math.Box} box
 * @param {number} amount
 */
Blockly.addToNonZeroSides = function (box, amount) {
  Blockly.BOX_DIRECTIONS.forEach(function (direction) {
    if (box[direction] !== 0) {
      box[direction] += amount;
    }
  });
};

/**
 * Sets element to ignore pointer events.
 * Note: only use for SVG elements, only those support IE9 and 10
 * {@link https://css-tricks.com/almanac/properties/p/pointer-events/}
 * @param {Element} element - SVG element
 */
Blockly.svgIgnoreMouseEvents = function (element) {
  element.style.pointerEvents = 'none';
};

/**
 * Fires a mousedown, mouseup, click sequence of events on a given target.
 *
 * Note: Intended for testing only. Creates events using MouseEvents.
 * @param target
 */
Blockly.fireTestClickSequence = function (target) {
  Blockly.fireTestMouseEvent(target, 'mousedown');
  Blockly.fireTestMouseEvent(target, 'mouseup');
  Blockly.fireTestMouseEvent(target, 'click');
};

/**
 * Creates a mouse event and dispatches it on the given target.
 *
 * Note: this is for testing only. This is not cross-browser friendly.
 * Creates events using MouseEvents.
 * @param {EventTarget} target
 * @param {string} eventName e.g. click, mousedown, mouseup
 */
Blockly.fireTestMouseEvent = function (target, eventName) {
  if (!document.createEvent) {
    throw "fireTestMouseEvent is only for testing in browsers with createEvent";
  }

  target.dispatchEvent(Blockly.makeTestMouseEvent(eventName));
};

/**
 * Makes a dummy mouse event with the given event name.
 * @param {string} eventName e.g. click, mousedown, mouseup
 */
Blockly.makeTestMouseEvent = function (eventName) {
  var event = document.createEvent("MouseEvents");
  event.initMouseEvent(eventName, true, true, window,
      0, 0, 0, 0, 0, false, false, false, false, 0, null);
  return event;
};

/**
 * Attempts to find a container block with an empty input.
 * @param {Blockly.Block[]} blocks
 * @returns {Blockly.Block|null} block with empty input, or null if none found
 */
Blockly.findEmptyContainerBlock = function (blocks) {
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    if (Blockly.findEmptyInput(block, Blockly.NEXT_STATEMENT)) {
      return block;
    }
  }
  return null;
};

/**
 * Finds an empty input of the given input type.
 * @param {Blockly.Block} block
 * @param {number} inputType
 * @returns {Blockly.Input|null} empty input or null if none found
 */
Blockly.findEmptyInput = function (block, inputType) {
  return goog.array.find(block.inputList, function(input) {
    return input.type === inputType && !input.connection.targetConnection;
  });
};
