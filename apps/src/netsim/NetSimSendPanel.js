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

var utils = require('../utils');
var i18n = require('./locale');
var markup = require('./NetSimSendPanel.html.ejs');
var NetSimPanel = require('./NetSimPanel');
var NetSimPacketEditor = require('./NetSimPacketEditor');
var NetSimPacketSizeControl = require('./NetSimPacketSizeControl');
var Packet = require('./Packet');
var dataConverters = require('./dataConverters');
var netsimConstants = require('./netsimConstants');

var EncodingType = netsimConstants.EncodingType;
var MessageGranularity = netsimConstants.MessageGranularity;
var BITS_PER_BYTE = netsimConstants.BITS_PER_BYTE;

var binaryToAB = dataConverters.binaryToAB;

var logger = require('./NetSimLogger').getSingleton();

/**
 * Generator and controller for message sending view.
 * @param {jQuery} rootDiv
 * @param {netsimLevelConfiguration} levelConfig
 * @param {NetSim} netsim
 * @constructor
 * @augments NetSimPanel
 */
var NetSimSendPanel = module.exports = function (rootDiv, levelConfig,
    netsim) {

  /**
   * @type {netsimLevelConfiguration}
   * @private
   */
  this.levelConfig_ = levelConfig;

  /**
   * @type {packetHeaderSpec}
   * @private
   */
  this.packetSpec_ = levelConfig.clientInitialPacketHeader;

  /**
   * Connection that owns the router we will represent / manipulate
   * @type {NetSim}
   * @private
   */
  this.netsim_ = netsim;

  /**
   * List of controllers for packets currently being edited.
   * @type {NetSimPacketEditor[]}
   * @private
   */
  this.packets_ = [];

  /**
   * Our local node's address, zero until assigned by a router.
   * @type {number}
   * @private
   */
  this.fromAddress_ = 0;

  /**
   * Maximum packet length configurable by slider.
   * @type {number}
   * @private
   */
  this.maxPacketSize_ = levelConfig.defaultPacketSizeLimit;

  /**
   * Byte-size used for formatting binary and for interpreting it
   * to decimal or ASCII.
   * @type {number}
   * @private
   */
  this.chunkSize_ = BITS_PER_BYTE;

  /**
   * Local device bitrate in bits-per-second, which affects send animation
   * speed.
   * @type {number}
   * @private
   */
  this.bitRate_ = Infinity;

  /**
   * What encodings are currently selected and displayed in each
   * packet and packet editor.
   * @type {EncodingType[]}
   * @private
   */
  this.enabledEncodings_ = levelConfig.defaultEnabledEncodings;

  /**
   * Reference to parent div of packet editor list, for adding and
   * removing packet editors.
   * @type {jQuery}
   * @private
   */
  this.packetsDiv_ = null;

  /**
   * @type {NetSimPacketSizeControl}
   * @private
   */
  this.packetSizeControl_ = null;

  /**
   * Flag for whether this panel is in "sending" mode, non-interactive while
   * it animates the send process for the current message.
   * @type {boolean}
   * @private
   */
  this.isPlayingSendAnimation_ = false;

  var panelTitle = (levelConfig.messageGranularity === MessageGranularity.PACKETS) ?
      i18n.sendAMessage() : i18n.sendBits();

  // TODO: Bad private member access
  this.netsim_.runLoop_.tick.register(this.tick.bind(this));

  NetSimPanel.call(this, rootDiv, {
    className: 'netsim-send-panel',
    panelTitle: panelTitle
  });
};
NetSimSendPanel.inherits(NetSimPanel);

/**
 * Puts send panel in a "sending packets" noninteractive state and begins
 * sending packets to remote.
 * @private
 */
NetSimSendPanel.prototype.beginSendingPackets_ = function () {
  this.isPlayingSendAnimation_ = true;
  this.disableEverything();
};

/**
 * Resets send panel, emptying packets, making it interactive, and stopping
 * the remote-send process.
 * @private
 */
NetSimSendPanel.prototype.stopSendingPackets_ = function () {
  this.resetPackets_();
  this.enableEverything();
  this.isPlayingSendAnimation_ = false;
};

/**
 * Send panel uses its tick to "send" packets at different bitrates, animating
 * the binary draining out of the widget and actually posting each packet
 * to storage as it completes.
 * @param {RunLoop.Clock} clock
 */
NetSimSendPanel.prototype.tick = function (clock) {
  if (!this.isPlayingSendAnimation_) {
    return;
  }

  // Nothing left to send, we're done.
  if (this.packets_.length === 0) {
    this.stopSendingPackets_();
    return;
  }

  var firstPacket = this.packets_[0];
  if (firstPacket.isSending()) {
    firstPacket.tick(clock);
  } else {
    firstPacket.beginSending(this.netsim_.myNode);
  }
};

/** Replace contents of our root element with our own markup. */
NetSimSendPanel.prototype.render = function () {
  // Render boilerplate panel stuff
  NetSimSendPanel.superPrototype.render.call(this);

  // Put our own content into the panel body
  var newMarkup = $(markup({
    level: this.levelConfig_
  }));
  this.getBody().html(newMarkup);

  // Add packet size slider control
  if (this.levelConfig_.showPacketSizeControl) {
    this.packetSizeControl_ = new NetSimPacketSizeControl(
        this.rootDiv_.find('.packet-size'),
        this.packetSizeChangeCallback_.bind(this),
        {
          minimumPacketSize: Packet.Encoder.getHeaderLength(this.packetSpec_),
          sliderStepValue: 1
        });
    this.packetSizeControl_.setValue(this.maxPacketSize_);
  }

  // Bind useful elements and add handlers
  this.packetsDiv_ = this.getBody().find('.send-panel-packets');
  this.getBody()
      .find('#add-packet-button')
      .click(this.onAddPacketButtonPress_.bind(this));
  // TODO: NetSim buttons in this panel need to do nothing if disabled!
  this.getBody()
      .find('#send-button')
      .click(this.onSendButtonPress_.bind(this));
  this.getBody()
      .find('#set-wire-button')
      .click(this.onSetWireButtonPress_.bind(this));

  // Note: At some point, we might want to replace this with something
  // that nicely re-renders the contents of this.packets_... for now,
  // we only call render for set-up, so it's okay.
  this.resetPackets_();
};

/**
 * Add a new, blank packet to the set of packets being edited.
 * @private
 */
NetSimSendPanel.prototype.addPacket_ = function () {
  var newPacketCount = this.packets_.length + 1;

  // Update the total packet count on all existing packets
  this.packets_.forEach(function (packetEditor) {
    packetEditor.setPacketCount(newPacketCount);
  });

  // Copy the to address of the previous packet, for convenience.
  // TODO: Do we need to lock the toAddress for all of these packets together?
  var newPacketToAddress = 0;
  if (this.packets_.length > 0) {
    newPacketToAddress = this.packets_[this.packets_.length - 1].toAddress;
  }

  // Create a new packet
  var newPacket = new NetSimPacketEditor({
    messageGranularity: this.levelConfig_.messageGranularity,
    packetSpec: this.packetSpec_,
    toAddress: newPacketToAddress,
    fromAddress: this.fromAddress_,
    packetIndex: newPacketCount,
    packetCount: newPacketCount,
    maxPacketSize: this.maxPacketSize_,
    chunkSize: this.chunkSize_,
    bitRate: this.bitRate_,
    enabledEncodings: this.enabledEncodings_,
    removePacketCallback: this.removePacket_.bind(this),
    contentChangeCallback: this.onContentChange_.bind(this)
  });

  // Attach the new packet to this SendPanel
  var updateLayout = this.netsim_.updateLayout.bind(this.netsim_);
  newPacket.getRoot().appendTo(this.packetsDiv_);
  newPacket.getRoot().hide().slideDown('fast', updateLayout);
  this.packets_.push(newPacket);
};

/**
 * Remove a packet from the send panel, and adjust other packets for
 * consistency.
 * @param {NetSimPacketEditor} packet
 * @private
 */
NetSimSendPanel.prototype.removePacket_ = function (packet) {
  // Remove from DOM
  var updateLayout = this.netsim_.updateLayout.bind(this.netsim_);
  packet.getRoot()
      .slideUp('fast', function() {
        $(this).remove();
        updateLayout();
      });

  // Remove from internal collection
  this.packets_ = this.packets_.filter(function (packetEditor) {
    return packetEditor !== packet;
  });

  // Adjust numbering of remaining packets if we're not mid-send
  if (!this.isPlayingSendAnimation_) {
    var packetCount = this.packets_.length;
    var packetIndex;
    for (var i = 0; i < packetCount; i++) {
      packetIndex = i + 1;
      this.packets_[i].setPacketIndex(packetIndex);
      this.packets_[i].setPacketCount(packetCount);
    }
  }
};

/**
 * Remove all packet editors from the panel.
 * @private
 */
NetSimSendPanel.prototype.resetPackets_ = function () {
  this.packetsDiv_.empty();
  this.packets_.length = 0;
  this.addPacket_();
};

/**
 * When any packet editor's binary content changes, we may want
 * to update UI wrapper elements (like the "set next bit" button)
 * in response
 * @private
 */
NetSimSendPanel.prototype.onContentChange_ = function () {
  var nextBit = this.getNextBit_();

  // Special case: If we have the "A/B" encoding enabled but _not_ "Binary",
  // format this button label using the "A/B" convention
  if (this.isEncodingEnabled_(EncodingType.A_AND_B) &&
      !this.isEncodingEnabled_(EncodingType.BINARY)) {
    nextBit = binaryToAB(nextBit);
  }

  this.getBody()
      .find('#set-wire-button')
      .text(i18n.setWireToValue({ value: nextBit }));
};

/**
 * Check whether the given encoding is currently displayed by the panel.
 * @param {EncodingType} queryEncoding
 * @returns {boolean}
 * @private
 */
NetSimSendPanel.prototype.isEncodingEnabled_ = function (queryEncoding) {
  return this.enabledEncodings_.some(function (enabledEncoding) {
    return enabledEncoding === queryEncoding;
  });
};

/**
 * Update from address for the panel, update all the packets to reflect this.
 * @param {number} [fromAddress] default zero
 */
NetSimSendPanel.prototype.setFromAddress = function (fromAddress) {
  // fromAddress can be undefined for other parts of the sim, but within
  // the send panel we just set it to zero.
  this.fromAddress_ = utils.valueOr(fromAddress, 0);

  this.packets_.forEach(function (packetEditor) {
    packetEditor.setFromAddress(this.fromAddress_);
  }.bind(this));
};

/**
 * @param {Event} jQueryEvent
 * @private
 */
NetSimSendPanel.prototype.onAddPacketButtonPress_ = function (jQueryEvent) {
  var thisButton = $(jQueryEvent.target);
  if (thisButton.is('[disabled]')) {
    return;
  }

  this.addPacket_();

  // Scroll to end of packet area
  var scrollingArea = this.getBody().find('.send-panel-packets');
  scrollingArea.animate({ scrollTop: scrollingArea[0].scrollHeight }, 'fast');
};

/**
 * Send message to connected remote
 * @param {Event} jQueryEvent
 * @private
 */
NetSimSendPanel.prototype.onSendButtonPress_ = function (jQueryEvent) {
  var thisButton = $(jQueryEvent.target);
  if (thisButton.is('[disabled]')) {
    return;
  }

  this.beginSendingPackets_();
};

/**
 * Send a single bit, manually 'setting the wire state'.
 * @param {Event} jQueryEvent
 * @private
 */
NetSimSendPanel.prototype.onSetWireButtonPress_ = function (jQueryEvent) {
  var thisButton = $(jQueryEvent.target);
  if (thisButton.is('[disabled]')) {
    return;
  }

  var myNode = this.netsim_.myNode;
  if (!myNode) {
    throw new Error("Tried to set wire state when no connection is established.");
  }

  // Find the first bit of the first packet.  Set the wire to 0/off if
  // there is no first bit.
  this.disableEverything();
  this.netsim_.animateSetWireState(this.getNextBit_());
  myNode.setSimplexWireState(this.getNextBit_(), function (err) {
    if (err) {
      logger.warn(err.message);
      return;
    }

    this.consumeFirstBit();
    this.enableEverything();
  }.bind(this));
};

/**
 * Get the next bit that would be sent, if sending the entered message one
 * bit at a time.
 * @returns {string} single bit as a "0" or "1"
 * @private
 */
NetSimSendPanel.prototype.getNextBit_ = function () {
  return this.packets_.length > 0 ? this.packets_[0].getFirstBit() : '0';
};

/** Disable all controls in this panel, usually during network activity. */
NetSimSendPanel.prototype.disableEverything = function () {
  this.getBody().find('input, textarea').prop('disabled', true);
  this.getBody().find('.netsim-button').attr('disabled', 'disabled');
  if (this.packetSizeControl_) {
    this.packetSizeControl_.disable();
  }
};

/** Enable all controls in this panel, usually after network activity. */
NetSimSendPanel.prototype.enableEverything = function () {
  this.getBody().find('input, textarea').prop('disabled', false);
  this.getBody().find('.netsim-button').removeAttr('disabled');
  if (this.packetSizeControl_) {
    this.packetSizeControl_.enable();
  }
};

/**
 * Remove the first bit of the first packet, usually because we just sent
 * a single bit in variant 1.
 */
NetSimSendPanel.prototype.consumeFirstBit = function () {
  if (this.packets_.length > 0) {
    this.packets_[0].consumeFirstBit();
    if (this.packets_[0].getPacketBinary() === '' && this.packets_.length > 1) {
      this.removePacket_(this.packets_[0]);
    }
  }
};

/**
 * Show or hide parts of the send UI based on the currently selected encoding
 * mode.
 * @param {EncodingType[]} newEncodings
 */
NetSimSendPanel.prototype.setEncodings = function (newEncodings) {
  this.enabledEncodings_ = newEncodings;
  this.packets_.forEach(function (packetEditor) {
    packetEditor.setEncodings(newEncodings);
  });
  this.onContentChange_();
};

/**
 * Change how data is interpreted and formatted by this component, triggering
 * an update of all input fields.
 * @param {number} newChunkSize
 */
NetSimSendPanel.prototype.setChunkSize = function (newChunkSize) {
  this.chunkSize_ = newChunkSize;
  this.packets_.forEach(function (packetEditor) {
    packetEditor.setChunkSize(newChunkSize);
  });
};

/**
 * Change the local device bitrate which affects send animation speed.
 * @param {number} newBitRate in bits per second
 */
NetSimSendPanel.prototype.setBitRate = function (newBitRate) {
  this.bitRate_ = newBitRate;
  this.packets_.forEach(function (packetEditor) {
    packetEditor.setBitRate(newBitRate);
  });
};

/**
 * Callback passed down into packet size control, called when packet size
 * is changed by the user.
 * @param {number} newPacketSize
 * @private
 */
NetSimSendPanel.prototype.packetSizeChangeCallback_ = function (newPacketSize) {
  this.maxPacketSize_ = newPacketSize;
  this.packets_.forEach(function (packetEditor){
    packetEditor.setMaxPacketSize(newPacketSize);
  });
};
