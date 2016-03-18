/**
 * @overview UI component, a log panel (used as "Sent Packets" and
 *           "Received Packets") that is used in the packet-sending
 *           configurations of the simulator.
 *
 * @see INetSimLogPanel for the interface implemented here.
 * @see NetSimBitLogPanel for the component used in bit-sending mode.
 */
'use strict';

var utils = require('../utils');
var i18n = require('./locale');
var markup = require('./NetSimLogPanel.html.ejs');
var Packet = require('./Packet');
var packetMarkup = require('./NetSimLogPacket.html.ejs');
var NetSimPanel = require('./NetSimPanel');
var NetSimEncodingControl = require('./NetSimEncodingControl');
var NetSimGlobals = require('./NetSimGlobals');

/**
 * How long the "entrance" animation for new messages lasts, in milliseconds.
 * @type {number}
 * @const
 */
var MESSAGE_SLIDE_IN_DURATION_MS = 400;

/**
 * How many packets the log may keep in its history (and in the DOM!)
 * @type {number}
 * @const
 */
var DEFAULT_MAXIMUM_LOG_PACKETS = 50;

/**
 * Object that can be sent data to be browsed by the user at their discretion
 * @interface
 * @name INetSimLogPanel
 */

/**
 * Put data into the log
 * @function
 * @name INetSimLogPanel#log
 * @param {string} binary
 */

/**
 * Show or hide parts of the log based on the currently selected encoding mode.
 * @function
 * @name INetSimLogPanel#setEncodings
 * @param {EncodingType[]} newEncodings
 */

/**
 * Change how binary input in interpreted and formatted in the log.
 * @function
 * @name INetSimLogPanel#setChunkSize
 * @param {number} newChunkSize
 */

/**
 * @function
 * @name INetSimLogPanel#getHeight
 * @returns {number} vertical space that panel currently consumes (including
 *          margins) in pixels.
 */

/**
 * Sets the vertical space that this log panel should consume (including margins)
 * @function
 * @name INetSimLogPanel#setHeight
 * @param {number} heightPixels
 */

/**
 * Generator and controller for message log.
 * @param {jQuery} rootDiv
 * @param {Object} options
 * @param {string} options.logTitle
 * @param {boolean} [options.isMinimized] defaults to FALSE
 * @param {boolean} [options.hasUnreadMessages] defaults to FALSE
 * @param {Packet.HeaderType[]} options.packetSpec
 * @param {number} [options.maximumLogPackets] How many packets the log will
 *        keep before it starts dropping the oldest ones.  Defaults to
 *        DEFAULT_MAXIMUM_LOG_PACKETS.
 * @constructor
 * @augments NetSimPanel
 * @implements INetSimLogPanel
 */
var NetSimLogPanel = module.exports = function (rootDiv, options) {
  /**
   * @type {Packet.HeaderType[]}
   * @private
   */
  this.packetSpec_ = options.packetSpec;

  /**
   * List of controllers for currently displayed packets.
   * @type {Array.<NetSimLogPacket>}
   * @private
   */
  this.packets_ = [];

  /**
   * A message encoding (display) setting.
   * @type {string}
   * @private
   */
  this.currentEncodings_ = [];

  /**
   * Current chunk size (bytesize) for interpreting binary in the log.
   * @type {number}
   * @private
   */
  this.currentChunkSize_ = 8;

  /**
   * Localized panel title
   * @type {string}
   * @private
   */
  this.logTitle_ = options.logTitle;

  /**
   * Whether newly logged messages in this log should be marked as unread
   * @type {boolean}
   * @private
   */
  this.hasUnreadMessages_ = !!(options.hasUnreadMessages);

  /**
   * The maximum number of packets this log panel will keep in its memory
   * and in the DOM, so we don't have a forever-growing log.
   * @type {number}
   * @private,,
   */
  this.maximumLogPackets_ = utils.valueOr(options.maximumLogPackets,
      DEFAULT_MAXIMUM_LOG_PACKETS);

  // Initial render
  NetSimPanel.call(this, rootDiv, {
    className: 'netsim-log-panel',
    panelTitle: options.logTitle,
    beginMinimized: options.isMinimized
  });
};
NetSimLogPanel.inherits(NetSimPanel);

NetSimLogPanel.prototype.render = function () {
  // Create boilerplate panel markup
  NetSimLogPanel.superPrototype.render.call(this);

  // Add our own content markup
  var newMarkup = $(markup({}));
  this.getBody().html(newMarkup);

  // Add a clear button to the panel header
  this.addButton(i18n.clear(), this.onClearButtonPress_.bind(this));

  // Bind reference to scrollArea for use when logging.
  this.scrollArea_ = this.getBody().find('.scroll-area');

  this.updateUnreadCount();
};

/**
 * Remove all packets from the log, resetting its state.
 * @private
 */
NetSimLogPanel.prototype.onClearButtonPress_ = function () {
  this.scrollArea_.empty();
  this.packets_.length = 0;

  this.updateUnreadCount();
};

/**
 * Put a message into the log.
 * @param {string} packetBinary
 * @param {number} packetID
 */
NetSimLogPanel.prototype.log = function (packetBinary, packetID) {

  var packetAlreadyInLog = this.packets_.some(function (packet) {
    return packet.packetID === packetID;
  });

  if (packetAlreadyInLog) {
    return;
  }

  // Remove all packets that are beyond our maximum size
  this.packets_
      .splice(this.maximumLogPackets_ - 1, this.packets_.length)
      .forEach(function (packet) {
        packet.getRoot().remove();
      });

  var newPacket = new NetSimLogPacket(packetBinary, packetID, {
    packetSpec: this.packetSpec_,
    encodings: this.currentEncodings_,
    chunkSize: this.currentChunkSize_,
    isUnread: this.hasUnreadMessages_,
    markAsReadCallback: this.updateUnreadCount.bind(this)
  });

  newPacket.getRoot().prependTo(this.scrollArea_);

  var scrollTop = this.scrollArea_.scrollTop();

  if (scrollTop === 0) {
    // If scrolled to the top, animate a pretty slidedown
    newPacket.getRoot().hide();
    newPacket.getRoot().slideDown(MESSAGE_SLIDE_IN_DURATION_MS);
  } else {
    // If we're somewhere in the middle of the messages, scroll "down"
    // to maintain our place relative to the messages we're looking at

    // Scrolling only takes the bottom margin into account, not top
    var packetHeight = newPacket.getRoot().outerHeight() +
        parseInt(newPacket.getRoot().css('marginBottom'));

    this.scrollArea_.scrollTop(scrollTop + packetHeight);
  }

  this.packets_.unshift(newPacket);

  this.updateUnreadCount();
};

NetSimLogPanel.prototype.updateUnreadCount = function () {
  var unreadCount = this.packets_.reduce(function (prev, cur) {
    return prev + (cur.isUnread ? 1 : 0);
  }, 0);

  if (unreadCount > 0) {
    this.setPanelTitle(i18n.appendCountToTitle({
      title: this.logTitle_,
      count: unreadCount
    }));
  } else {
    this.setPanelTitle(this.logTitle_);
  }
};

/**
 * Show or hide parts of the send UI based on the currently selected encoding
 * mode.
 * @param {EncodingType[]} newEncodings
 */
NetSimLogPanel.prototype.setEncodings = function (newEncodings) {
  this.currentEncodings_ = newEncodings;
  this.packets_.forEach(function (packet) {
    packet.setEncodings(newEncodings);
  });
};

/**
 * Change how binary input in interpreted and formatted in the log.
 * @param {number} newChunkSize
 */
NetSimLogPanel.prototype.setChunkSize = function (newChunkSize) {
  this.currentChunkSize_ = newChunkSize;
  this.packets_.forEach(function (packet) {
    packet.setChunkSize(newChunkSize);
  });
};

/**
 * A component/controller for display of an individual packet in the log.
 * @param {string} packetBinary - raw packet data
 * @param {Object} options
 * @param {Packet.HeaderType[]} options.packetSpec
 * @param {EncodingType[]} options.encodings - which display style to use initially
 * @param {number} options.chunkSize - (or bytesize) to use when interpreting and
 *        formatting the data.
 * @param {boolean} options.isUnread - whether this packet should be styled
 *        as "unread" and have a "mark as read" button
 * @param {function} options.markAsReadCallback
 * @constructor
 */
var NetSimLogPacket = function (packetBinary, packetID, options) {

  /**
   * @type {number}
   */
  this.packetID = packetID;

  /**
   * @type {string}
   * @private
   */
  this.packetBinary_ = packetBinary;

  /**
   * @type {Packet.HeaderType[]}
   * @private
   */
  this.packetSpec_ = options.packetSpec;

  /**
   * @type {EncodingType[]}
   * @private
   */
  this.encodings_ = options.encodings;

  /**
   * @type {number}
   * @private
   */
  this.chunkSize_ = options.chunkSize;

  /**
   * @type {boolean}
   */
  this.isUnread = options.isUnread;

  /**
   * @type {boolean}
   */
  this.isMinimized = false;

  /**
   * @type {function}
   * @private
   */
  this.markAsReadCallback_ = options.markAsReadCallback;

  /**
   * Wrapper div that we create once, and fill repeatedly with render()
   * @type {jQuery}
   * @private
   */
  this.rootDiv_ = $('<div>').addClass('packet');
  this.rootDiv_.click(this.markAsRead.bind(this));

  // Initial content population
  this.render();
};

/**
 * Re-render div contents to represent the packet in a different way.
 */
NetSimLogPacket.prototype.render = function () {
  var encodingsHash = NetSimEncodingControl.encodingsAsHash(this.encodings_);
  var rawMarkup = packetMarkup({
    packetBinary: this.packetBinary_,
    packetSpec: this.packetSpec_,
    enabledEncodingsHash: encodingsHash,
    chunkSize: this.chunkSize_,
    isMinimized: this.isMinimized
  });
  var jQueryWrap = $(rawMarkup);
  NetSimLogPanel.adjustHeaderColumnWidths(jQueryWrap);
  NetSimEncodingControl.hideRowsByEncoding(jQueryWrap, this.encodings_);
  this.rootDiv_.html(jQueryWrap);
  this.rootDiv_.find('.expander').click(this.toggleMinimized.bind(this));
  this.rootDiv_.toggleClass('unread', this.isUnread);
};

/**
 * Return root div, for hooking up to a parent element.
 * @returns {jQuery}
 */
NetSimLogPacket.prototype.getRoot = function () {
  return this.rootDiv_;
};

/**
 * Beneath the given root element, adjust widths of packet header columns
 * and fields to match the level's configured packet format.
 * @param {jQuery} rootElement
 */
NetSimLogPanel.adjustHeaderColumnWidths = function (rootElement) {
  var level = NetSimGlobals.getLevelConfig();
  var encoder = new Packet.Encoder(
      level.addressFormat,
      level.packetCountBitWidth,
      level.clientInitialPacketHeader);
  var addressBitWidth = encoder.getFieldBitWidth(
      Packet.HeaderType.TO_ADDRESS);
  var packetInfoBitWidth = encoder.getFieldBitWidth(
      Packet.HeaderType.PACKET_COUNT);

  // Adjust width of address columns
  // For columns, 50px is sufficient for 4 bits
  var PX_PER_BIT = 50 / 4;
  var addressColumnWidthInPx = PX_PER_BIT * addressBitWidth;

  // Adjust width of address columns
  rootElement.find('td.toAddress, th.toAddress, td.fromAddress, th.fromAddress')
      .css('width', addressColumnWidthInPx + 'px');


  // Adjust width of address input fields
  // For inputs, 3em is sufficient for 4 bits
  var EMS_PER_BIT = 3 / 4;
  var addressFieldWidthInEms = EMS_PER_BIT * addressBitWidth;
  rootElement.find('td.toAddress input, td.fromAddress input')
      .css('width', addressFieldWidthInEms + 'em');


  // Adjust width of packet info column
  // Packet info column uses two fields and an extra 21px for " of "
  var packetInfoColumnWidthInPx = (2 * PX_PER_BIT * packetInfoBitWidth) + 21;
  rootElement.find('td.packetInfo, th.packetInfo')
      .css('width', packetInfoColumnWidthInPx + 'px');

  // Adjust width of packet info fields
  var packetInfoFieldWidthInEms = EMS_PER_BIT * packetInfoBitWidth;
  rootElement.find('td.packetInfo input')
      .css('width', packetInfoFieldWidthInEms + 'em');
};

/**
 * Change encoding-display setting and re-render packet contents accordingly.
 * @param {EncodingType[]} newEncodings
 */
NetSimLogPacket.prototype.setEncodings = function (newEncodings) {
  this.encodings_ = newEncodings;
  this.render();
};

/**
 * Change chunk size for interpreting data and re-render packet contents
 * accordingly.
 * @param {number} newChunkSize
 */
NetSimLogPacket.prototype.setChunkSize = function (newChunkSize) {
  this.chunkSize_ = newChunkSize;
  this.render();
};

/**
 * Mark the packet as read, changing its style and removing the "mark as read"
 * button.
 */
NetSimLogPacket.prototype.markAsRead = function () {
  if (this.isUnread) {
    this.isUnread = false;
    this.render();
    this.markAsReadCallback_();
  }
};

NetSimLogPacket.prototype.toggleMinimized = function () {
  this.isMinimized = !this.isMinimized;
  this.render();
};

/**
 * Sets the vertical space that this log panel should consume (including margins)
 * @param {number} heightPixels
 */
NetSimLogPanel.prototype.setHeight = function (heightPixels) {
  var root = this.getRoot().find('.netsim-panel');
  var panelHeader = root.find('h1');
  var panelBody = root.find('.panel-body');

  var panelMargins = parseFloat(root.css('margin-top')) +
      parseFloat(root.css('margin-bottom'));
  var headerHeight = panelHeader.outerHeight(true);
  var panelBorders = parseFloat(panelBody.css('border-top-width')) +
      parseFloat(panelBody.css('border-bottom-width'));
  var scrollMargins = parseFloat(this.scrollArea_.css('margin-top')) +
      parseFloat(this.scrollArea_.css('margin-bottom'));

  // We set the panel height by fixing the size of its inner scrollable
  // area.
  var newScrollViewportHeight = heightPixels - (panelMargins + headerHeight +
      panelBorders + scrollMargins);
  this.scrollArea_.height(Math.floor(newScrollViewportHeight));
};

/**
 * @returns {number} vertical space that panel currently consumes (including
 *          margins) in pixels.
 */
NetSimLogPanel.prototype.getHeight = function () {
  return this.getRoot().find('.netsim-panel').outerHeight(true);
};

/**
 * After toggling panel visibility, trigger a layout update so send/log panel
 * space is shared correctly.
 * @private
 * @override
 */
NetSimLogPanel.prototype.onMinimizerClick_ = function () {
  NetSimLogPanel.superPrototype.onMinimizerClick_.call(this);
  NetSimGlobals.updateLayout();
};
