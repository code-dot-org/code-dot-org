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

var markup = require('./NetSimMyDeviceTab.html');

/**
 * Generator and controller for message encoding selector: A dropdown that
 * controls whether messages are displayed in some combination of binary, hex,
 * decimal, ascii, etc.
 * @param {jQuery} rootDiv
 * @param {function} chunkSizeChangeCallback
 * @constructor
 */
var NetSimMyDeviceTab = module.exports = function (rootDiv, chunkSizeChangeCallback) {
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
   *
   * @type {number}
   * @private
   */
  this.currentChunkSize_ = 8;

  this.render();
};

/**
 * Fill the root div with new elements reflecting the current state
 */
NetSimMyDeviceTab.prototype.render = function () {
  var renderedMarkup = $(markup({}));
  this.rootDiv_.html(renderedMarkup);
  this.bindElements_();
};

/**
 * Get relevant elements from the page and bind them to local variables.
 * @private
 */
NetSimMyDeviceTab.prototype.bindElements_ = function () {
  var rootDiv = this.rootDiv_;
  rootDiv.find('.chunk_size_slider').slider({
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
NetSimMyDeviceTab.prototype.onChunkSizeChange_ = function (event, ui) {
  var newChunkSize = ui.value;
  this.setChunkSize(newChunkSize);
  this.chunkSizeChangeCallback_(newChunkSize);
};

/**
 * Update the slider and its label to display the provided value.
 * @param {number} newChunkSize
 */
NetSimMyDeviceTab.prototype.setChunkSize = function (newChunkSize) {
  var rootDiv = this.rootDiv_;
  this.currentChunkSize_ = newChunkSize;
  rootDiv.find('.chunk_size_slider').slider('option', 'value', newChunkSize);
  rootDiv.find('.chunk_size_value').html(newChunkSize + ' bits');
};


