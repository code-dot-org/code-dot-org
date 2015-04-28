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

var markup = require('./NetSimRouterTab.html.ejs');
var NetSimBandwidthControl = require('./NetSimBandwidthControl');
var NetSimMemoryControl = require('./NetSimMemoryControl');
var NetSimRouterLogTable = require('./NetSimRouterLogTable');
var NetSimRouterStatsTable = require('./NetSimRouterStatsTable');

/**
 * Generator and controller for router information view.
 * @param {jQuery} rootDiv - Parent element for this component.
 * @param {netsimLevelConfiguration} levelConfig
 * @param {Object} callbacks
 * @param {function} callbacks.bandwidthSliderChangeCallback
 * @param {function} callbacks.bandwidthSliderStopCallback
 * @param {function} callbacks.memorySliderChangeCallback
 * @param {function} callbacks.memorySliderStopCallback
 * @constructor
 */
var NetSimRouterTab = module.exports = function (rootDiv, levelConfig, callbacks) {
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
   * @type {function}
   * @private
   */
  this.bandwidthSliderChangeCallback_ = callbacks.bandwidthSliderChangeCallback;

  /**
   * @type {function}
   * @private
   */
  this.bandwidthSliderStopCallback_ = callbacks.bandwidthSliderStopCallback;

  /**
   * @type {function}
   * @private
   */
  this.memorySliderChangeCallback_ = callbacks.memorySliderChangeCallback;

  /**
   * @type {function}
   * @private
   */
  this.memorySliderStopCallback_ = callbacks.memorySliderStopCallback;

  /**
   * @type {NetSimRouterLogTable}
   * @private
   */
  this.routerLogTable_ = null;

  /**
   * @type {NetSimRouterStatsTable}
   * @private
   */
  this.routerStatsTable_ = null;

  /**
   * @type {NetSimBandwidthControl}
   * @private
   */
  this.bandwidthControl_ = null;

  /**
   * @type {NetSimMemoryControl}
   * @private
   */
  this.memoryControl_ = null;

  // Initial render
  this.render();
};

/**
 * @param {RunLoop} runLoop
 */
NetSimRouterTab.prototype.attachToRunLoop = function (runLoop) {
  if (this.routerStatsTable_) {
    this.routerStatsTable_.attachToRunLoop(runLoop);
  }
};

/**
 * Fill the root div with new elements reflecting the current state.
 */
NetSimRouterTab.prototype.render = function () {
  var renderedMarkup = $(markup({
    level: this.levelConfig_
  }));
  this.rootDiv_.html(renderedMarkup);
  this.routerLogTable_ = new NetSimRouterLogTable(
      this.rootDiv_.find('.router_log_table'), this.levelConfig_);
  this.routerStatsTable_ = new NetSimRouterStatsTable(
      this.rootDiv_.find('.router-stats'));
  if (this.levelConfig_.showRouterBandwidthControl) {
    this.bandwidthControl_ = new NetSimBandwidthControl(
        this.rootDiv_.find('.bandwidth-control'),
        this.bandwidthSliderChangeCallback_,
        this.bandwidthSliderStopCallback_);
  }
  if (this.levelConfig_.showRouterMemoryControl) {
    this.memoryControl_ = new NetSimMemoryControl(
        this.rootDiv_.find('.memory-control'),
        this.memorySliderChangeCallback_,
        this.memorySliderStopCallback_);
  }
};

/**
 * @param {NetSimLogEntry[]} logData
 */
NetSimRouterTab.prototype.setRouterLogData = function (logData) {
  this.routerLogTable_.setRouterLogData(logData);
  if (this.routerStatsTable_) {
    this.routerStatsTable_.setRouterLogData(logData);
  }
};

/** @param {number} creationTimestampMs */
NetSimRouterTab.prototype.setRouterCreationTime = function (creationTimestampMs) {
  if (this.routerStatsTable_) {
    this.routerStatsTable_.setRouterCreationTime(creationTimestampMs);
  }
};

/**
 * @param {number} newBandwidth in bits/second
 */
NetSimRouterTab.prototype.setBandwidth = function (newBandwidth) {
  if (this.bandwidthControl_) {
    this.bandwidthControl_.setValue(newBandwidth);
  }
  if (this.routerStatsTable_) {
    this.routerStatsTable_.setBandwidth(newBandwidth);
  }
};

/** @param {number} newMemory in bits/second */
NetSimRouterTab.prototype.setMemory = function (newMemory) {
  if (this.memoryControl_) {
    this.memoryControl_.setValue(newMemory);
  }
  if (this.routerStatsTable_) {
    this.routerStatsTable_.setTotalMemory(newMemory);
  }
};

/**
 * @param {number} queuedPacketCount
 */
NetSimRouterTab.prototype.setRouterQueuedPacketCount = function (queuedPacketCount) {
  if (this.routerStatsTable_) {
    this.routerStatsTable_.setRouterQueuedPacketCount(queuedPacketCount);
  }
};

/** @param {number} usedMemoryInBits */
NetSimRouterTab.prototype.setMemoryInUse = function (usedMemoryInBits) {
  if (this.routerStatsTable_) {
    this.routerStatsTable_.setMemoryInUse(usedMemoryInBits);
  }
};

/** @param {number} dataRateBitsPerSecond */
NetSimRouterTab.prototype.setDataRate = function (dataRateBitsPerSecond) {
  if (this.routerStatsTable_) {
    this.routerStatsTable_.setDataRate(dataRateBitsPerSecond);
  }
};
