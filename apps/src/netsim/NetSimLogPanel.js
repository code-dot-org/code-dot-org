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
var markup = require('./NetSimLogPanel.html');
var packetMarkup = require('./NetSimLogPacket.html');
var NetSimPanel = require('./NetSimPanel');
var NetSimEncodingControl = require('./NetSimEncodingControl');

/**
 * Generator and controller for message log.
 * @param {jQuery} rootDiv
 * @param {Object} options
 * @param {string} options.logTitle
 * @param {boolean} [options.isMinimized] defaults to FALSE
 * @param {boolean} [options.hasUnreadMessages] defaults to FALSE
 * @param {packetHeaderSpec} options.packetSpec
 * @constructor
 * @augments NetSimPanel
 */
var NetSimLogPanel = module.exports = function (rootDiv, options) {
  /**
   * @type {packetHeaderSpec}
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
  this.scrollArea_ = this.getBody().find('.scroll_area');

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
 */
NetSimLogPanel.prototype.log = function (packetBinary) {
  var scrollArea = this.scrollArea_;
  var wasScrolledToEnd =
      scrollArea[0].scrollHeight - scrollArea[0].scrollTop <=
      scrollArea.outerHeight();

  var newPacket = new NetSimLogPacket(packetBinary, {
    packetSpec: this.packetSpec_,
    encodings: this.currentEncodings_,
    chunkSize: this.currentChunkSize_,
    isUnread: this.hasUnreadMessages_,
    markAsReadCallback: this.updateUnreadCount.bind(this)
  });
  newPacket.getRoot().appendTo(this.scrollArea_);
  this.packets_.push(newPacket);

  // Auto-scroll
  if (wasScrolledToEnd) {
    scrollArea.scrollTop(scrollArea[0].scrollHeight);
  }

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
 * @param {packetHeaderSpec} options.packetSpec
 * @param {EncodingType[]} options.encodings - which display style to use initially
 * @param {number} options.chunkSize - (or bytesize) to use when interpreting and
 *        formatting the data.
 * @param {boolean} options.isUnread - whether this packet should be styled
 *        as "unread" and have a "mark as read" button
 * @param {function} options.markAsReadCallback
 * @constructor
 */
var NetSimLogPacket = function (packetBinary, options) {
  /**
   * @type {string}
   * @private
   */
  this.packetBinary_ = packetBinary;

  /**
   * @type {packetHeaderSpec}
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

  if (this.isUnread) {
    this.rootDiv_.addClass('unread');
  }

  // Initial content population
  this.render();
};

/**
 * Re-render div contents to represent the packet in a different way.
 */
NetSimLogPacket.prototype.render = function () {
  var rawMarkup = packetMarkup({
    packetBinary: this.packetBinary_,
    packetSpec: this.packetSpec_,
    chunkSize: this.chunkSize_,
    isUnread: this.isUnread
  });
  var jQueryWrap = $(rawMarkup);
  NetSimEncodingControl.hideRowsByEncoding(jQueryWrap, this.encodings_);
  this.rootDiv_.html(jQueryWrap);
  this.rootDiv_.find('.mark-as-read-button').click(this.markAsRead.bind(this));
};

/**
 * Return root div, for hooking up to a parent element.
 * @returns {jQuery}
 */
NetSimLogPacket.prototype.getRoot = function () {
  return this.rootDiv_;
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
  this.isUnread = false;
  this.rootDiv_.removeClass('unread');
  this.markAsReadCallback_();
  this.render();
};
