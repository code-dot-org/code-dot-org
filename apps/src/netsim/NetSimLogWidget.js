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
var dom = require('../dom');
var NetSimEncodingSelector = require('./NetSimEncodingSelector');

/**
 * Generator and controller for message log.
 * @constructor
 */
var NetSimLogWidget = module.exports = function () {
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
};

/**
 * Static counter used to generate/uniquely identify different instances
 * of this log widget on the page.
 * @type {number}
 */
NetSimLogWidget.uniqueIDCounter = 0;

/**
 * Generate a new NetSimLogWidget, putting it on the page.
 * @param element
 * @param {!string} title - The log widget header text
 */
NetSimLogWidget.createWithin = function (element, title) {
  var controller = new NetSimLogWidget();

  var instanceID = NetSimLogWidget.uniqueIDCounter;
  NetSimLogWidget.uniqueIDCounter++;

  element.innerHTML = markup({
    logInstanceID: instanceID,
    logTitle: title
  });
  controller.bindElements_(instanceID);
  return controller;
};

/**
 * Get relevant elements from the page and bind them to local variables.
 * @private
 */
NetSimLogWidget.prototype.bindElements_ = function (instanceID) {
  this.rootDiv_ = $('#netsim_log_widget_' + instanceID);
  this.scrollArea_ = this.rootDiv_.find('.scroll_area');
  this.clearButton_ = this.rootDiv_.find('.clear_button');

  dom.addClickTouchEvent(this.clearButton_[0], this.onClearButtonPress_.bind(this));
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

/**
 *
 * @param {string} packetBinary
 * @param {string} encoding
 * @param {number} chunkSize
 * @constructor
 */
var NetSimLogPacket = function (packetBinary, encoding, chunkSize) {
  this.packetBinary_ = packetBinary;
  this.encoding_ = encoding;
  this.chunkSize_ = chunkSize;

  // Create wrapper markup
  this.rootDiv_ = $('<div>').addClass('packet');
  this.render();
};

NetSimLogPacket.prototype.render = function () {
  var internalMarkup = $(packetMarkup({
    packetBinary: this.packetBinary_,
    chunkSize: this.chunkSize_
  }));
  NetSimEncodingSelector.hideRowsByEncoding(internalMarkup, this.encoding_);
  this.rootDiv_.html(internalMarkup);
};

NetSimLogPacket.prototype.getRoot = function () {
  return this.rootDiv_;
};

NetSimLogPacket.prototype.setEncoding = function (newEncoding) {
  this.encoding_ = newEncoding;
  this.render();
};

NetSimLogPacket.prototype.setChunkSize = function (newChunkSize) {
  this.chunkSize_ = newChunkSize;
  this.render();
};