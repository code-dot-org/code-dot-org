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

var markup = require('./NetSimSendWidget.html');
var dom = require('../dom');

function binaryStringToUnsignedInteger(binaryString) {
  return parseInt(binaryString, 2);
}

function unsignedIntegerToBinaryString(integer, size) {
  var binary = integer.toString(2);
  while (binary.length < size) {
    binary = '0' + binary;
  }
  // TODO: Deal with overflow?
  return binary;
}

function binaryStringToAscii(binaryString) {
  var result = '';
  for (var i = 0; i < binaryString.length; i += 8) {
    var chunk = binaryString.slice(i, i+8);
    while (chunk.length < 8) {
      chunk += '0';
    }
    result += String.fromCharCode(parseInt(chunk, 2));
  }
  return result;
}

function asciiToBinaryString(ascii) {
  var result = '';
  for (var i = 0; i < ascii.length; i++) {
    result += unsignedIntegerToBinaryString(ascii.charCodeAt(i), 8);
  }
  return result;
}

/**
 * Generator and controller for message sending view.
 * @param {NetSimConnection} connection
 * @constructor
 */
var NetSimSendWidget = module.exports = function (connection) {
  /**
   * Connection that owns the router we will represent / manipulate
   * @type {NetSimConnection}
   * @private
   */
  this.connection_ = connection;
  this.connection_.statusChanges
      .register(this.onConnectionStatusChange_.bind(this));

  this.packetBinary = '';
};

/**
 * Generate a new NetSimSendWidget, puttig it on the page and hooking
 * it up to the given connection where it will update to reflect the
 * state of the connected router, if there is one.
 * @param element
 * @param connection
 */
NetSimSendWidget.createWithin = function (element, connection) {
  var controller = new NetSimSendWidget(connection);
  element.innerHTML = markup({});
  controller.bindElements_();
  controller.refresh();
  return controller;
};

/**
 * Get relevant elements from the page and bind them to local variables.
 * @private
 */
NetSimSendWidget.prototype.bindElements_ = function () {
  this.rootDiv_ = $('#netsim_send_widget');
  this.toAddressTextbox_ = this.rootDiv_.find('#to_address');
  this.fromAddressTextbox_ = this.rootDiv_.find('#from_address');

  this.binaryPayloadTextbox_ = this.rootDiv_.find('#binary_payload');
  this.binaryPayloadTextbox_.change(this.onBinaryPayloadChange_.bind(this));
  this.binaryPayloadTextbox_.bind('keyup', this.onBinaryPayloadChange_.bind(this));
  this.binaryPayloadTextbox_.bind('keypress', function (event) {
    var charCode = !event.charCode ? event.which : event.charCode;

    // Prevent VISIBLE characters that aren't on our whitelist
    if (charCode >= 32 && charCode <= 126) {
      var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
      if (!/[01]/.test(key)) {
        event.preventDefault();
        return false;
      }
    }
  }.bind(this));

  this.asciiPayloadTextbox_ = this.rootDiv_.find('#ascii_payload');
  this.asciiPayloadTextbox_.change(this.onAsciiPayloadChange_.bind(this));
  this.asciiPayloadTextbox_.bind('keyup', this.onAsciiPayloadChange_.bind(this));

  this.sendButton_ = this.rootDiv_.find('#send_button');

  dom.addClickTouchEvent(this.sendButton_[0], this.onSendButtonPress_.bind(this));
};

/**
 * Handler for connection status changes.  Can update configuration and
 * trigger a refresh of this view.
 * @private
 */
NetSimSendWidget.prototype.onConnectionStatusChange_ = function () {

};

NetSimSendWidget.prototype.onBinaryPayloadChange_ = function () {
  this.packetBinary = unsignedIntegerToBinaryString(this.toAddressTextbox_.val(), 4);
  this.packetBinary += unsignedIntegerToBinaryString(this.fromAddressTextbox_.val(), 4);
  this.packetBinary += this.binaryPayloadTextbox_.val();
  this.refresh();
};

NetSimSendWidget.prototype.onAsciiPayloadChange_ = function () {
  this.packetBinary = unsignedIntegerToBinaryString(this.toAddressTextbox_.val(), 4);
  this.packetBinary += unsignedIntegerToBinaryString(this.fromAddressTextbox_.val(), 4);
  this.packetBinary += asciiToBinaryString(this.asciiPayloadTextbox_.val());
  this.refresh();
};

/** Update send widget display */
NetSimSendWidget.prototype.refresh = function () {
  // Non-interactive right now
  this.rootDiv_.find('#from_address').val('?');
  this.rootDiv_.find('#packet_index').val(1);
  this.rootDiv_.find('#packet_count').val(1);

  // Extract to address from packetBinary
  var toAddressBinary = this.packetBinary.slice(0, 4);
  while (toAddressBinary.length < 4) {
    toAddressBinary += '0';
  }
  var toAddress = binaryStringToUnsignedInteger(toAddressBinary);
  this.toAddressTextbox_.val(toAddress);

  // Extract from address from packetBinary
  var fromAddressBinary = this.packetBinary.slice(4, 8);
  while (fromAddressBinary.length < 4) {
    fromAddressBinary += '0';
  }
  var fromAddress = binaryStringToUnsignedInteger(fromAddressBinary);
  this.fromAddressTextbox_.val(fromAddress);

  // Extract message body from packetBinary
  var binaryPayload = this.packetBinary.slice(8);
  this.binaryPayloadTextbox_.val(binaryPayload);

  var asciiPayload = binaryStringToAscii(binaryPayload);
  this.asciiPayloadTextbox_.val(asciiPayload);
};

/** Send message to connected remote */
NetSimSendWidget.prototype.onSendButtonPress_ = function () {
  var myNode = this.connection_.myNode;
  if (!myNode) {
    return;
  }

  myNode.sendMessage(this.packetBinary);
};
