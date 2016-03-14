/**
 * @overview UI component, a log panel (used as "Sent Bits" and "Received Bits")
 *           that is used in the single-bit-sending configurations of the simulator.
 *
 * @see INetSimLogPanel for the interface implemented here.
 * @see NetSimLogPanel for the component used in packet-sending mode.
 */
'use strict';

require('../utils'); // For Function.prototype.inherits()
var i18n = require('./locale');
var markup = require('./NetSimBitLogPanel.html.ejs');
var NetSimPanel = require('./NetSimPanel');
var NetSimEncodingControl = require('./NetSimEncodingControl');
var NetSimGlobals = require('./NetSimGlobals');

var logger = require('./NetSimLogger').getSingleton();

/**
 * Generator and controller for bit-log, which receives bits one at a time.
 * @param {jQuery} rootDiv
 * @param {Object} options
 * @param {string} options.logTitle
 * @param {boolean} [options.isMinimized] defaults to FALSE
 * @param {boolean} [options.showReadWireButton] defaults to FALSE
 * @param {NetSim} options.netsim
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
   * Reference to the top-level NetSim controller for reading bits and
   * triggering animations.
   * @type {NetSim}
   * @private
   */
  this.netsim_ = options.netsim;

  /**
   * Whether this log should have a "Read Wire" button.
   * @type {boolean}
   * @private
   */
  this.showReadWireButton_ = options.showReadWireButton;

  /**
   * How tall the overall panel should be when it's open (in pixels).
   * Set by a dynamic resize system.
   * @type {number}
   * @private
   */
  this.openHeight_ = 0;

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
    showReadWireButton: this.showReadWireButton_
  }));
  this.getBody().html(newMarkup);
  NetSimEncodingControl.hideRowsByEncoding(this.getBody(), this.encodings_);


  this.getBody().find('#read-wire-button')
      .click(this.onReceiveButtonPress_.bind(this));

  // Add a clear button to the panel header
  this.addButton(i18n.clear(), this.onClearButtonPress_.bind(this));

  // Snap back to the dynamic size we've been given.
  this.sizeToOpenHeight_();
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
  this.netsim_.receiveBit(function (err, message) {
    if (err) {
      logger.warn("Error reading wire state: " + err.message);
      thisButton.removeAttr('disabled');
      return;
    }

    // A successful fetch with a null message means there's nothing
    // on the wire.  We should log its default state: off/zero
    var receivedBit = '0';
    if (message) {
      receivedBit = message.payload;
    }

    this.log(receivedBit);
    this.netsim_.animateReadWireState(receivedBit);
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

/**
 * Sets the vertical space that this log panel should consume (including margins)
 * @param {number} heightPixels
 */
NetSimBitLogPanel.prototype.setHeight = function (heightPixels) {
  this.openHeight_ = heightPixels;
  this.sizeToOpenHeight_();
};

/**
 * Scale the scroll area inside the panel so that the whole panel
 * is the desired height.
 * @private
 */
NetSimBitLogPanel.prototype.sizeToOpenHeight_ = function () {
  var root = this.getRoot().find('.netsim-panel');
  var panelHeader = root.find('h1');
  var panelBody = root.find('.panel-body');
  var scrollArea = root.find('.scroll-area');

  var panelMargins = parseFloat(root.css('margin-top')) +
      parseFloat(root.css('margin-bottom'));
  var headerHeight = panelHeader.outerHeight(true);
  var panelBorders = parseFloat(panelBody.css('border-top-width')) +
      parseFloat(panelBody.css('border-bottom-width'));
  var scrollMargins = parseFloat(scrollArea.css('margin-top')) +
      parseFloat(scrollArea.css('margin-bottom'));

  // We set the panel height by fixing the size of its inner scrollable
  // area.
  var newScrollViewportHeight = this.openHeight_ - (panelMargins + headerHeight +
      panelBorders + scrollMargins);
  scrollArea.height(Math.floor(newScrollViewportHeight));
};

/**
 * @returns {number} vertical space that panel currently consumes (including
 * margins) in pixels.
 */
NetSimBitLogPanel.prototype.getHeight = function () {
  return this.getRoot().find('.netsim-panel').outerHeight(true);
};

/**
 * After toggling panel visibility, trigger a layout update so send/log panel
 * space is shared correctly.
 * @private
 * @override
 */
NetSimBitLogPanel.prototype.onMinimizerClick_ = function () {
  NetSimBitLogPanel.superPrototype.onMinimizerClick_.call(this);
  NetSimGlobals.updateLayout();
};
