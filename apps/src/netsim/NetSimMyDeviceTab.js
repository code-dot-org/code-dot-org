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
var NetSimChunkSizeControl = require('./NetSimChunkSizeControl');

/**
 * Generator and controller for "My Device" tab.
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
   * @type {NetSimChunkSizeControl}
   * @private
   */
  this.chunkSizeControl_ = null;

  this.render();
};

/**
 * Fill the root div with new elements reflecting the current state
 */
NetSimMyDeviceTab.prototype.render = function () {
  var renderedMarkup = $(markup({}));
  this.rootDiv_.html(renderedMarkup);
  this.chunkSizeControl_ = new NetSimChunkSizeControl(
      this.rootDiv_.find('.chunk_size'),
      this.chunkSizeChangeCallback_);
};

/**
 * Update the slider and its label to display the provided value.
 * @param {number} newChunkSize
 */
NetSimMyDeviceTab.prototype.setChunkSize = function (newChunkSize) {
  this.chunkSizeControl_.setChunkSize(newChunkSize);
};
