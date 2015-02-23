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
var dom = require('../dom');
var NetSimEncodingSelector = require('./NetSimEncodingSelector');
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
  /**
   * A message encoding (display) setting.
   * @type {string}
   * @private
   */
  this.currentEncoding_ = 'all';
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

NetSimLogWidget.prototype.onClearButtonPress_ = function () {
  this.scrollArea_.empty();
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
 * @param {string} toAddress
 * @param {string} fromAddress
 * @param {string} packetInfo
 * @param {string} message
 * @returns {jQuery} wrapper on new table-row element
 */
var makeLogRow = function (toAddress, fromAddress, packetInfo, message) {
  var row = $('<tr>');
  $('<td nowrap>')
      .addClass('toAddress')
      .html(toAddress)
      .appendTo(row);
  $('<td nowrap>')
      .addClass('fromAddress')
      .html(fromAddress)
      .appendTo(row);
  $('<td nowrap>')
      .addClass('packetInfo')
      .html(packetInfo)
      .appendTo(row);
  $('<td>')
      .addClass('message')
      .html(message)
      .appendTo(row);
  return row;
};

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
  var packetDiv = $('<div>').addClass('packet');
  var packetTable = $('<table>').appendTo(packetDiv);
  var packetHead = $('<thead>').appendTo(packetTable);
  var packetBody = $('<tbody>').appendTo(packetTable);

  var headerRow = $('<tr>').appendTo(packetHead);
  $('<th nowrap>').addClass('toAddress').html('To').appendTo(headerRow);
  $('<th nowrap>').addClass('fromAddress').html('From').appendTo(headerRow);
  $('<th nowrap>').addClass('packetInfo').html('Packet').appendTo(headerRow);
  $('<th>').addClass('message').html('Message').appendTo(headerRow);

  makeLogRow(
      binaryToInt(toAddress),
      binaryToInt(fromAddress),
      binaryToInt(packetIndex) + ' of ' + binaryToInt(packetCount),
      binaryToAscii(message, 8)
  ).addClass('ascii').appendTo(packetBody);

  // TODO (bbuchanan): Parse at selected bytesize
  makeLogRow(
      binaryToInt(toAddress),
      binaryToInt(fromAddress),
      binaryToInt(packetIndex) + ' of ' + binaryToInt(packetCount),
      alignDecimal(binaryToDecimal(message, 8))
  ).addClass('decimal').appendTo(packetBody);

  makeLogRow(
      binaryToHex(toAddress),
      binaryToHex(fromAddress),
      binaryToHex(packetIndex) + ' of ' + binaryToHex(packetCount),
      formatHex(binaryToHex(message), 2)
  ).addClass('hexadecimal').appendTo(packetBody);

  // TODO (bbuchanan): Format to selected bytesize
  makeLogRow(
      formatBinary(toAddress, 4),
      formatBinary(fromAddress, 4),
      formatBinary(packetIndex, 4) + ' ' + formatBinary(packetCount, 4),
      formatBinary(message, 8)
  ).addClass('binary').appendTo(packetBody);

  NetSimEncodingSelector.hideRowsByEncoding(packetDiv, this.currentEncoding_);
  packetDiv.appendTo(this.scrollArea_);

  // Auto-scroll
  if (wasScrolledToEnd) {
    var scrollTimeMs = 250;
    scrollArea.animate({ scrollTop: scrollArea[0].scrollHeight},
        scrollTimeMs);
  }
};

/**
 * Show or hide parts of the send UI based on the currently selected encoding
 * mode.
 * @param {string} newEncoding
 */
NetSimLogWidget.prototype.setEncoding = function (newEncoding) {
  NetSimEncodingSelector.hideRowsByEncoding(this.rootDiv_, newEncoding);
  this.currentEncoding_ = newEncoding;
};
