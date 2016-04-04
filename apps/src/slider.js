/**
 * Blockly Apps: SVG Slider
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
 * @fileoverview A slider control in SVG.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';
var SVG_NS = require('./constants').SVG_NS;
var dom = require('./dom');

/**
 * Object representing a horizontal slider widget.
 * @param {number} x The horizontal offset of the slider.
 * @param {number} y The vertical offset of the slider.
 * @param {number} width The total width of the slider.
 * @param {!Element} svgParent The SVG element to append the slider to.
 * @param {Function} opt_changeFunc Optional callback function that will be
 *     called when the slider is moved.  The current value is passed.
 * @constructor
 */
var Slider = function(x, y, width, svgParent, opt_changeFunc) {
  this.KNOB_Y_ = y - 12;
  this.KNOB_MIN_X_ = x + 8;
  this.KNOB_MAX_X_ = x + width - 8;
  this.value_ = 0.5;
  this.changeFunc_ = opt_changeFunc;
  this.isAndroid_ = dom.isAndroid();
  this.isIOS_ = dom.isIOS();
  this.isWindowsTouch_ = dom.isWindowsTouch();

  // Draw the slider.
  /*
  <line class="sliderTrack" x1="10" y1="35" x2="140" y2="35" />
  <path id="knob"
      transform="translate(67, 23)"
      d="m 8,0 l -8,8 v 12 h 16 v -12 z" />
  */
  var track = document.createElementNS(SVG_NS, 'line');
  track.setAttribute('class', 'sliderTrack');
  track.setAttribute('x1', x);
  track.setAttribute('y1', y);
  track.setAttribute('x2', x + width);
  track.setAttribute('y2', y);
  svgParent.appendChild(track);
  this.track_ = track;
  var knob = document.createElementNS(SVG_NS, 'path');
  knob.setAttribute('class', 'sliderKnob');
  knob.setAttribute('d', 'm 0,0 l -8,8 v 12 h 16 v -12 z');
  svgParent.appendChild(knob);
  this.knob_ = knob;
  this.setValue(0.5);

  // Find the root SVG object.
  while (svgParent && svgParent.nodeName.toLowerCase() != 'svg') {
    svgParent = svgParent.parentNode;
  }
  this.SVG_ = svgParent;

  // Bind the events to this slider.
  var thisSlider = this;
  dom.addMouseDownTouchEvent(this.knob_, function(e) {
    return thisSlider.knobMouseDown_(e);
  });
  dom.addMouseDownTouchEvent(this.track_, function(e) {
    return thisSlider.trackMouseDown_(e);
  });
  dom.addMouseUpTouchEvent(this.SVG_, Slider.knobMouseUp_);
  dom.addMouseMoveTouchEvent(this.SVG_, Slider.knobMouseMove_);
  // Don't add touch events for mouseover. The UX is better on Android
  // and iOS if the drag action is allowed to continue when the
  // touchmove target moves above or below the SVG element.
  Slider.bindEvent_(document, 'mouseover', Slider.mouseOver_);
};

Slider.activeSlider_ = null;
Slider.startMouseX_ = 0;
Slider.startKnobX_ = 0;

/**
 * Start a drag when clicking down on the knob.
 * @param {!Event} e Mouse-down event.
 * @private
 */
Slider.prototype.knobMouseDown_ = function(e) {
  this.beginDrag_(this.mouseToSvg_(e));

  // Stop browser from attempting to drag the knob.
  e.preventDefault();
  return false;
};

/**
 * Snap the knob to the mouse location and start a drag
 * when clicking on the track (but not on the knob).
 * @param {!Event} e Mouse-down event.
 * @private
 */
Slider.prototype.trackMouseDown_ = function(e) {
  var mouseSVGPosition = this.mouseToSvg_(e);
  this.snapToPosition_(mouseSVGPosition.x);
  this.beginDrag_(mouseSVGPosition);

  // Stop browser from attempting to drag the track.
  e.preventDefault();
  return false;
};

/**
 * Start dragging the slider knob.
 * @param {!Object} mouseStartSVG Mouse start position in SVG space
 * @private
 */
Slider.prototype.beginDrag_ = function(startMouseSVG) {
  Slider.activeSlider_ = this;
  Slider.startMouseX_ = startMouseSVG.x;
  Slider.startKnobX_ = 0;
  var transform = this.knob_.getAttribute('transform');
  if (transform) {
    var r = transform.match(/translate\(\s*([-\d.]+)/);
    if (r) {
      Slider.startKnobX_ = Number(r[1]);
    }
  }
};

/**
 * Snap the slider knob to the clicked position.
 * @param {number} xPosition SVG x-coordinate
 * @private
 */
Slider.prototype.snapToPosition_ = function(xPosition) {
  var x = Math.min(Math.max(xPosition,
        this.KNOB_MIN_X_), this.KNOB_MAX_X_);
  this.knob_.setAttribute('transform',
      'translate(' + x + ',' + this.KNOB_Y_ + ')');

  this.value_ = (x - this.KNOB_MIN_X_) /
      (this.KNOB_MAX_X_ - this.KNOB_MIN_X_);
  if (this.changeFunc_) {
    this.changeFunc_(this.value_);
  }
};

/**
 * Stop a drag when clicking up anywhere.
 * @param {Event} e Mouse-up event.
 * @private
 */
Slider.knobMouseUp_ = function(e) {
  Slider.activeSlider_ = null;
};

/**
 * Stop a drag when the mouse enters a node not part of the SVG.
 * @param {Event} e Mouse-up event.
 * @private
 */
Slider.mouseOver_ = function(e) {
  if (!Slider.activeSlider_) {
    return;
  }
  // Find the root SVG object.
  for (var node = e.target; node; node = node.parentNode) {
    if (node == Slider.activeSlider_.SVG_) {
      return;
    }
  }
  Slider.knobMouseUp_(e);
};

/**
 * Drag the knob to follow the mouse.
 * @param {!Event} e Mouse-move event.
 * @private
 */
Slider.knobMouseMove_ = function(e) {
  var thisSlider = Slider.activeSlider_;
  if (!thisSlider) {
    return;
  }
  var x = thisSlider.mouseToSvg_(e).x - Slider.startMouseX_ +
      Slider.startKnobX_;
  thisSlider.snapToPosition_(x);
};

/**
 * Returns the slider's value (0.0 - 1.0).
 * @return {number} Current value.
 */
Slider.prototype.getValue = function() {
  return this.value_;
};

/**
 * Sets the slider's value (0.0 - 1.0).
 * @param {number} value New value.
 */
Slider.prototype.setValue = function(value) {
  this.value_ = Math.min(Math.max(value, 0), 1);
  var x = this.KNOB_MIN_X_ +
      (this.KNOB_MAX_X_ - this.KNOB_MIN_X_) * this.value_;
  this.knob_.setAttribute('transform',
      'translate(' + x + ',' + this.KNOB_Y_ + ')');
};

/**
 * Convert the mouse coordinates into SVG coordinates.
 * @param {!Object} e Object with x and y mouse coordinates.
 * @return {!Object} Object with x and y properties in SVG coordinates.
 * @private
 */
Slider.prototype.mouseToSvg_ = function(e) {
  var svgPoint = this.SVG_.createSVGPoint();
  // Most browsers provide clientX/Y. iOS only provides pageX/Y.
  // Android Chrome only provides coordinates within e.changedTouches.
  if (this.isWindowsTouch_) {
    // Only screenX/Y properly accounts for zooming in on windows touch.
    svgPoint.x = e.screenX;
    svgPoint.y = e.screenY;
  } else if (this.isAndroid_) {
    svgPoint.x = e.changedTouches[0].pageX;
    svgPoint.y = e.changedTouches[0].pageY;
  } else if (this.isIOS_) {
    svgPoint.x = e.pageX;
    svgPoint.y = e.pageY;
  } else {
    svgPoint.x = e.clientX;
    svgPoint.y = e.clientY;
  }
  var matrix = this.SVG_.getScreenCTM().inverse();
  return svgPoint.matrixTransform(matrix);
};

/**
 * Bind an event to a function call.
 * @param {!Element} element Element upon which to listen.
 * @param {string} name Event name to listen to (e.g. 'mousedown').
 * @param {!Function} func Function to call when event is triggered.
 * @private
 */
Slider.bindEvent_ = function(element, name, func) {
  element.addEventListener(name, func, false);
};

module.exports = Slider;
