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

var markup = require('./NetSimLogWidget.html');
var packetMarkup = require('./NetSimLogPacket.html');
var NetSimEncodingControl = require('./NetSimEncodingControl');

/**
 * Generator and controller for message log.
 * @param {jQuery} rootDiv
 * @param {string} logTitle
 * @param {boolean} [isMinimized] defaults to FALSE
 * @constructor
 */
var NetSimLogWidget = module.exports = function (rootDiv, logTitle, isMinimized) {

  /**
   * Unique instance ID for this panel, in case we have several
   * of them on a page.
   * @type {number}
   * @private
   */
  this.instanceID_ = NetSimLogWidget.uniqueIDCounter;
  NetSimLogWidget.uniqueIDCounter++;

  /**
   * Component root, which we fill whenever we call render()
   * @type {jQuery}
   * @private
   */
  this.rootDiv_ = rootDiv;

  /**
   * @type {string}
   * @private
   */
  this.logTitle_ = logTitle;

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

  /**
   * Whether this panel is currently minimized.
   * @type {boolean}
   * @private
   */
  this.isMinimized_ = isMinimized !== undefined ? isMinimized : false;

  // Initial render
  this.render();
};

/**
 * Static counter used to generate/uniquely identify different instances
 * of this log widget on the page.
 * @type {number}
 */
NetSimLogWidget.uniqueIDCounter = 0;

NetSimLogWidget.prototype.render = function () {
  var newMarkup = $(markup({
    logInstanceID: this.instanceID_,
    logTitle: this.logTitle_
  }));
  this.rootDiv_.html(newMarkup);

  this.scrollArea_ = this.rootDiv_.find('.scroll_area');
  this.hideButton_ = this.rootDiv_.find('.hide_button');
  this.hideButton_.click(this.onHideButtonPress_.bind(this));

  this.clearButton_ = this.rootDiv_.find('.clear_button');
  this.clearButton_.click(this.onClearButtonPress_.bind(this));

  // TODO: Hide columns by configuration
  this.rootDiv_.find('th.packetInfo, td.packetInfo').hide();

  this.setMinimized(this.isMinimized_);
};

/**
 * Remove all packets from the log, resetting its state.
 * @private
 */
NetSimLogWidget.prototype.onClearButtonPress_ = function () {
  this.scrollArea_.empty();
  this.packets_ = [];
};

/**
 * Toggle whether this panel is minimized.
 * @private
 */
NetSimLogWidget.prototype.onHideButtonPress_ = function () {
  this.setMinimized(!this.isMinimized_);
};

/**
 * Put a message into the log.
 */
NetSimLogWidget.prototype.log = function (packetBinary) {
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
NetSimLogWidget.prototype.setEncoding = function (newEncoding) {
  this.currentEncoding_ = newEncoding;
  this.packets_.forEach(function (packet) {
    packet.setEncoding(newEncoding);
  });
};

/**
 * Change how binary input in interpreted and formatted in the log.
 * @param {number} newChunkSize
 */
NetSimLogWidget.prototype.setChunkSize = function (newChunkSize) {
  this.currentChunkSize_ = newChunkSize;
  this.packets_.forEach(function (packet) {
    packet.setChunkSize(newChunkSize);
  });
};

NetSimLogWidget.prototype.setMinimized = function (becomeMinimized) {
  var panelDiv = this.rootDiv_.find('.netsim_panel');
  var hideButton = panelDiv.find('.hide_button');
  if (becomeMinimized) {
    panelDiv.addClass('minimized');
    hideButton.html('Show');
  } else {
    panelDiv.removeClass('minimized');
    hideButton.html('Hide');
  }
  this.isMinimized_ = becomeMinimized;
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
