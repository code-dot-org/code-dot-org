/**
 * @overview UI component displaying router stats on the "Router" tab.
 */
'use strict';

var markup = require('./NetSimRouterStatsTable.html.ejs');
var NetSimUtils = require('./NetSimUtils');
var NetSimLogEntry = require('./NetSimLogEntry');

/**
 * Render every half-second, minimum.
 * @type {number}
 * @const
 */
var MAX_RENDER_DELAY_MS = 500;

/**
 * @type {number}
 * @const
 */
var MILLIS_PER_SECOND = 1000;

/**
 * @type {number}
 * @const
 */
var SECONDS_PER_MINUTE = 60;

/**
 * @type {number}
 * @const
 */
var MILLIS_PER_MINUTE = MILLIS_PER_SECOND * SECONDS_PER_MINUTE;

/**
 * @type {number}
 * @const
 */
var MINUTES_PER_HOUR = 60;

/**
 * @type {number}
 * @const
 */
var MILLIS_PER_HOUR = MILLIS_PER_MINUTE * MINUTES_PER_HOUR;

/**
 * Generator and controller for DNS network lookup table component.
 * Shows different amounts of information depending on the DNS mode.
 *
 * @param {jQuery} rootDiv
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
   * Last render time, in simulation-time.
   * @type {number}
   * @private
   */
  this.lastRenderTime_ = null;

  /**
   * Unix timestamp (local) of router creation time
   * @type {number}
   * @private
   */
  this.routerCreationTime_ = 0;

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
   * Number of packets in the router's queue.
   * @type {number}
   * @private
   */
  this.queuedPackets_ = 0;

  /**
   * Current size of the router's packet queue, in bits.
   * @type {number}
   * @private
   */
  this.usedMemory_ = 0;

  this.render({});
};

/**
 * @param {RunLoop} runLoop
 */
NetSimRouterStatsTable.prototype.attachToRunLoop = function (runLoop) {
  runLoop.render.register(this.render.bind(this));
};

/**
 * Fill the root div with new elements reflecting the current state
 * @param {RunLoop.Clock} clock
 */
NetSimRouterStatsTable.prototype.render = function (clock) {
  if (!this.needsRender(clock)) {
    return;
  }

  var renderedMarkup = $(markup({
    uptime: this.getLocalizedUptime(),
    queuedPackets: this.queuedPackets_,
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
  this.lastRenderTime_ = clock.time;
};

/**
 * @param {RunLoop.Clock} clock
 * @returns {boolean} whether a render operation is needed.
 */
NetSimRouterStatsTable.prototype.needsRender = function (clock) {
  return (!this.lastRenderTime_ ||
      clock.time - this.lastRenderTime_ > MAX_RENDER_DELAY_MS);
};

/**
 * Mark the router log data dirty, so that it will re-render on the
 * next frame.
 */
NetSimRouterStatsTable.prototype.setNeedsRender = function () {
  this.lastRenderTime_ = null;
};

/**
 * Get a duration string for the current router uptime.
 * @returns {string}
 */
NetSimRouterStatsTable.prototype.getLocalizedUptime = function () {
  var hoursUptime = 0;
  var minutesUptime = 0;
  var secondsUptime = 0;
  if (this.routerCreationTime_ > 0) {
    var millisecondsUptime = Date.now() - this.routerCreationTime_;
    hoursUptime = Math.floor(millisecondsUptime / MILLIS_PER_HOUR);
    millisecondsUptime -= hoursUptime * MILLIS_PER_HOUR;
    minutesUptime = Math.floor(millisecondsUptime / MILLIS_PER_MINUTE);
    millisecondsUptime -= minutesUptime * MILLIS_PER_MINUTE;
    secondsUptime = Math.floor(millisecondsUptime / MILLIS_PER_SECOND);
  }
  return hoursUptime.toString() +
      ':' + NetSimUtils.zeroPadLeft(minutesUptime, 2) +
      ':' + NetSimUtils.zeroPadLeft(secondsUptime, 2);
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

  this.setNeedsRender();
};

/** @param {number} creationTimestampMs */
NetSimRouterStatsTable.prototype.setRouterCreationTime = function (creationTimestampMs) {
  this.routerCreationTime_ = creationTimestampMs;
  this.setNeedsRender();
};

/** @param {number} newBandwidth in bits per second */
NetSimRouterStatsTable.prototype.setBandwidth = function (newBandwidth) {
  this.bandwidthLimit_ = newBandwidth;
  this.setNeedsRender();
};

/** @param {number} totalMemoryInBits */
NetSimRouterStatsTable.prototype.setTotalMemory = function (totalMemoryInBits) {
  this.totalMemory_ = totalMemoryInBits;
  this.setNeedsRender();
};

/**
 * @param {number} queuedPacketCount
 */
NetSimRouterStatsTable.prototype.setRouterQueuedPacketCount = function (
    queuedPacketCount) {
  this.queuedPackets_ = queuedPacketCount;
  this.setNeedsRender();
};

/** @param {number} usedMemoryInBits */
NetSimRouterStatsTable.prototype.setMemoryInUse = function (usedMemoryInBits) {
  this.usedMemory_ = usedMemoryInBits;
  this.setNeedsRender();
};

/** @param {number} dataRateBitsPerSecond */
NetSimRouterStatsTable.prototype.setDataRate = function (dataRateBitsPerSecond) {
  this.dataRate_ = dataRateBitsPerSecond;
  this.setNeedsRender();
};
