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

var markup = require('./NetSimRouterStatsTable.html');
var NetSimLogEntry = require('./NetSimLogEntry');

/**
 * Generator and controller for DNS network lookup table component.
 * Shows different amounts of information depending on the DNS mode.
 *
 * @param {jQuery} rootDiv
 * @param {netsimLevelConfiguration} levelConfig
 * @constructor
 */
var NetSimRouterStatsTable = module.exports = function (rootDiv) {
  /**
   * Component root, which we fill whenever we call render()
   * @type {jQuery}
   * @private
   */
  this.rootDiv_ = rootDiv;

  /**
   * If true, will re-render stats on next frame.  Lets us set lots of
   * properties within a single frame without rendering for each property
   * set.
   * @type {boolean}
   * @private
   */
  this.needsRender_ = true;

  /**
   * Total count of packets this router has received.
   * @type {number}
   * @private
   */
  this.totalPackets_ = 0;

  /**
   * Total count of packets this router has successfully processed.
   * @type {number}
   * @private
   */
  this.successfulPackets_ = 0;

  /**
   * Total size of all packets received by this router, in bits.
   * @type {number}
   * @private
   */
  this.totalData_ = 0;

  /**
   * Total size of all packets successfully processed by this router, in bits.
   * @type {number}
   * @private
   */
  this.successfulData_ = 0;

  /**
   * Maximum rate of data transfer (in bits per second)
   * @type {number}
   * @private
   */
  this.bandwidthLimit_ = 0;

  /**
   * Average rate of data transfer (in bits per second) over the last
   * DATA_RATE_WINDOW_MS milliseconds.
   * @type {number}
   * @private
   */
  this.dataRate_ = 0;

  /**
   * Router's total memory capacity, in bits.
   * @type {number}
   * @private
   */
  this.totalMemory_ = 0;

  /**
   * Current size of the router's packet queue, in bits.
   * @type {number}
   * @private
   */
  this.usedMemory_ = 0;

  this.render();
};

/**
 * @param {RunLoop} runLoop
 */
NetSimRouterStatsTable.prototype.attachToRunLoop = function (runLoop) {
  runLoop.render.register(this.render.bind(this));
};

/**
 * Fill the root div with new elements reflecting the current state
 */
NetSimRouterStatsTable.prototype.render = function () {
  if (!this.needsRender_) {
    return;
  }

  var renderedMarkup = $(markup({
    totalPackets: this.totalPackets_,
    successfulPackets: this.successfulPackets_,
    totalData: this.totalData_,
    successfulData: this.successfulData_,
    bandwidthLimit: this.bandwidthLimit_,
    dataRate: this.dataRate_,
    totalMemory: this.totalMemory_,
    usedMemory: this.usedMemory_
  }));
  this.rootDiv_.html(renderedMarkup);
  this.needsRender_ = false;
};

/**
 * @param {NetSimLogEntry[]} logEntries
 * @returns {number} total data size, in bits, of packets represented by the
 *          given log entries.
 */
var totalSizeOfPackets = function (logEntries) {
  return logEntries.reduce(function (prev, cur) {
    return prev + cur.binary.length;
  }, 0);
};

/**
 * @param {NetSimLogEntry[]} logData
 */
NetSimRouterStatsTable.prototype.setRouterLogData = function (logData) {
  var successLogs = logData.filter(function (logEntry) {
    return logEntry.status === NetSimLogEntry.LogStatus.SUCCESS;
  });

  this.totalPackets_ = logData.length;
  this.successfulPackets_ = successLogs.length;

  this.totalData_ = totalSizeOfPackets(logData);
  this.successfulData_ = totalSizeOfPackets(successLogs);

  this.needsRender_ = true;
};

/** @param {number} newBandwidth in bits per second */
NetSimRouterStatsTable.prototype.setBandwidth = function (newBandwidth) {
  this.bandwidthLimit_ = newBandwidth;
};

/** @param {number} totalMemoryInBits */
NetSimRouterStatsTable.prototype.setTotalMemory = function (totalMemoryInBits) {
  this.totalMemory_ = totalMemoryInBits;
  this.needsRender_ = true;
};

/** @param {number} usedMemoryInBits */
NetSimRouterStatsTable.prototype.setMemoryInUse = function (usedMemoryInBits) {
  this.usedMemory_ = usedMemoryInBits;
  this.needsRender_ = true;
};

/** @param {number} dataRateBitsPerSecond */
NetSimRouterStatsTable.prototype.setDataRate = function (dataRateBitsPerSecond) {
  this.dataRate_ = dataRateBitsPerSecond;
  this.needsRender_ = true;
};
