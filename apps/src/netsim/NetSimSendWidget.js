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
var KeyCodes = require('../constants').KeyCodes;
var NetSimEncodingSelector = require('./NetSimEncodingSelector');
var PacketEncoder = require('./PacketEncoder');
var dataConverters = require('./dataConverters');

var minifyBinary = dataConverters.minifyBinary;
var formatBinary = dataConverters.formatBinary;
var formatHex = dataConverters.formatHex;
var alignDecimal = dataConverters.alignDecimal;
var binaryToInt = dataConverters.binaryToInt;
var intToBinary = dataConverters.intToBinary;
var hexToInt = dataConverters.hexToInt;
var intToHex = dataConverters.intToHex;
var hexToBinary = dataConverters.hexToBinary;
var binaryToHex = dataConverters.binaryToHex;
var decimalToBinary = dataConverters.decimalToBinary;
var binaryToDecimal = dataConverters.binaryToDecimal;
var asciiToBinary = dataConverters.asciiToBinary;
var binaryToAscii = dataConverters.binaryToAscii;

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

  /** @type {number} */
  this.toAddress = 0;
  /** @type {number} */
  this.fromAddress = 0;
  /** @type {number} */
  this.packetIndex = 1;
  /** @type {number} */
  this.packetCount = 1;
  /**
   * Binary string of message body, live-interpreted to other values.
   * @type {string}
   */
  this.message = '';

  /**
   * Bits per chunk/byte for parsing and formatting purposes.
   * @type {number}
   * @private
   */
  this.currentChunkSize_ = 8;
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
  controller.render();
  return controller;
};

/**
 * Focus event handler.  If the target element has a 'watermark' class then
 * it contains text we intend to clear before any editing occurs.  This
 * handler clears that text and removes the class.
 * @param focusEvent
 */
var removeWatermark = function (focusEvent) {
  var target = $(focusEvent.target);
  if (target.hasClass('watermark')) {
    target.val('');
    target.removeClass('watermark');
  }
};

/**
 * Creates a keyPress handler that allows only the given characters to be
 * typed into a text field.
 * @param {RegExp} whitelistRegex
 * @return {function} appropriate to pass to .keypress()
 */
var whitelistCharacters = function (whitelistRegex) {
  /**
   * A keyPress handler that blocks all visible characters except those
   * matching the whitelist.  Passes through invisible characters (backspace,
   * delete) and control combinations (copy, paste).
   *
   * @param keyEvent
   * @returns {boolean} - Whether to propagate this event.  Should return
   *          FALSE if we handle the event and don't want to pass it on, TRUE
   *          if we are not handling the event.
   */
  return function (keyEvent) {

    // Don't block control combinations (copy, paste, etc.)
    if (keyEvent.metaKey || keyEvent.ctrlKey) {
      return true;
    }

    // Don't block invisible characters; we want to allow backspace, delete, etc.
    if (keyEvent.which < KeyCodes.SPACE || keyEvent.which >= KeyCodes.DELETE) {
      return true;
    }

    // At this point, if the character doesn't match, we should block it.
    var key = String.fromCharCode(keyEvent.which);
    if (!whitelistRegex.test(key)) {
      keyEvent.preventDefault();
      return false;
    }
  };
};

/**
 * Generate a jQuery-appropriate keyup handler for a text field.
 * Grabs the new value of the text field, runs it through the provided
 * converter function, sets the result on the SendWidget's internal state
 * and triggers a re-render of the widget that skips the field being edited.
 *
 * Similar to makeBlurHandler, but does not re-render the field currently
 * being edited.
 *
 * @param {string} fieldName - name of internal state field that the text
 *        field should update.
 * @param {function} converterFunction - Takes the text field's value and
 *        converts it to a format appropriate to the internal state field.
 * @returns {function} that can be passed to $.keyup()
 */
NetSimSendWidget.prototype.makeKeyupHandler = function (fieldName, converterFunction) {
  return function (jqueryEvent) {
    var newValue = converterFunction(jqueryEvent.target.value);
    if (!isNaN(newValue)) {
      this[fieldName] = newValue;
      this.render(jqueryEvent.target);
    }
  }.bind(this);
};

/**
 * Generate a jQuery-appropriate blur handler for a text field.
 * Grabs the new value of the text field, runs it through the provided
 * converter function, sets the result on the SendWidget's internal state
 * and triggers a full re-render of the widget (including the field that was
 * just edited).
 *
 * Similar to makeKeyupHandler, but also re-renders the field that was
 * just edited.
 *
 * @param {string} fieldName - name of internal state field that the text
 *        field should update.
 * @param {function} converterFunction - Takes the text field's value and
 *        converts it to a format appropriate to the internal state field.
 * @returns {function} that can be passed to $.blur()
 */
NetSimSendWidget.prototype.makeBlurHandler = function (fieldName, converterFunction) {
  return function (jqueryEvent) {
    var newValue = converterFunction(jqueryEvent.target.value);
    if (isNaN(newValue)) {
      newValue = converterFunction('0');
    }
    this[fieldName] = newValue;
    this.render();
  }.bind(this);
};

/**
 * Get relevant elements from the page and bind them to local variables.
 * @private
 */
NetSimSendWidget.prototype.bindElements_ = function () {
  var rootDiv = $('#netsim_send_widget');

  var shortNumberFields = [
    'toAddress',
    'fromAddress',
    'packetIndex',
    'packetCount'
  ];

  var rowTypes = [
    {
      typeName: 'binary',
      shortNumberAllowedCharacters: /[01]/,
      shortNumberConversion: binaryToInt,
      messageAllowedCharacters: /[01\s]/,
      messageConversion: minifyBinary
    },
    {
      typeName: 'hexadecimal',
      shortNumberAllowedCharacters: /[0-9a-f]/i,
      shortNumberConversion: hexToInt,
      messageAllowedCharacters: /[0-9a-f\s]/i,
      messageConversion: hexToBinary
    },
    {
      typeName: 'decimal',
      shortNumberAllowedCharacters: /[0-9]/,
      shortNumberConversion: parseInt,
      messageAllowedCharacters: /[0-9\s]/,
      messageConversion: function (decimalString) {
        return decimalToBinary(decimalString, this.currentChunkSize_);
      }.bind(this)
    },
    {
      typeName: 'ascii',
      shortNumberAllowedCharacters: /[0-9]/,
      shortNumberConversion: parseInt,
      messageAllowedCharacters: /./,
      messageConversion: function (asciiString) {
        return asciiToBinary(asciiString, this.currentChunkSize_);
      }.bind(this)
    }
  ];

  rowTypes.forEach(function (rowType) {
    var tr = rootDiv.find('tr.' + rowType.typeName);
    var rowUIKey = rowType.typeName + 'UI';
    this[rowUIKey] = {};
    var rowFields = this[rowUIKey];

    // We attach focus (sometimes) to clear the field watermark, if present
    // We attach keypress to block certain characters
    // We attach keyup to live-update the widget as the user types
    // We attach blur to reformat the edited field when the user leaves it,
    //    and to catch non-keyup cases like copy/paste.

    shortNumberFields.forEach(function (fieldName) {
      rowFields[fieldName] = tr.find('input.' + fieldName);
      rowFields[fieldName].keypress(
          whitelistCharacters(rowType.shortNumberAllowedCharacters));
      rowFields[fieldName].keyup(
          this.makeKeyupHandler(fieldName, rowType.shortNumberConversion));
      rowFields[fieldName].blur(
          this.makeBlurHandler(fieldName, rowType.shortNumberConversion));
    }, this);

    rowFields.message = tr.find('textarea.message');
    rowFields.message.focus(removeWatermark);
    rowFields.message.keypress(
        whitelistCharacters(rowType.messageAllowedCharacters));
    rowFields.message.keyup(
        this.makeKeyupHandler('message', rowType.messageConversion));
    rowFields.message.blur(
        this.makeBlurHandler('message', rowType.messageConversion));
  }, this);

  this.bitCounter = rootDiv.find('.bit_counter');

  this.sendButton_ = rootDiv.find('#send_button');
  this.sendButton_.click(this.onSendButtonPress_.bind(this));
};

/**
 * Handler for connection status changes.  Can update configuration and
 * trigger a render of this view.
 * @private
 */
NetSimSendWidget.prototype.onConnectionStatusChange_ = function () {
  if (this.connection_.myNode && this.connection_.myNode.myWire) {
    this.fromAddress = this.connection_.myNode.myWire.localAddress;
  } else {
    this.fromAddress = 0;
  }

  this.render();
};

/**
 * Update send widget display
 * @param {HTMLElement} [skipElement]
 */
NetSimSendWidget.prototype.render = function (skipElement) {
  var chunkSize = this.currentChunkSize_;
  var liveFields = [];

  [
    'toAddress',
    'fromAddress',
    'packetIndex',
    'packetCount'
  ].forEach(function (fieldName) {
    liveFields.push({
      inputElement: this.binaryUI[fieldName],
      newValue: intToBinary(this[fieldName], 4)
    });

    liveFields.push({
      inputElement: this.hexadecimalUI[fieldName],
      newValue: intToHex(this[fieldName], 1)
    });

    liveFields.push({
      inputElement: this.decimalUI[fieldName],
      newValue: this[fieldName].toString(10)
    });

    liveFields.push({
      inputElement: this.asciiUI[fieldName],
      newValue: this[fieldName].toString(10)
    });
  }, this);

  liveFields.push({
    inputElement: this.binaryUI.message,
    newValue: formatBinary(this.message, chunkSize),
    watermark: 'Binary'
  });

  liveFields.push({
    inputElement: this.hexadecimalUI.message,
    newValue: formatHex(binaryToHex(this.message), Math.ceil(chunkSize / 4)),
    watermark: 'Hexadecimal'
  });

  liveFields.push({
    inputElement: this.decimalUI.message,
    newValue: alignDecimal(binaryToDecimal(this.message, chunkSize)),
    watermark: 'Decimal'
  });

  liveFields.push({
    inputElement: this.asciiUI.message,
    newValue: binaryToAscii(this.message, chunkSize),
    watermark: 'ASCII'
  });

  liveFields.forEach(function (field) {
    if (field.inputElement[0] !== skipElement) {
      if (field.watermark && field.newValue === '') {
        field.inputElement.val(field.watermark);
        field.inputElement.addClass('watermark');
      } else {
        field.inputElement.val(field.newValue);
        field.inputElement.removeClass('watermark');
      }

      // TODO: If textarea, scroll to bottom?
    }
  });

  var packetBinary = this.getPacketBinary_();
  this.bitCounter.html(packetBinary.length + '/Infinity bits');
};

/** Send message to connected remote */
NetSimSendWidget.prototype.onSendButtonPress_ = function () {
  var myNode = this.connection_.myNode;
  if (myNode) {
    myNode.sendMessage(this.getPacketBinary_());
  }
};

/**
 * Produces a single binary string in the current packet format, based
 * on the current state of the widget (content of its internal fields).
 * @returns {string} - binary representation of packet
 * @private
 */
NetSimSendWidget.prototype.getPacketBinary_ = function () {
  var shortNumberFieldWidth = 4;
  var encoder = new PacketEncoder([
    { key: 'toAddress', bits: shortNumberFieldWidth },
    { key: 'fromAddress', bits: shortNumberFieldWidth },
    { key: 'packetIndex', bits: shortNumberFieldWidth },
    { key: 'packetCount', bits: shortNumberFieldWidth },
    { key: 'message', bits: Infinity }
  ]);
  return encoder.createBinary({
    toAddress: intToBinary(this.toAddress, shortNumberFieldWidth),
    fromAddress: intToBinary(this.fromAddress, shortNumberFieldWidth),
    packetIndex: intToBinary(this.packetIndex, shortNumberFieldWidth),
    packetCount: intToBinary(this.packetCount, shortNumberFieldWidth),
    message: this.message
  });
};

/**
 * Show or hide parts of the send UI based on the currently selected encoding
 * mode.
 * @param {string} newEncoding
 */
NetSimSendWidget.prototype.setEncoding = function (newEncoding) {
  NetSimEncodingSelector.hideRowsByEncoding($('#netsim_send_widget'), newEncoding);
};

/**
 * Change how data is interpreted and formatted by this component, triggering
 * a re-render.
 * @param {number} newChunkSize
 */
NetSimSendWidget.prototype.setChunkSize = function (newChunkSize) {
  this.currentChunkSize_ = newChunkSize;
  this.render();
};
