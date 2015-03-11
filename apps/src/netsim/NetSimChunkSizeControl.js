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

var markup = require('./NetSimChunkSizeControl.html');
var EncodingType = require('./netsimConstants').EncodingType;

/**
 * Generator and controller for chunk size slider/selector
 * @param {jQuery} rootDiv
 * @param {function} chunkSizeChangeCallback
 * @constructor
 */
var NetSimChunkSizeControl = module.exports = function (rootDiv,
    chunkSizeChangeCallback) {
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
  this.chunkSizeChangeCallback_ = chunkSizeChangeCallback;

  /**
   * Internal state
   * @type {number}
   * @private
   */
  this.currentChunkSize_ = 8;

  /**
   * Fill in the blank: "8 bits per _"
   * @type {Array.<String>}
   * @private
   */
  this.currentUnits_ = ['byte'];

  this.render();
};

/**
 * Fill the root div with new elements reflecting the current state
 */
NetSimChunkSizeControl.prototype.render = function () {
  var renderedMarkup = $(markup({}));
  this.rootDiv_.html(renderedMarkup);
  this.rootDiv_.find('.chunk_size_slider').slider({
    value: this.currentChunkSize_,
    min: 1,
    max: 32,
    step: 1,
    slide: this.onChunkSizeChange_.bind(this)
  });
  this.setChunkSize(this.currentChunkSize_);
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
NetSimChunkSizeControl.prototype.onChunkSizeChange_ = function (event, ui) {
  var newChunkSize = ui.value;
  this.setChunkSize(newChunkSize);
  this.chunkSizeChangeCallback_(newChunkSize);
};

/**
 * Update the slider and its label to display the provided value.
 * @param {number} newChunkSize
 */
NetSimChunkSizeControl.prototype.setChunkSize = function (newChunkSize) {
  var rootDiv = this.rootDiv_;
  this.currentChunkSize_ = newChunkSize;
  rootDiv.find('.chunk_size_slider').slider('option', 'value', newChunkSize);
  rootDiv.find('.chunk_size_value').html(newChunkSize);
};

/**
 * @param {EncodingType[]} newEncodings
 */
NetSimChunkSizeControl.prototype.setEncodings = function (newEncodings) {
  this.currentUnits_ = [];

  if (newEncodings.indexOf(EncodingType.ASCII) > -1) {
    this.currentUnits_.push('character'); // TODO: localize
  }

  if (newEncodings.indexOf(EncodingType.DECIMAL) > -1) {
    this.currentUnits_.push('number'); // TODO: localize
  }

  if (this.currentUnits_.length === 0){
    this.currentUnits_.push('byte'); // TODO: localize
  }

  this.rootDiv_.find('.unit_label').html(this.currentUnits_.join('/'));
};
