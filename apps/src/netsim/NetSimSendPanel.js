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

require('../utils'); // For Function.prototype.inherits()
var netsimMsg = require('../../locale/current/netsim');
var markup = require('./NetSimSendPanel.html');
var KeyCodes = require('../constants').KeyCodes;
var NetSimPanel = require('./NetSimPanel');
var NetSimEncodingControl = require('./NetSimEncodingControl');
var NetSimPacketSizeControl = require('./NetSimPacketSizeControl');
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
 * @param {jQuery} rootDiv
 * @param {NetSimLevelConfiguration} levelConfig
 * @param {NetSimConnection} connection
 * @constructor
 * @augments NetSimPanel
 */
var NetSimSendPanel = module.exports = function (rootDiv, levelConfig,
    connection) {

  /**
   * @type {NetSimLevelConfiguration}
   * @private
   */
  this.levelConfig_ = levelConfig;

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
   * Maximum packet length configurable by slider.
   * @type {Number}
   * @private
   */
  this.currentPacketSize_ = levelConfig.defaultPacketSizeLimit;

  /**
   * Bits per chunk/byte for parsing and formatting purposes.
   * @type {number}
   * @private
   */
  this.currentChunkSize_ = 8;

  /**
   * @type {NetSimPacketSizeControl}
   * @private
   */
  this.packetSizeControl_ = null;
  
  NetSimPanel.call(this, rootDiv, {
    className: 'netsim-send-panel',
    panelTitle: netsimMsg.sendAMessage()
  });
};
NetSimSendPanel.inherits(NetSimPanel);

/** Replace contents of our root element with our own markup. */
NetSimSendPanel.prototype.render = function () {
  // Render boilerplate panel stuff
  NetSimSendPanel.superPrototype.render.call(this);

  // Put our own content into the panel body
  var newMarkup = $(markup({}));
  this.getBody().html(newMarkup);

  if (this.levelConfig_.showPacketSizeControl) {
    this.packetSizeControl_ = new NetSimPacketSizeControl(
        this.rootDiv_.find('.packet_size'),
        this.packetSizeChangeCallback_.bind(this));
    this.packetSizeControl_.setPacketSize(this.currentPacketSize_);
  }

  this.bindElements_();
  this.updateFields_();
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
 * and triggers a field update on the widget that skips the field being edited.
 *
 * Similar to makeBlurHandler, but does not update the field currently
 * being edited.
 *
 * @param {string} fieldName - name of internal state field that the text
 *        field should update.
 * @param {function} converterFunction - Takes the text field's value and
 *        converts it to a format appropriate to the internal state field.
 * @returns {function} that can be passed to $.keyup()
 */
NetSimSendPanel.prototype.makeKeyupHandler = function (fieldName, converterFunction) {
  return function (jqueryEvent) {
    var newValue = converterFunction(jqueryEvent.target.value);
    if (!isNaN(newValue)) {
      this[fieldName] = newValue;
      this.updateFields_(jqueryEvent.target);
    }
  }.bind(this);
};

/**
 * Generate a jQuery-appropriate blur handler for a text field.
 * Grabs the new value of the text field, runs it through the provided
 * converter function, sets the result on the SendWidget's internal state
 * and triggers a full field update of the widget (including the field that was
 * just edited).
 *
 * Similar to makeKeyupHandler, but also updates the field that was
 * just edited.
 *
 * @param {string} fieldName - name of internal state field that the text
 *        field should update.
 * @param {function} converterFunction - Takes the text field's value and
 *        converts it to a format appropriate to the internal state field.
 * @returns {function} that can be passed to $.blur()
 */
NetSimSendPanel.prototype.makeBlurHandler = function (fieldName, converterFunction) {
  return function (jqueryEvent) {
    var newValue = converterFunction(jqueryEvent.target.value);
    if (isNaN(newValue)) {
      newValue = converterFunction('0');
    }
    this[fieldName] = newValue;
    this.updateFields_();
  }.bind(this);
};

/**
 * Get relevant elements from the page and bind them to local variables.
 * @private
 */
NetSimSendPanel.prototype.bindElements_ = function () {
  var rootDiv = this.getBody();

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

  this.bitCounter = rootDiv.find('.bit-counter');

  this.sendButton_ = rootDiv.find('#send_button');
  this.sendButton_.click(this.onSendButtonPress_.bind(this));
};

/**
 * Handler for connection status changes.  Can update configuration and
 * trigger a update of this view.
 * @private
 */
NetSimSendPanel.prototype.onConnectionStatusChange_ = function () {
  if (this.connection_.myNode && this.connection_.myNode.myWire) {
    this.fromAddress = this.connection_.myNode.myWire.localAddress;
  } else {
    this.fromAddress = 0;
  }

  this.updateFields_();
};

/**
 * Update send widget display
 * @param {HTMLElement} [skipElement]
 * @private
 */
NetSimSendPanel.prototype.updateFields_ = function (skipElement) {
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
    watermark: netsimMsg.binary()
  });

  liveFields.push({
    inputElement: this.hexadecimalUI.message,
    newValue: formatHex(binaryToHex(this.message), chunkSize),
    watermark: netsimMsg.hexadecimal()
  });

  liveFields.push({
    inputElement: this.decimalUI.message,
    newValue: alignDecimal(binaryToDecimal(this.message, chunkSize)),
    watermark: netsimMsg.decimal()
  });

  liveFields.push({
    inputElement: this.asciiUI.message,
    newValue: binaryToAscii(this.message, chunkSize),
    watermark: netsimMsg.ascii()
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

  this.updateBitCounter();

  // TODO: Hide columns by configuration
  this.getBody().find('th.packetInfo, td.packetInfo').hide();
};

/** Send message to connected remote */
NetSimSendPanel.prototype.onSendButtonPress_ = function () {
  var myNode = this.connection_.myNode;
  if (myNode) {
    this.disableEverything();
    var truncatedPacket = this.getPacketBinary_().substr(0, this.currentPacketSize_);
    myNode.sendMessage(truncatedPacket, function () {
      var binaryTextarea = this.getBody()
          .find('tr.binary')
          .find('textarea');
      binaryTextarea.val('');
      binaryTextarea.blur();
      this.enableEverything();
    }.bind(this));
  }
};

/** Disable all controls in this panel, usually during network activity. */
NetSimSendPanel.prototype.disableEverything = function () {
  this.getBody().find('input, textarea').prop('disabled', true);
};

/** Enable all controls in this panel, usually after network activity. */
NetSimSendPanel.prototype.enableEverything = function () {
  this.getBody().find('input, textarea').prop('disabled', false);
};

/**
 * Produces a single binary string in the current packet format, based
 * on the current state of the widget (content of its internal fields).
 * @returns {string} - binary representation of packet
 * @private
 */
NetSimSendPanel.prototype.getPacketBinary_ = function () {
  var shortNumberFieldWidth = 4;
  return PacketEncoder.defaultPacketEncoder.createBinary({
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
 * @param {EncodingType[]} newEncodings
 */
NetSimSendPanel.prototype.setEncodings = function (newEncodings) {
  NetSimEncodingControl.hideRowsByEncoding(this.getBody(), newEncodings);
};

/**
 * Change how data is interpreted and formatted by this component, triggering
 * an update of all input fields.
 * @param {number} newChunkSize
 */
NetSimSendPanel.prototype.setChunkSize = function (newChunkSize) {
  this.currentChunkSize_ = newChunkSize;
  this.updateFields_();
};

/**
 * Callback passed down into packet size control, called when packet size
 * is changed by the user.
 * @param {number} newPacketSize
 * @private
 */
NetSimSendPanel.prototype.packetSizeChangeCallback_ = function (newPacketSize) {
  this.currentPacketSize_ = newPacketSize;
  this.updateBitCounter();
};

/**
 * Update the visual state of the bit counter to reflect the current
 * message binary length and maximum packet size.
 */
NetSimSendPanel.prototype.updateBitCounter = function () {
  var size = this.getPacketBinary_().length;
  var maxSize = this.currentPacketSize_ === Infinity ?
      netsimMsg.infinity() : this.currentPacketSize_;
  this.bitCounter.html(netsimMsg.bitCounter({
    x: size,
    y: maxSize
  }));

  if (size <= this.currentPacketSize_) {
    this.bitCounter.removeClass('oversized');
  } else {
    this.bitCounter.addClass('oversized');
  }
};
