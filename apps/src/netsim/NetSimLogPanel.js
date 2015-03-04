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
var markup = require('./NetSimLogPanel.html');
var packetMarkup = require('./NetSimLogPacket.html');
var NetSimPanel = require('./NetSimPanel');
var NetSimEncodingControl = require('./NetSimEncodingControl');

/**
 * Generator and controller for message log.
 * @param {jQuery} rootDiv
 * @param {string} logTitle
 * @param {boolean} [isMinimized] defaults to FALSE
 * @constructor
 * @augments NetSimPanel
 */
var NetSimLogPanel = module.exports = function (rootDiv, logTitle, isMinimized) {
  /**
   * List of controllers for currently displayed packets.
   * @type {Array.<NetSimLogPacket>}
   * @private
   */
  this.packets_ = [];

  /**
   * A message encoding (display) setting.
   * @type {string}
   * @private
   */
  this.currentEncoding_ = 'all';

  /**
   * Current chunk size (bytesize) for intepreting binary in the log.
   * @type {number}
   * @private
   */
  this.currentChunkSize_ = 8;

  // Initial render
  NetSimPanel.call(this, rootDiv, {
    className: 'netsim_log_panel',
    panelTitle: logTitle,
    beginMinimized: isMinimized
  });
};
NetSimLogPanel.inherits(NetSimPanel);

NetSimLogPanel.prototype.render = function () {
  // Create boilerplate panel markup
  NetSimLogPanel.superPrototype.render.call(this);

  // Add our own content markup
  var newMarkup = $(markup({
    logInstanceID: this.instanceID_,
    logTitle: this.logTitle_
  }));
  this.getBody().html(newMarkup);

  // Add a clear button to the panel header
  this.addButton('Clear', this.onClearButtonPress_.bind(this));

  // Bind reference to scrollArea for use when logging.
  this.scrollArea_ = this.getBody().find('.scroll_area');

  // TODO: Hide columns by configuration
  this.getBody().find('th.packetInfo, td.packetInfo').hide();
};

/**
 * Remove all packets from the log, resetting its state.
 * @private
 */
NetSimLogPanel.prototype.onClearButtonPress_ = function () {
  this.scrollArea_.empty();
  this.packets_ = [];
};

/**
 * Put a message into the log.
 */
NetSimLogPanel.prototype.log = function (packetBinary) {
  var scrollArea = this.scrollArea_;
  var wasScrolledToEnd =
      scrollArea[0].scrollHeight - scrollArea[0].scrollTop <=
      scrollArea.outerHeight();

  var newPacket = new NetSimLogPacket(packetBinary,
      this.currentEncoding_,
      this.currentChunkSize_);
  newPacket.getRoot().appendTo(this.scrollArea_);
  this.packets_.push(newPacket);

  // Auto-scroll
  if (wasScrolledToEnd) {
    scrollArea.scrollTop(scrollArea[0].scrollHeight);
  }
};

/**
 * Show or hide parts of the send UI based on the currently selected encoding
 * mode.
 * @param {string} newEncoding
 */
NetSimLogPanel.prototype.setEncoding = function (newEncoding) {
  this.currentEncoding_ = newEncoding;
  this.packets_.forEach(function (packet) {
    packet.setEncoding(newEncoding);
  });
};

/**
 * Change how binary input in interpreted and formatted in the log.
 * @param {number} newChunkSize
 */
NetSimLogPanel.prototype.setChunkSize = function (newChunkSize) {
  this.currentChunkSize_ = newChunkSize;
  this.packets_.forEach(function (packet) {
    packet.setChunkSize(newChunkSize);
  });
};

/**
 * A component/controller for display of an individual packet in the log.
 * @param {string} packetBinary - raw packet data
 * @param {string} encoding - which display style to use initially
 * @param {number} chunkSize - (or bytesize) to use when interpreting and
 *        formatting the data.
 * @constructor
 */
var NetSimLogPacket = function (packetBinary, encoding, chunkSize) {
  /**
   * @type {string}
   * @private
   */
  this.packetBinary_ = packetBinary;

  /**
   * @type {string}
   * @private
   */
  this.encoding_ = encoding;

  /**
   * @type {number}
   * @private
   */
  this.chunkSize_ = chunkSize;

  /**
   * Wrapper div that we create once, and fill repeatedly with render()
   * @type {jQuery}
   * @private
   */
  this.rootDiv_ = $('<div>').addClass('packet');

  // Initial content population
  this.render();
};

/**
 * Re-render div contents to represent the packet in a different way.
 */
NetSimLogPacket.prototype.render = function () {
  var rawMarkup = packetMarkup({
    packetBinary: this.packetBinary_,
    chunkSize: this.chunkSize_
  });
  var jQueryWrap = $(rawMarkup);
  NetSimEncodingControl.hideRowsByEncoding(jQueryWrap, this.encoding_);
  // TODO: Hide columns by configuration
  jQueryWrap.find('th.packetInfo, td.packetInfo').hide();
  this.rootDiv_.html(jQueryWrap);
};

/**
 * Return root div, for hooking up to a parent element.
 * @returns {jQuery}
 */
NetSimLogPacket.prototype.getRoot = function () {
  return this.rootDiv_;
};

/**
 * Change encoding-display setting and re-render packet contents accordingly.
 * @param {string} newEncoding
 */
NetSimLogPacket.prototype.setEncoding = function (newEncoding) {
  this.encoding_ = newEncoding;
  this.render();
};

/**
 * Change chunk size for interpreting data and re-render packet contents
 * accordingly.
 * @param {number} newChunkSize
 */
NetSimLogPacket.prototype.setChunkSize = function (newChunkSize) {
  this.chunkSize_ = newChunkSize;
  this.render();
};
