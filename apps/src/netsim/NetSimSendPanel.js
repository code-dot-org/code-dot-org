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
var i18n = require('../../locale/current/netsim');
var markup = require('./NetSimSendPanel.html');
var NetSimPanel = require('./NetSimPanel');
var NetSimPacketEditor = require('./NetSimPacketEditor');
var NetSimPacketSizeControl = require('./NetSimPacketSizeControl');
var Packet = require('./Packet');
var BITS_PER_BYTE = require('./netsimConstants').BITS_PER_BYTE;

/**
 * Generator and controller for message sending view.
 * @param {jQuery} rootDiv
 * @param {netsimLevelConfiguration} levelConfig
 * @param {NetSim} connection
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
  
  NetSimPanel.call(this, rootDiv, {
    className: 'netsim-send-panel',
    panelTitle: i18n.sendAMessage()
  });
};
NetSimSendPanel.inherits(NetSimPanel);

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
        this.rootDiv_.find('.packet_size'),
        this.packetSizeChangeCallback_.bind(this),
        {
          minimumPacketSize: Packet.Encoder.getHeaderLength(this.packetSpec_),
          sliderStepValue: 1
        });
    this.packetSizeControl_.setValue(this.maxPacketSize_);
  }

  // Bind useful elements and add handlers
  this.packetsDiv_ = this.getBody().find('.send-widget-packets');
  this.getBody()
      .find('#add_packet_button')
      .click(this.addPacket_.bind(this));
  this.getBody()
      .find('#send_button')
      .click(this.onSendButtonPress_.bind(this));

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
    packetSpec: this.packetSpec_,
    toAddress: newPacketToAddress,
    fromAddress: this.fromAddress_,
    packetIndex: newPacketCount,
    packetCount: newPacketCount,
    maxPacketSize: this.maxPacketSize_,
    chunkSize: this.chunkSize_,
    enabledEncodings: this.enabledEncodings_,
    removePacketCallback: this.removePacket_.bind(this)
  });

  // Attach the new packet to this SendPanel
  newPacket.getRoot().appendTo(this.packetsDiv_);
  newPacket.getRoot().hide().slideDown('fast');
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
  packet.getRoot()
      .slideUp('fast', function() { $(this).remove(); });

  // Remove from internal collection
  this.packets_ = this.packets_.filter(function (packetEditor) {
    return packetEditor !== packet;
  });

  // Adjust numbering of remaining packets
  var packetCount = this.packets_.length;
  var packetIndex;
  for (var i = 0; i < packetCount; i++) {
    packetIndex = i + 1;
    this.packets_[i].setPacketIndex(packetIndex);
    this.packets_[i].setPacketCount(packetCount);
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
 * Update from address for the panel, update all the packets to reflect this.
 * @param {number} fromAddress
 */
NetSimSendPanel.prototype.setFromAddress = function (fromAddress) {
  this.fromAddress_ = fromAddress;

  this.packets_.forEach(function (packetEditor) {
    packetEditor.setFromAddress(this.fromAddress_);
  }.bind(this));
};

/** Send message to connected remote */
NetSimSendPanel.prototype.onSendButtonPress_ = function () {
  // Make sure to perform packet truncation here.
  var packetBinaries = this.packets_.map(function (packetEditor) {
    return packetEditor.getPacketBinary().substr(0, this.maxPacketSize_);
  }.bind(this));

  var myNode = this.netsim_.myNode;
  if (myNode && packetBinaries.length > 0) {
    this.disableEverything();
    myNode.sendMessages(packetBinaries, function () {
      this.resetPackets_();
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
 * Show or hide parts of the send UI based on the currently selected encoding
 * mode.
 * @param {EncodingType[]} newEncodings
 */
NetSimSendPanel.prototype.setEncodings = function (newEncodings) {
  this.enabledEncodings_ = newEncodings;
  this.packets_.forEach(function (packetEditor) {
    packetEditor.setEncodings(newEncodings);
  });
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
