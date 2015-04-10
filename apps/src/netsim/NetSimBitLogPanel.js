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

require('../utils'); // For Function.prototype.inherits()
var i18n = require('../../locale/current/netsim');
var markup = require('./NetSimBitLogPanel.html');
var NetSimPanel = require('./NetSimPanel');
var NetSimEncodingControl = require('./NetSimEncodingControl');

/**
 * Generator and controller for bit-log, which receives bits one at a time.
 * @param {jQuery} rootDiv
 * @param {Object} options
 * @param {string} options.logTitle
 * @param {boolean} [options.isMinimized] defaults to FALSE
 * @constructor
 * @augments NetSimPanel
 * @implements INetSimLogPanel
 */
var NetSimBitLogPanel = module.exports = function (rootDiv, options) {
  /**
   * The current binary contents of the log panel
   * @type {string}
   * @private
   */
  this.binary_ = '';

  /**
   * A message encoding (display) setting.
   * @type {string}
   * @private
   */
  this.encodings_ = [];

  /**
   * Current chunk size (bytesize) for interpreting binary in the log.
   * @type {number}
   * @private
   */
  this.chunkSize_ = 8;

  /**
   * Localized panel title
   * @type {string}
   * @private
   */
  this.logTitle_ = options.logTitle;

  // Initial render
  NetSimPanel.call(this, rootDiv, {
    className: 'netsim-log-panel',
    panelTitle: options.logTitle,
    beginMinimized: options.isMinimized
  });
};
NetSimBitLogPanel.inherits(NetSimPanel);

NetSimBitLogPanel.prototype.render = function () {
  // Create boilerplate panel markup
  NetSimBitLogPanel.superPrototype.render.call(this);

  // Add our own content markup
  var newMarkup = $(markup({
    binary: this.binary_,
    enabledEncodings: this.encodings_,
    chunkSize: this.chunkSize_
  }));
  this.getBody().html(newMarkup);
  NetSimEncodingControl.hideRowsByEncoding(this.getBody(), this.encodings_);

  // Add a clear button to the panel header
  this.addButton(i18n.clear(), this.onClearButtonPress_.bind(this));

  // Bind reference to scrollArea for use when logging.
  this.scrollArea_ = this.getBody().find('.scroll_area');
};

/**
 * Remove all packets from the log, resetting its state.
 * @private
 */
NetSimBitLogPanel.prototype.onClearButtonPress_ = function () {
  this.binary_ = '';
  this.render();
};

/**
 * Put a message into the log.
 * @param {string} binaryBit
 */
NetSimBitLogPanel.prototype.log = function (binaryBit) {
  this.binary_ += binaryBit.toString();
  this.render();
};

/**
 * Show or hide parts of the send UI based on the currently selected encoding
 * mode.
 * @param {EncodingType[]} newEncodings
 */
NetSimBitLogPanel.prototype.setEncodings = function (newEncodings) {
  this.encodings_ = newEncodings;
  this.render();
};

/**
 * Change how binary input in interpreted and formatted in the log.
 * @param {number} newChunkSize
 */
NetSimBitLogPanel.prototype.setChunkSize = function (newChunkSize) {
  this.chunkSize_ = newChunkSize;
  this.render();
};
