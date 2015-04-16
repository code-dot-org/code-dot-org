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

var buildMarkup = require('./NetSimTabsComponent.html');
var NetSimRouterTab = require('./NetSimRouterTab');
var NetSimMyDeviceTab = require('./NetSimMyDeviceTab');
var NetSimDnsTab = require('./NetSimDnsTab');
var NetSimTabType = require('./netsimConstants').NetSimTabType;
var shouldShowTab = require('./netsimUtils').shouldShowTab;

/**
 * Wrapper component for tabs panel on the right side of the page.
 * @param {jQuery} rootDiv
 * @param {netsimLevelConfiguration} levelConfig
 * @param {RunLoop} runLoop
 * @param {Object} callbacks
 * @param {function} callbacks.chunkSizeSliderChangeCallback
 * @param {function} callbacks.myDeviceBitRateChangeCallback
 * @param {function} callbacks.encodingChangeCallback
 * @param {function} callbacks.routerBandwidthSliderChangeCallback
 * @param {function} callbacks.routerBandwidthSliderStopCallback
 * @param {function} callbacks.routerMemorySliderChangeCallback
 * @param {function} callbacks.routerMemorySliderStopCallback
 * @param {function} callbacks.dnsModeChangeCallback
 * @param {function} callbacks.becomeDnsCallback
 * @constructor
 */
var NetSimTabsComponent = module.exports = function (rootDiv, levelConfig, runLoop,
    callbacks) {
  /**
   * Component root, which we fill whenever we call render()
   * @type {jQuery}
   * @private
   */
  this.rootDiv_ = rootDiv;

  /**
   * @type {netsimLevelConfiguration}
   * @private
   */
  this.levelConfig_ = levelConfig;

  /**
   * @type {RunLoop}
   * @private
   */
  this.runLoop_ = runLoop;

  /**
   * @type {function}
   * @private
   */
  this.chunkSizeSliderChangeCallback_ = callbacks.chunkSizeSliderChangeCallback;

  /**
   * @type {function}
   * @private
   */
  this.myDeviceBitRateChangeCallback_ = callbacks.myDeviceBitRateChangeCallback;

  /**
   * @type {function}
   * @private
   */
  this.encodingChangeCallback_ = callbacks.encodingChangeCallback;

  /**
   * @type {function}
   * @private
   */
  this.routerBandwidthSliderChangeCallback_ =
      callbacks.routerBandwidthSliderChangeCallback;

  /**
   * @type {function}
   * @private
   */
  this.routerBandwidthSliderStopCallback_ =
      callbacks.routerBandwidthSliderStopCallback;

  /**
   * @type {function}
   * @private
   */
  this.routerMemorySliderChangeCallback_ =
      callbacks.routerMemorySliderChangeCallback;

  /**
   * @type {function}
   * @private
   */
  this.routerMemorySliderStopCallback_ =
      callbacks.routerMemorySliderStopCallback;

  /**
   * @type {function}
   * @private
   */
  this.dnsModeChangeCallback_ = callbacks.dnsModeChangeCallback;

  /**
   * @type {function}
   * @private
   */
  this.becomeDnsCallback_ = callbacks.becomeDnsCallback;

  /**
   * @type {NetSimRouterTab}
   * @private
   */
  this.routerTab_ = null;

  /**
   * @type {NetSimMyDeviceTab}
   * @private
   */
  this.myDeviceTab_ = null;

  /**
   * @type {NetSimDnsTab}
   * @private
   */
  this.dnsTab_ = null;

  // Initial render
  this.render();
};

/**
 * @param {RunLoop} runLoop
 */
NetSimTabsComponent.prototype.attachToRunLoop = function (runLoop) {
  if (this.routerTab_) {
    this.routerTab_.attachToRunLoop(runLoop);
  }
};

/**
 * Fill the root div with new elements reflecting the current state
 */
NetSimTabsComponent.prototype.render = function () {
  var rawMarkup = buildMarkup({
    level: this.levelConfig_
  });
  var jQueryWrap = $(rawMarkup);
  this.rootDiv_.html(jQueryWrap);
  this.rootDiv_.find('.netsim-tabs').tabs({
    active: this.levelConfig_.defaultTabIndex
  });

  if (shouldShowTab(this.levelConfig_, NetSimTabType.MY_DEVICE)) {
    this.myDeviceTab_ = new NetSimMyDeviceTab(
        this.rootDiv_.find('#tab_my_device'),
        this.levelConfig_,
        this.runLoop_,
        this.chunkSizeSliderChangeCallback_,
        this.myDeviceBitRateChangeCallback_,
        this.encodingChangeCallback_);
  }

  if (shouldShowTab(this.levelConfig_, NetSimTabType.ROUTER)) {
    this.routerTab_ = new NetSimRouterTab(
        this.rootDiv_.find('#tab_router'),
        this.levelConfig_,
        {
          bandwidthSliderChangeCallback: this.routerBandwidthSliderChangeCallback_,
          bandwidthSliderStopCallback: this.routerBandwidthSliderStopCallback_,
          memorySliderChangeCallback: this.routerMemorySliderChangeCallback_,
          memorySliderStopCallback: this.routerMemorySliderStopCallback_
        });
  }

  if (shouldShowTab(this.levelConfig_, NetSimTabType.DNS)) {
    this.dnsTab_ = new NetSimDnsTab(
        this.rootDiv_.find('#tab_dns'),
        this.levelConfig_,
        this.dnsModeChangeCallback_,
        this.becomeDnsCallback_);
  }
};

/** @param {number} newChunkSize */
NetSimTabsComponent.prototype.setChunkSize = function (newChunkSize) {
  if (this.myDeviceTab_) {
    this.myDeviceTab_.setChunkSize(newChunkSize);
  }
};

/** @param {number} newBitRate in bits per second */
NetSimTabsComponent.prototype.setMyDeviceBitRate = function (newBitRate) {
  if (this.myDeviceTab_) {
    this.myDeviceTab_.setBitRate(newBitRate);
  }
};

/** @param {EncodingType[]} newEncodings */
NetSimTabsComponent.prototype.setEncodings = function (newEncodings) {
  if (this.myDeviceTab_) {
    this.myDeviceTab_.setEncodings(newEncodings);
  }
};

/** @param {number} creationTimestampMs */
NetSimTabsComponent.prototype.setRouterCreationTime = function (creationTimestampMs) {
  if (this.routerTab_) {
    this.routerTab_.setRouterCreationTime(creationTimestampMs);
  }
};

/** @param {number} newBandwidth in bits/second */
NetSimTabsComponent.prototype.setRouterBandwidth = function (newBandwidth) {
  if (this.routerTab_) {
    this.routerTab_.setBandwidth(newBandwidth);
  }
};

/** @param {number} newMemory in bits */
NetSimTabsComponent.prototype.setRouterMemory = function (newMemory) {
  if (this.routerTab_) {
    this.routerTab_.setMemory(newMemory);
  }
};

/**
 * @param {number} queuedPacketCount
 */
NetSimTabsComponent.prototype.setRouterQueuedPacketCount = function (queuedPacketCount) {
  if (this.routerTab_) {
    this.routerTab_.setRouterQueuedPacketCount(queuedPacketCount);
  }
};

/** @param {number} usedMemoryInBits */
NetSimTabsComponent.prototype.setRouterMemoryInUse = function (usedMemoryInBits) {
  if (this.routerTab_) {
    this.routerTab_.setMemoryInUse(usedMemoryInBits);
  }
};

NetSimTabsComponent.prototype.setRouterDataRate = function (dataRateBitsPerSecond) {
  if (this.routerTab_) {
    this.routerTab_.setDataRate(dataRateBitsPerSecond);
  }
};

/** @param {string} newDnsMode */
NetSimTabsComponent.prototype.setDnsMode = function (newDnsMode) {
  if (this.dnsTab_) {
    this.dnsTab_.setDnsMode(newDnsMode);
  }
};

/** @param {boolean} isDnsNode */
NetSimTabsComponent.prototype.setIsDnsNode = function (isDnsNode) {
  if (this.dnsTab_) {
    this.dnsTab_.setIsDnsNode(isDnsNode);
  }
};

/** @param {Array} tableContents */
NetSimTabsComponent.prototype.setDnsTableContents = function (tableContents) {
  if (this.dnsTab_) {
    this.dnsTab_.setDnsTableContents(tableContents);
  }
};

/** @param {Array} logData */
NetSimTabsComponent.prototype.setRouterLogData = function (logData) {
  if (this.routerTab_) {
    this.routerTab_.setRouterLogData(logData);
  }
};
