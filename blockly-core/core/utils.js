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

/**
 * Bind an event to a function call.
 * @param {!Element} element Element upon which to listen.
 * @param {string} name Event name to listen to (e.g. 'mousedown').
 * @param {Object} thisObject The value of 'this' in the function.
 * @param {!Function} func Function to call when event is triggered.
 * @return {!Array.<!Array>} Opaque data that can be passed to unbindEvent_.
 * @private
 */
Blockly.bindEvent_ = function(element, name, thisObject, func) {
  var bindData = [];
  var wrapFunc;
  if (!element.addEventListener) {
    throw 'Element is not a DOM node with addEventListener.';
  }
  wrapFunc = function(e) {
    func.apply(thisObject, arguments);
  };
  element.addEventListener(name, wrapFunc, false);
  bindData.push([element, name, wrapFunc]);
  // Add equivalent touch event.
  if (name in Blockly.bindEvent_.TOUCH_MAP) {
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
    element.addEventListener(Blockly.bindEvent_.TOUCH_MAP[name],
                             wrapFunc,
                             false);
    bindData.push([element, Blockly.bindEvent_.TOUCH_MAP[name], wrapFunc]);
  }
  return bindData;
};

/**
 * The TOUCH_MAP lookup dictionary specifies additional touch events to fire,
 * in conjunction with mouse events.
 * @type {Object}
 */
Blockly.bindEvent_.TOUCH_MAP = {};
if ('ontouchstart' in document.documentElement) {
  Blockly.bindEvent_.TOUCH_MAP = {
    mousedown: 'touchstart',
    mousemove: 'touchmove',
    mouseup: 'touchend'
  };
} else if (window.navigator.pointerEnabled) {  // IE 11+ support
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
}

/**
 * Unbind one or more events event from a function call.
 * @param {!Array.<!Array>} bindData Opaque data from bindEvent_.  This list is
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
    element.removeEventListener(name, func, false);
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
Blockly.getRelativeXY_ = function(element) {
  var xy = {x: 0, y: 0};
  // First, check for x and y attributes.
  var x = element.getAttribute('x');
  if (x) {
    xy.x = parseInt(x, 10);
  }
  var y = element.getAttribute('y');
  if (y) {
    xy.y = parseInt(y, 10);
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
    xy.x += parseInt(r[1], 10);
    if (r[3]) {
      xy.y += parseInt(r[3], 10);
    }
  }
  return xy;
};

/**
 * Return the absolute coordinates of the top-left corner of this element.
 * The origin (0,0) is the top-left corner of the Blockly svg.
 * @param {!Element} element Element to find the coordinates of.
 * @return {!Object} Object with .x and .y properties.
 * @private
 */
Blockly.getSvgXY_ = function(element) {
  var x = 0;
  var y = 0;
  var topMostSVG = Blockly.topMostSVGParent(element);
  do {
    // Loop through this block and every parent.
    var xy = Blockly.getRelativeXY_(element);
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
 * @return {!Object} Object with .x and .y properties.
 * @private
 */
Blockly.getAbsoluteXY_ = function(element) {
  var xy = Blockly.getSvgXY_(element);
  return Blockly.convertCoordinates(xy.x, xy.y, Blockly.topMostSVGParent(element), false);
};

/**
 * Find top-most SVG element the given element is a child of
 * @param {!Element} element Element to find the coordinates of.
 * @return {!Element|null} topmost SVG element, if one exists
 */
Blockly.topMostSVGParent = goog.memoize(
  function(element) {
    var topMostSVG = null;

    while (element) {
      if (element.tagName === 'svg') {
        topMostSVG = element;
      }
      element = goog.dom.getParentElement(element);
    }

    return topMostSVG;
  }
);

/**
 * Helper method for creating SVG elements.
 * @param {string} name Element's tag name.
 * @param {!Object} attrs Dictionary of attribute names and values.
 * @param {Element=} opt_parent Optional parent on which to append the element.
 * @return {!SVGElement} Newly created SVG element.
 */
Blockly.createSvgElement = function(name, attrs, opt_parent) {
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
    opt_parent.appendChild(e);
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
 * @param {boolean} toSvg True to convert to SVG coordinates.
 * @param {Element} svg parent SVG element
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
 * @return {!Object} Object with .x and .y properties.
 */
Blockly.mouseToSvg = function(e) {
  return Blockly.convertCoordinates(e.clientX + window.pageXOffset,
    e.clientY + window.pageYOffset, Blockly.topMostSVGParent(e.target), true);
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
