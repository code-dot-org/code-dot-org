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

var markup = require('./NetSimPacketSizeControl.html.ejs');
var i18n = require('./locale');

/**
 * @type {number}
 * @const
 */
var SLIDER_INFINITY_VALUE = 1025;

/**
 * Generator and controller for packet size slider/selector
 * @param {jQuery} rootDiv
 * @param {function} packetSizeChangeCallback
 * @param {Object} options
 * @param {number} options.minimumPacketSize
 * @param {number} options.sliderStepValue
 * @constructor
 */
var NetSimPacketSizeControl = module.exports = function (rootDiv,
    packetSizeChangeCallback, options) {
  /**
   * Component root, which we fill whenever we call render()
   * @type {jQuery}
   * @private
   */
  this.rootDiv_ = rootDiv;

  /**
   * @type {function}
   * @private
   */
  this.packetSizeChangeCallback_ = packetSizeChangeCallback;

  /**
   * @type {number}
   * @private
   */
  this.minimumPacketSize_ = options.minimumPacketSize;

  /**
   * @type {number}
   * @private
   */
  this.sliderStepValue_ = options.sliderStepValue;

  /**
   * Internal state
   * @type {number}
   * @private
   */
  this.maxPacketSize_ = Infinity;

  this.render();
};

/**
 * Fill the root div with new elements reflecting the current state
 */
NetSimPacketSizeControl.prototype.render = function () {
  var renderedMarkup = $(markup({
    minValue: this.minimumPacketSize_,
    maxValue: i18n.unlimited()
  }));
  this.rootDiv_.html(renderedMarkup);
  this.rootDiv_.find('.packet-size-slider').slider({
    value: this.maxPacketSize_,
    min: this.minimumPacketSize_,
    max: SLIDER_INFINITY_VALUE,
    step: this.sliderStepValue_,
    slide: this.onPacketSizeChange_.bind(this)
  });
  this.setPacketSize(this.maxPacketSize_);
};

/**
 * @param {number} packetSize - up to Infinity
 * @returns {number} a value the slider can handle
 * @private
 */
NetSimPacketSizeControl.prototype.packetSizeToSliderValue_ = function (packetSize) {
  if (packetSize === Infinity) {
    return SLIDER_INFINITY_VALUE;
  }
  return packetSize;
};

/**
 * @param {number} sliderValue - value from the slider control
 * @returns {number} the packet size it maps to, up to Infinity
 * @private
 */
NetSimPacketSizeControl.prototype.sliderValueToPacketSize_ = function (sliderValue) {
  if (sliderValue === SLIDER_INFINITY_VALUE) {
    return Infinity;
  }
  return sliderValue;
};

/**
 * Change handler for jQueryUI slider control.
 * @param {Event} event
 * @param {Object} ui
 * @param {jQuery} ui.handle - The jQuery object representing the handle that
 *        was changed.
 * @param {number} ui.value - The current value of the slider.
 * @private
 */
NetSimPacketSizeControl.prototype.onPacketSizeChange_ = function (event, ui) {
  var newPacketSize = this.sliderValueToPacketSize_(ui.value);
  this.setPacketSize(newPacketSize);
  this.packetSizeChangeCallback_(newPacketSize);
};

/**
 * Update the slider and its label to display the provided value.
 * @param {number} newPacketSize
 */
NetSimPacketSizeControl.prototype.setPacketSize = function (newPacketSize) {
  var rootDiv = this.rootDiv_;
  this.maxPacketSize_ = newPacketSize;
  rootDiv.find('.packet-size-slider').slider('option', 'value',
      this.packetSizeToSliderValue_(newPacketSize));
  rootDiv.find('.packet_size_value').text(this.getPacketSizeText(newPacketSize));
};

/**
 * Get localized packet size description for the given packet size.
 * @param {number} packetSize
 * @returns {string}
 */
NetSimPacketSizeControl.prototype.getPacketSizeText = function (packetSize) {
  if (packetSize === Infinity) {
    return i18n.unlimited();
  }
  return i18n.numBitsPerPacket({ x: packetSize });
};
