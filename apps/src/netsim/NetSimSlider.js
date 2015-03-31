/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxstatements: 200
 */
/* global $ */
'use strict';

var utils = require('../utils');
var markup = require('./NetSimSlider.html');
var i18n = require('../../locale/current/netsim');

/**
 * @type {number}
 * @const
 */
var SLIDER_DEFAULT_MIN_VALUE = 0;

/**
 * @type {number}
 * @const
 */
var SLIDER_DEFAULT_MAX_VALUE = 100;

/**
 *
 * @constructor
 * @param {jQuery} rootDiv - element whose content we replace with the slider
 *        on render()
 * @param {Object} options
 * @param {function} onChange - a function invoked whenever the slider-value
 *        is changed by the student.  Passed the new value as an argument.
 * @param {number} value - Initial value of the slider
 * @param {number} min - Lowest possible value of the slider; next-to-lowest
 *        if lowerBoundInfinite is true.
 * @param {number} max - Highest possible value of the slider; next-to-highest
 *        if upperBoundInfinite is true.
 * @param {number} step - Step-value of jQueryUI slider - not necessarily
 *        related to min and max values if you provide custom value converters.
 * @param {boolean} upperBoundInfinite
 * @param {boolean} lowerBoundInfinite
 */
var NetSimSlider = module.exports = function (rootDiv, options) {
  /**
   * Unique instance ID for this panel, in case we have several
   * of them on a page.
   * @type {number}
   * @private
   */
  this.instanceID_ = NetSimSlider.uniqueIDCounter;
  NetSimSlider.uniqueIDCounter++;

  /**
   * @type {jQuery}
   * @private
   */
  this.rootDiv_ = rootDiv;

  /**
   * Reference to the jQuery slider we create internally.
   * @type {jQuery}
   * @private
   */
  this.jQuerySlider_ = null;

  /**
   * A function invoked whenever the slider-value is changed by the student.
   * Passed the new value (not slider position) as an argument.
   * @type function
   * @private
   */
  this.changeCallback_ = utils.valueOr(options.onChange, function () {});

  /**
   * @type {number}
   * @private
   */
  this.minValue_ = utils.valueOr(options.min, SLIDER_DEFAULT_MIN_VALUE);

  /**
   * @type {number}
   * @private
   */
  this.maxValue_ = utils.valueOr(options.max, SLIDER_DEFAULT_MAX_VALUE);

  /**
   * The current (outward-facing) value of the slider.
   * @type {number}
   * @private
   */
  this.value_ = utils.valueOr(options.value, this.minValue_);

  /**
   * Whether the slider maximum value should be Infinity.
   * @type {boolean}
   * @private
   */
  this.isUpperBoundInfinite_ = utils.valueOr(options.upperBoundInfinite, false);

  /**
   * Whether the slider minimimum value should be -Infinity.
   * @type {boolean}
   * @private
   */
  this.isLowerBoundInfinite_ = utils.valueOr(options.lowerBoundInfinite, false);

  /**
   * @type {number}
   * @private
   */
  this.step_ = utils.valueOr(options.step, 1);
};

/**
 * Static counter used to generate/uniquely identify different instances
 * of this component on the page
 * @type {number}
 */
NetSimSlider.uniqueIDCounter = 0;

/**
 * Fill the root div with new elements reflecting the current state
 */
NetSimSlider.prototype.render = function () {
  var renderedMarkup = $(markup({
    instanceID: this.instanceID_,
    minValue: this.valueToLabel(this.minValue_),
    maxValue: this.valueToLabel(this.maxValue_)
  }));
  this.rootDiv_.html(renderedMarkup);

  var sliderMinimum = this.valueToSliderPosition(
      this.isLowerBoundInfinite_ ? -Infinity : this.minValue_);
  var sliderMaximum = this.valueToSliderPosition(
      this.isUpperBoundInfinite_ ? Infinity : this.maxValue_);
  this.rootDiv_.find('.slider')
      .slider({
        value: this.valueToSliderPosition(this.value_),
        min: sliderMinimum,
        max: sliderMaximum,
        step: this.step_,
        slide: this.onSliderValueChange_.bind(this)
      });
  this.setLabelFromValue_(this.value_);
};

/**
 * External access to set the value of the slider.
 * @param {number} newValue
 */
NetSimSlider.prototype.setValue = function (newValue) {
  if (this.value_ === newValue) {
    return;
  }

  this.value_ = newValue;
  this.jQuerySlider_.slider('option', 'value', this.valueToSliderPosition(newValue));
  this.setLabelFromValue_(newValue);
};

/**
 * @private
 */
NetSimSlider.prototype.onSliderValueChange_ = function (event, ui) {
  var newValue = this.sliderPositionToValue(ui.value);
  this.value_ = newValue;
  this.setLabelFromValue_(newValue);
  this.changeCallback_(newValue);
};

/**
 * Updates the slider label to localize and display the given value.
 * @param {number} val - slider value to display
 * @private
 */
NetSimSlider.prototype.setLabelFromValue_ = function (val) {
  this.rootDiv_.find('.slider-value').text(this.valueToLabel(val));
};

/**
 * Converts the given value into an internal value we can pass to the
 * jQueryUI slider control.
 * @param {number} val - external-facing value
 * @returns {number} - internal slider value
 */
NetSimSlider.prototype.valueToSliderPosition = function (val) {
  if (this.isUpperBoundInfinite_ && val > this.maxValue_) {
    return this.valueToSliderPosition(this.maxValue_) + this.step_;
  } else if (this.isLowerBoundInfinite_ && val < this.minValue_) {
    return this.valueToSliderPosition(this.minValue_) - this.step_;
  }
  return Math.max(this.minValue_, Math.min(this.maxValue_, val));
};

/**
 * Converts the internal jQueryUI slider value into an external-facing
 * value for this control.
 * Should be an inverse of valueToSliderPosition
 * @param {number} pos - internal slider value
 * @returns {number} - external-facing value
 */
NetSimSlider.prototype.sliderPositionToValue = function (pos) {
  if (pos > this.valueToSliderPosition(this.maxValue_)) {
    return this.isUpperBoundInfinite_ ? Infinity : this.maxValue_;
  } else if (pos < this.valueToSliderPosition(this.minValue_)) {
    return this.isLowerBoundInfinite_ ? -Infinity : this.minValue_;
  }
  return pos;
};

/**
 * Converts an external-facing numeric value into a localized string
 * representation of that value.
 * @param {number} val - numeric value of the control
 * @returns {string} - localized string representation of value
 */
NetSimSlider.prototype.valueToLabel = function (val) {
  if (val === Infinity || val === -Infinity) {
    return i18n.unlimited();
  }
  return val;
};

/**
 * Default minimum of zero is useless to a logarithmic scale
 * @type {number}
 * @const
 */
var LOGARITHMIC_DEFAULT_MIN_VALUE = 1;

/**
 * @param rootDiv
 * @param options
 * @constructor
 * @augments NetSimSlider
 */
NetSimSlider.LogarithmicSlider = function (rootDiv, options) {
  options.min = utils.valueOr(options.min, LOGARITHMIC_DEFAULT_MIN_VALUE);
  NetSimSlider.call(this, rootDiv, options);
  this.calculateSliderBounds_();
};
NetSimSlider.LogarithmicSlider.inherits(NetSimSlider);

NetSimSlider.LogarithmicSlider.prototype.calculateSliderBounds_ = function () {
  // Pick boundary slider values
  this.maxSliderPosition = Math.floor(Math.log(this.maxValue_) / Math.LN2);
  // Add a step if we don't already land exactly on a step, to
  // compensate for the floor() operation
  if (Math.pow(2, this.maxSliderPosition) !== this.maxValue_) {
    this.maxSliderPosition += this.step_;
  }
  this.minSliderPosition = Math.floor(Math.log(this.minValue_) / Math.LN2);

  // Pick infinity slider values
  this.infinitySliderPosition = this.maxSliderPosition + this.step_;
  this.negInfinitySliderPosition = this.minSliderPosition - this.step_;
};

/**
 * Converts the given value into an internal value we can pass to the
 * jQueryUI slider control.
 * @param {number} val - external-facing value
 * @returns {number} - internal slider value
 * @override
 */
NetSimSlider.LogarithmicSlider.prototype.valueToSliderPosition = function (val) {
  if (val > this.maxValue_) {
    return this.isUpperBoundInfinite_ ?
        this.infinitySliderPosition : this.maxSliderPosition;
  } else if (val === this.maxValue_) {
    return  this.maxSliderPosition;
  } else if (val < this.minValue_) {
    return this.isLowerBoundInfinite_ ?
        this.negInfinitySliderPosition : this.minSliderPosition
  } else if (val === this.minValue_) {
    return this.minSliderPosition;
  }
  return Math.max(this.minSliderPosition, Math.floor(Math.log(val) / Math.LN2));
};

/**
 * Converts the internal jQueryUI slider value into an external-facing
 * value for this control.
 * Should be an inverse of valueToSliderPosition
 * @param {number} pos - internal slider value
 * @returns {number} - external-facing value
 * @override
 */
NetSimSlider.LogarithmicSlider.prototype.sliderPositionToValue = function (pos) {
  if (pos > this.maxSliderPosition) {
    return this.isUpperBoundInfinite_ ? Infinity : this.maxValue_;
  } else if (pos === this.maxSliderPosition) {
    return this.maxValue_;
  } else if (pos < this.minSliderPosition) {
    return this.isLowerBoundInfinite_ ? -Infinity : this.minValue_;
  } else if (pos === this.minSliderPosition) {
    return this.minValue_;
  }
  return Math.pow(2, pos);
};
