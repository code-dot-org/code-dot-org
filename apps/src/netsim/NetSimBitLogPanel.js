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

var logger = require('./NetSimLogger').getSingleton();

/**
 * Generator and controller for bit-log, which receives bits one at a time.
 * @param {jQuery} rootDiv
 * @param {Object} options
 * @param {string} options.logTitle
 * @param {boolean} [options.isMinimized] defaults to FALSE
 * @param {function} [options.receiveButtonCallback]
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

  /**
   * Method to call when the receive button is pressed.
   * @type {function}
   * @private
   */
  this.receiveButtonCallback_ = options.receiveButtonCallback;

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
    chunkSize: this.chunkSize_,
    showReadWireButton: (this.receiveButtonCallback_ !== undefined)
  }));
  this.getBody().html(newMarkup);
  NetSimEncodingControl.hideRowsByEncoding(this.getBody(), this.encodings_);

  // If we have a receive callback, add a receive button
  if (this.receiveButtonCallback_) {
    this.getBody().find('#read-wire-button')
        .click(this.onReceiveButtonPress_.bind(this));
  }

  // Add a clear button to the panel header
  this.addButton(i18n.clear(), this.onClearButtonPress_.bind(this));
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
 * Asynchronously fetch the wire state from remote storage, and log it.
 * @param {Event} jQueryEvent
 * @private
 */
NetSimBitLogPanel.prototype.onReceiveButtonPress_ = function (jQueryEvent) {
  var thisButton = $(jQueryEvent.target);
  if (thisButton.is('[disabled]')) {
    return;
  }

  thisButton.attr('disabled', 'disabled');
  this.receiveButtonCallback_(function (err, message) {
    if (err) {
      logger.warn("Error reading wire state: " + err.message);
      thisButton.removeAttr('disabled');
      return;
    }

    if (message) {
      this.log(message.payload);
    } else {
      // A successful fetch with a null message means there's nothing
      // on the wire.  We should log its default state: off/zero
      this.log('0');
    }
    thisButton.removeAttr('disabled');
  }.bind(this));
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
