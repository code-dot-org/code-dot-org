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

var uglifyBinary = function (binaryString) {
  return binaryString.replace(/[^01]/g, '');
};

var prettifyBinary = function (binaryString, chunkSize) {
  var uglyBinary = uglifyBinary(binaryString);

  var chunks = [];
  for (var i = 0; i < uglyBinary.length; i += chunkSize) {
    chunks.push(uglyBinary.substr(i, chunkSize));
  }

  return chunks.join(' ');
};

var binaryToInt = function (binaryString) {
  return parseInt(uglifyBinary(binaryString), 2);
};

var intToBinary = function (int, width) {
  var padding = new Array(width + 1).join('0');
  return (padding + int.toString(2)).slice(-width);
};

var hexadecimalToInt = function (hexadecimalString) {
  return parseInt(hexadecimalString.replace(/[^0-9a-f]/ig, ''), 16);
};

var intToHexadecimal = function (int, width) {
  var padding = new Array(width + 1).join('0');
  return (padding + int.toString(16)).slice(-width).toUpperCase();
};

var hexadecimalToBinary = function (hexadecimalString) {
  var uglyHex = hexadecimalString.replace(/[^0-9a-f]/ig, '');
  var binary = '';

  for (var i = 0; i < uglyHex.length; i++) {
    binary += intToBinary(parseInt(uglyHex.substr(i, 1), 16), 4);
  }

  return binary;
};

var binaryToHexadecimal = function (binaryString, chunkSize) {
  var uglyBinary = uglifyBinary(binaryString);
  var uglyHex = '';
  var nibble;
  var padding = '0000';
  var i;
  for (i = 0; i < uglyBinary.length; i += 4) {
    // Right-pad nibble with zeroes
    nibble = (uglyBinary.substr(i, 4) + padding).slice(0, 4);
    uglyHex += intToHexadecimal(binaryToInt(nibble),1);
  }

  var chunks = [];
  for (i = 0; i < uglyHex.length; i += chunkSize) {
    chunks.push(uglyHex.substr(i, chunkSize));
  }

  return chunks.join(' ').toUpperCase();
};

var decimalToBinary = function (decimalString) {
  var uglyDecimal = decimalString.replace(/[^0-9\s]/g, '');
  var numbers = uglyDecimal.split(/\s+/).map(function (nString) {
    return parseInt(nString, 10);
  });
  var uglyBinary = '';
  for (var i = 0; i < numbers.length; i++) {
    // TODO (bbuchanan): Make width configurable for decimal mode.
    uglyBinary += intToBinary(numbers[i], 8);
  }

  return uglyBinary;
};

var binaryToDecimal = function (binaryString) {
  // TODO (bbuchanan): Make width configurable for decimal mode.
  var uglyBinary = uglifyBinary(binaryString);
  var numbers = [];
  var byte;
  var padding = '00000000';
  for (var i = 0; i < uglyBinary.length; i += 8) {
    byte = (uglyBinary.substr(i, 8) + padding).slice(0, 8);
    numbers.push(binaryToInt(byte));
  }

  return numbers.join(' ');
};

var asciiToBinary = function (asciiString) {
  var bytes = [];
  for (var i = 0; i < asciiString.length; i++) {
    bytes.push(intToBinary(asciiString.charCodeAt(i), 8));
  }
  return bytes.join('');
};

var binaryToAscii = function (binaryString) {
  var byte, charCode;
  var uglyBinary = uglifyBinary(binaryString);
  var chars = [];
  var padding = '00000000';
  for (var i = 0; i < uglyBinary.length; i += 8) {
    byte = (uglyBinary.substr(i, 8) + padding).slice(0, 8);
    charCode = binaryToDecimal(byte);
    chars.push(String.fromCharCode(charCode));
  }
  return chars.join('');
};

NetSimSendWidget.prototype.makeKeyupHandler = function (fieldName, converterFunction) {
  return function (jqueryEvent) {
    var newValue = converterFunction(jqueryEvent.target.value);
    if (!isNaN(newValue)) {
      this[fieldName] = newValue;
      this.render(jqueryEvent.target);
    }
  }.bind(this);
};

NetSimSendWidget.prototype.makeChangeHandler = function (fieldName, converterFunction) {
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
      messageAllowedCharacters: /[01]/,
      messageConversion: uglifyBinary
    },
    {
      typeName: 'hexadecimal',
      shortNumberAllowedCharacters: /[0-9a-f]/i,
      shortNumberConversion: hexadecimalToInt,
      messageAllowedCharacters: /[0-9a-f]/i,
      messageConversion: hexadecimalToBinary
    },
    {
      typeName: 'decimal',
      shortNumberAllowedCharacters: /[0-9]/,
      shortNumberConversion: parseInt,
      messageAllowedCharacters: /[0-9\s]/,
      messageConversion: decimalToBinary
    },
    {
      typeName: 'ascii',
      shortNumberAllowedCharacters: /[0-9]/,
      shortNumberConversion: parseInt,
      messageAllowedCharacters: /./,
      messageConversion: asciiToBinary
    }
  ];

  rowTypes.forEach(function (rowType) {
    var tr = rootDiv.find('tr.' + rowType.typeName);
    this[rowType.typeName + 'UI'] = {};
    var rowFields = this[rowType.typeName + 'UI'];

    shortNumberFields.forEach(function (fieldName) {
      rowFields[fieldName] = tr.find('input.' + fieldName);
      rowFields[fieldName].keypress(
          whitelistCharacters(rowType.shortNumberAllowedCharacters));
      rowFields[fieldName].keyup(
          this.makeKeyupHandler(fieldName, rowType.shortNumberConversion));
      rowFields[fieldName].change(
          this.makeChangeHandler(fieldName, rowType.shortNumberConversion));
    }.bind(this));

    rowFields.message = tr.find('textarea.message');
    rowFields.message.keypress(
        whitelistCharacters(rowType.messageAllowedCharacters));
    rowFields.message.keyup(
        this.makeKeyupHandler('message', rowType.messageConversion));
    rowFields.message.change(
        this.makeChangeHandler('message', rowType.messageConversion));
  }.bind(this));

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
 * @param {*} [skipElement]
 */
NetSimSendWidget.prototype.render = function (skipElement) {
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
      newValue: intToHexadecimal(this[fieldName], 1)
    });

    liveFields.push({
      inputElement: this.decimalUI[fieldName],
      newValue: this[fieldName].toString(10)
    });

    liveFields.push({
      inputElement: this.asciiUI[fieldName],
      newValue: this[fieldName].toString(10)
    });
  }.bind(this));

  liveFields.push({
    inputElement: this.binaryUI.message,
    newValue: prettifyBinary(this.message, 8)
  });

  liveFields.push({
    inputElement: this.hexadecimalUI.message,
    newValue: binaryToHexadecimal(this.message, 2)
  });

  liveFields.push({
    inputElement: this.decimalUI.message,
    newValue: binaryToDecimal(this.message)
  });

  liveFields.push({
    inputElement: this.asciiUI.message,
    newValue: binaryToAscii(this.message)
  });

  liveFields.forEach(function (field) {
    if (field.inputElement[0] !== skipElement) {
      field.inputElement.val(field.newValue);
      // TODO: If textarea, scroll to bottom?
    }
  });
};

/** Send message to connected remote */
NetSimSendWidget.prototype.onSendButtonPress_ = function () {
  var myNode = this.connection_.myNode;
  if (!myNode) {
    return;
  }

  //myNode.sendMessage(this.packetBinary);
};
