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

var markup = require('./NetSimPacketSizeControl.html');

/**
 * @type {number}
 * @const
 */
var SLIDER_INFINITY_VALUE = 1025;

/**
 * Generator and controller for packet size slider/selector
 * @param {jQuery} rootDiv
 * @param {function} packetSizeChangeCallback
 * @constructor
 */
var NetSimPacketSizeControl = module.exports = function (rootDiv,
    packetSizeChangeCallback) {
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
  var renderedMarkup = $(markup({}));
  this.rootDiv_.html(renderedMarkup);
  this.rootDiv_.find('.packet-size-slider').slider({
    value: this.maxPacketSize_,
    min: 16,
    max: SLIDER_INFINITY_VALUE,
    step: 1,
    slide: this.onPacketSizeChange_.bind(this)
  });
  this.setPacketSize(this.maxPacketSize_);
};

NetSimPacketSizeControl.prototype.packetSizeToSliderValue_ = function (packetSize) {
  if (packetSize === Infinity) {
    return SLIDER_INFINITY_VALUE;
  }
  return packetSize;
};

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
  rootDiv.find('.packet_size_value').html(newPacketSize);
};
