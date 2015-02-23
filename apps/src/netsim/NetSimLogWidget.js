/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxparams: 3,
 maxstatements: 200
 */
/* global $ */
'use strict';

var markup = require('./NetSimLogWidget.html');
var dom = require('../dom');
var PacketEncoder = require('./PacketEncoder');
var dataConverters = require('./dataConverters');
var formatBinary = dataConverters.formatBinary;
var formatHex = dataConverters.formatHex;
var alignDecimal = dataConverters.alignDecimal;
var binaryToInt = dataConverters.binaryToInt;
var binaryToHex = dataConverters.binaryToHex;
var binaryToDecimal = dataConverters.binaryToDecimal;
var binaryToAscii = dataConverters.binaryToAscii;

/**
 * Generator and controller for message log.
 * @constructor
 */
var NetSimLogWidget = module.exports = function () {
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
  this.tableBody_ = this.scrollArea_.find('tbody');
  this.clearButton_ = this.rootDiv_.find('.clear_button');

  dom.addClickTouchEvent(this.clearButton_[0], this.onClearButtonPress_.bind(this));
};

NetSimLogWidget.prototype.onClearButtonPress_ = function () {
  this.tableBody_.empty();
};

/**
 * Format router uses to decode packet.
 * TODO (bbuchanan): Pull this from a common location; should be fixed across
 *                   simulation.
 * @type {PacketEncoder}
 */
var packetEncoder = new PacketEncoder([
  { key: 'toAddress', bits: 4 },
  { key: 'fromAddress', bits: 4 },
  { key: 'packetIndex', bits: 4 },
  { key: 'packetCount', bits: 4 },
  { key: 'message', bits: Infinity }
]);

/**
 * Put a message into the log.
 */
NetSimLogWidget.prototype.log = function (packet) {
  var scrollArea = this.scrollArea_;
  var wasScrolledToEnd =
      scrollArea[0].scrollHeight - scrollArea[0].scrollTop <=
      scrollArea.outerHeight();

  var toAddress = packetEncoder.getField('toAddress', packet);
  var fromAddress = packetEncoder.getField('fromAddress', packet);
  var packetIndex = packetEncoder.getField('packetIndex', packet);
  var packetCount = packetEncoder.getField('packetCount', packet);
  var message = packetEncoder.getField('message', packet);

  // Create log rows
  var asciiRow = $('<tr>').addClass('ascii');
  $('<td nowrap>')
      .addClass('toAddress')
      .html(binaryToInt(toAddress))
      .appendTo(asciiRow);
  $('<td nowrap>')
      .addClass('fromAddress')
      .html(binaryToInt(fromAddress))
      .appendTo(asciiRow);
  $('<td nowrap>')
      .addClass('packetInfo')
      .html(binaryToInt(packetIndex) + " of " + binaryToInt(packetCount))
      .appendTo(asciiRow);
  $('<td>')
      .addClass('message')
      .html(binaryToAscii(message, 8))
      .appendTo(asciiRow);

  var decimalRow = $('<tr>').addClass('decimal');
  $('<td nowrap>')
      .addClass('toAddress')
      .html(binaryToInt(toAddress))
      .appendTo(decimalRow);
  $('<td nowrap>')
      .addClass('fromAddress')
      .html(binaryToInt(fromAddress))
      .appendTo(decimalRow);
  $('<td nowrap>')
      .addClass('packetInfo')
      .html(binaryToInt(packetIndex) + " of " + binaryToInt(packetCount))
      .appendTo(decimalRow);
  // TODO (bbuchanan): Parse at selected bytesize
  $('<td>')
      .addClass('message')
      .html(alignDecimal(binaryToDecimal(message, 8)))
      .appendTo(decimalRow);

  var hexRow = $('<tr>').addClass('hexadecimal');
  $('<td nowrap>')
      .addClass('toAddress')
      .html(binaryToHex(toAddress))
      .appendTo(hexRow);
  $('<td nowrap>')
      .addClass('fromAddress')
      .html(binaryToHex(fromAddress))
      .appendTo(hexRow);
  $('<td nowrap>')
      .addClass('packetInfo')
      .html(binaryToHex(packetIndex) + " of " + binaryToHex(packetCount))
      .appendTo(hexRow);
  $('<td>')
      .addClass('message')
      .html(formatHex(binaryToHex(message), 2))
      .appendTo(hexRow);

  var binaryRow = $('<tr>').addClass('binary');
  $('<td nowrap>')
      .addClass('toAddress')
      .html(formatBinary(toAddress, 4))
      .appendTo(binaryRow);
  $('<td nowrap>')
      .addClass('fromAddress')
      .html(formatBinary(fromAddress, 4))
      .appendTo(binaryRow);
  $('<td nowrap>')
      .addClass('packetInfo')
      .html(formatBinary(packetIndex + packetCount, 4))
      .appendTo(binaryRow);
  // TODO (bbuchanan): Format to selected bytesize
  $('<td>')
      .addClass('message')
      .html(formatBinary(message, 8))
      .appendTo(binaryRow);

  asciiRow.appendTo(this.tableBody_);
  decimalRow.appendTo(this.tableBody_);
  hexRow.appendTo(this.tableBody_);
  binaryRow.appendTo(this.tableBody_);

  // Auto-scroll
  if (wasScrolledToEnd) {
    var scrollTimeMs = 250;
    scrollArea.animate({ scrollTop: scrollArea[0].scrollHeight},
        scrollTimeMs);
  }
};
