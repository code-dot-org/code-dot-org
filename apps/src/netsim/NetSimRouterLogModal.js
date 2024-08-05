/**
 * @overview a modal dialog showing the union of all router logs for the
 *           current shard.
 */
import React from 'react';
import {createRoot} from 'react-dom/client';

import i18n from '@cdo/netsim/locale';

import NetSimGlobals from './NetSimGlobals';
import NetSimLogBrowser from './NetSimLogBrowser';
import NetSimLogEntry from './NetSimLogEntry';
import {doesUserOwnShard} from './NetSimUtils';
import Packet from './Packet';

/** @const {number} */
var MAXIMUM_ROWS_IN_FULL_RENDER = 500;

/**
 * Generator and controller for contents of modal dialog that reveals
 * all router logs together, in a searchable/sortable/filterable manner.
 *
 * @param {jQuery} rootDiv
 * @param {!DashboardUser} options.user
 * @constructor
 */
var NetSimRouterLogModal = (module.exports = function (rootDiv, options) {
  /**
   * Component root, which we fill whenever we call render()
   * @private {jQuery}
   */
  this.rootDiv_ = rootDiv;

  /**
   * @private {DashboardUser}
   */
  this.user_ = options.user;

  /**
   * Hidden by default.
   * @private {boolean}
   */
  this.isVisible_ = false;

  /**
   * @private {NetSimShard}
   */
  this.shard_ = null;

  /**
   * @private {NetSimClientNode}
   */
  this.localNode_ = null;

  /**
   * @private {NetSimRouterNode}
   */
  this.router_ = null;

  /**
   * @private {NetSimLogEntry}
   */
  this.logEntries_ = [];

  /**
   * The highest log row ID stored in logEntries_, used to only retrieve new
   * log rows, we don't need to retrieve everything.
   * @private {number}
   */
  this.latestRowID_ = 0;

  /**
   * Cached list of all sender names that appear in the logs, which we update
   * incrementally.
   * @private {string[]}
   */
  this.uniqueSenderNames_ = [];

  /**
   * Tracking information for which events we're registered to, so we can
   * perform cleanup as needed.
   * @private {Object}
   */
  this.eventKeys_ = {};

  /**
   * Sorting key, changed by user interaction, which determines which sort
   * we use on render.
   * @private {string}
   */
  this.sortBy_ = 'timestamp';

  /**
   * Whether currently using a descending sort.
   * @private {boolean}
   */
  this.sortDescending_ = true;

  /**
   * Whether we are currently in "All-Router" mode or dealing with a
   * single router.  Always initializes to true because we never initialize
   * connected to a single router.
   * @private {boolean}
   */
  this.isAllRouterLogMode_ = true;

  /**
   * What type of filtering we are currently doing.  By default this is 'none',
   * doing no additional filtering on the logs.  It can also be set to
   * 'from <ip>', 'to <ip>', or 'with <ip>' (meaning from OR to)
   * @private {!string}
   */
  this.currentTrafficFilter_ = 'none';

  /**
   * Whether we are currently rendering teacher view (which has additional
   * columns and filter options).
   * @private {boolean}
   */
  this.teacherView_ = false;

  // Pre-bind callbacks for use when rendering
  this.setRouterLogMode_ = this.setRouterLogMode_.bind(this);
  this.setTrafficFilterMode_ = this.setTrafficFilterMode_.bind(this);

  this.render();
});

/**
 * Create a comparator function that can be used to sort log entries, configured
 * to sort according to the log browser's current configuration.
 * @returns {function(NetSimLogEntry, NetSimLogEntry)} compares two log entries,
 *          returns -1 if the first one belongs before the second one, 1 if
 *          the first one belongs after the second one, and 0 if they have the
 *          same sort position.
 * @private
 */
NetSimRouterLogModal.prototype.getSortComparator_ = function () {
  var getSortValue =
    NetSimRouterLogModal.sortKeyToSortValueGetterMap[this.sortBy_];
  var invertMultiplier = this.sortDescending_ ? -1 : 1;
  return function (a, b) {
    var x = getSortValue(a);
    var y = getSortValue(b);
    return (x < y ? -1 : x > y ? 1 : 0) * invertMultiplier;
  };
};

NetSimRouterLogModal.sortKeyToSortValueGetterMap = {
  timestamp: function (logEntry) {
    return logEntry.timestamp;
  },

  'logged-by': function (logEntry) {
    var originNode = logEntry.getOriginNode();
    if (originNode) {
      return originNode.getDisplayName();
    }
    return logEntry.nodeID.toString(10);
  },

  status: function (logEntry) {
    return logEntry.getLocalizedStatus();
  },

  'from-address': function (logEntry) {
    return logEntry.getHeaderField(Packet.HeaderType.FROM_ADDRESS);
  },

  'to-address': function (logEntry) {
    return logEntry.getHeaderField(Packet.HeaderType.TO_ADDRESS);
  },

  'packet-info': function (logEntry) {
    return logEntry.getLocalizedPacketInfo();
  },

  message: function (logEntry) {
    return logEntry.getMessageAscii();
  },
};

NetSimRouterLogModal.prototype.show = function (teacherView = false) {
  // Extra check for setting teacherView here - must own the shard
  this.teacherView_ =
    teacherView && this.shard_ && doesUserOwnShard(this.user_, this.shard_.id);
  this.onShow_();
};

NetSimRouterLogModal.prototype.hide = function () {
  this.onHide_();
  this.render();
};

/**
 * State changes that occur when showing the log.
 * @private
 */
NetSimRouterLogModal.prototype.onShow_ = function () {
  if (this.shard_) {
    this.shard_.logTable.subscribe();
  }
  this.isVisible_ = true;
  this.render();
};

/**
 * State changes that occur when hiding the log.
 * @private
 */
NetSimRouterLogModal.prototype.onHide_ = function () {
  if (this.shard_) {
    this.shard_.logTable.unsubscribe();
  }
  this.isVisible_ = false;
};

/**
 * @returns {boolean} TRUE if the modal is currently showing.
 */
NetSimRouterLogModal.prototype.isVisible = function () {
  return this.isVisible_;
};

/**
 * Fill the root div with new elements reflecting the current state
 */
NetSimRouterLogModal.prototype.render = function () {
  const getOriginNodeName = entry => {
    const originNode = entry.getOriginNode();
    return originNode ? originNode.getDisplayName() : entry.nodeID;
  };
  const tableRows = this.getSortedFilteredLogEntries(this.logEntries_).map(
    entry => ({
      uuid: entry.uuid,
      timestamp: entry.timestamp,
      'sent-by': entry.sentBy,
      'logged-by': getOriginNodeName(entry),
      status: entry.getLocalizedStatus(),
      'from-address': entry.getHeaderField(Packet.HeaderType.FROM_ADDRESS),
      'to-address': entry.getHeaderField(Packet.HeaderType.TO_ADDRESS),
      'packet-info': entry.getLocalizedPacketInfo(),
      message: entry.getMessageAscii(),
    })
  );
  const root = createRoot(this.rootDiv_[0]);

  root.render(
    <NetSimLogBrowser
      isOpen={this.isVisible()}
      handleClose={this.hide.bind(this)}
      i18n={i18n}
      canSetRouterLogMode={this.canSetRouterLogMode_()}
      isAllRouterLogMode={this.isAllRouterLogMode_}
      setRouterLogMode={this.setRouterLogMode_}
      localAddress={this.localNode_ ? this.localNode_.getAddress() : undefined}
      currentTrafficFilter={this.currentTrafficFilter_}
      setTrafficFilter={this.setTrafficFilterMode_}
      headerFields={NetSimGlobals.getLevelConfig().routerExpectsPacketHeader}
      logRows={tableRows}
      senderNames={this.uniqueSenderNames_}
      renderedRowLimit={MAXIMUM_ROWS_IN_FULL_RENDER}
      teacherView={this.teacherView_}
    />
  );
};

/**
 * @param {!NetSimLogEntry[]} logEntries
 * @returns {NetSimLogEntry[]} subset of logEntries, sorted and filtered
 *          according to the log browser's current settings.
 */
NetSimRouterLogModal.prototype.getSortedFilteredLogEntries = function (
  logEntries
) {
  let filterPredicates = [];

  // Add router mode filter
  if (!this.isAllRouterLogMode_) {
    filterPredicates.push(e => e.nodeID === this.router_.entityID);
  }

  // Add traffic filter
  const match = /^(from|to|with) ([\d\.]+)/.exec(this.currentTrafficFilter_);
  if (match) {
    const fromPredicate = e =>
      e.getHeaderField(Packet.HeaderType.FROM_ADDRESS) === match[2];
    const toPredicate = e =>
      e.getHeaderField(Packet.HeaderType.TO_ADDRESS) === match[2];
    const withPredicate = e => fromPredicate(e) || toPredicate(e);
    if ('from' === match[1]) {
      filterPredicates.push(fromPredicate);
    } else if ('to' === match[1]) {
      filterPredicates.push(toPredicate);
    } else if ('with' === match[1]) {
      filterPredicates.push(withPredicate);
    }
  }

  return logEntries
    .filter(e => filterPredicates.every(p => p(e)))
    .sort(this.getSortComparator_());
};

/**
 * Called by the simulation's onRouterConnect and onRouterDisconnect
 * methods, this locally remembers the current router state and triggers
 * a rerender
 * @param {NetSimRouterNode} router
 */
NetSimRouterLogModal.prototype.setRouter = function (router) {
  this.router_ = router;
  this.isAllRouterLogMode_ = !this.hasLocalRouter_();
  if (!this.hasLocalRouter_()) {
    this.currentTrafficFilter_ = 'none';
  }
  this.render();
};

/**
 * Whether we are currently capable of logging all routers or not.
 * Is always true if we are in a level with connected routers.
 * Otherwise, is only true if we are not locally connected to a router.
 * @returns {boolean}
 * @private
 */
NetSimRouterLogModal.prototype.canLogAllRouters_ = function () {
  return (
    NetSimGlobals.getLevelConfig().connectedRouters || !this.hasLocalRouter_()
  );
};

/**
 * Returns true iff we are locally connected to a router.
 * @returns {boolean}
 * @private
 */
NetSimRouterLogModal.prototype.hasLocalRouter_ = function () {
  return !!this.router_;
};

/**
 * Whether or not we can switch between all-router and single-router log
 * mode. We can switch to single-router iff we have a local router, and
 * we can switch to all-router iff we are capable of logging all routers
 * @returns {boolean}
 * @private
 */
NetSimRouterLogModal.prototype.canSetRouterLogMode_ = function () {
  if (this.isAllRouterLogMode_) {
    return this.hasLocalRouter_();
  } else {
    return this.canLogAllRouters_();
  }
};

/**
 * Changes the router log filtering mode
 * @param {string} mode - either "all" or "mine"
 * @private
 */
NetSimRouterLogModal.prototype.setRouterLogMode_ = function (mode) {
  this.isAllRouterLogMode_ = mode === 'all';
  this.render();
};

/**
 * Sets this.currentTrafficFilter_.
 * @param {string} newMode - the new traffic filter mode
 * @private
 */
NetSimRouterLogModal.prototype.setTrafficFilterMode_ = function (newMode) {
  this.currentTrafficFilter_ = newMode;
  this.render();
};

/**
 * Give the log browser a reference to the shard, so that it can query the
 * log table.  Or, pass null when disconnecting from a shard.
 * @param {NetSimShard|null} newShard
 * @param {NetSimLocalClientNode|null} localNode
 */
NetSimRouterLogModal.prototype.onShardChange = function (newShard, localNode) {
  if (this.eventKeys_.registeredWithShard) {
    this.eventKeys_.registeredWithShard.logTable.tableChange.unregister(
      this.eventKeys_.logTableChange
    );
    this.eventKeys_.registeredWithShard = null;
  }

  if (newShard) {
    this.eventKeys_.logTableChange = newShard.logTable.tableChange.register(
      this.onLogTableChange_.bind(this)
    );
    this.eventKeys_.registeredWithShard = newShard;
  }

  // When changing shards, reset log so we fetch the whole thing next time.
  this.logEntries_.length = 0;
  this.uniqueSenderNames_.length = 0;
  this.latestRowID_ = 0;
  this.shard_ = newShard;
  this.localNode_ = localNode;
};

/**
 * Handle log table changes.
 * @private
 */
NetSimRouterLogModal.prototype.onLogTableChange_ = function () {
  var headerSpec = NetSimGlobals.getLevelConfig().routerExpectsPacketHeader;
  var newRows = this.shard_.logTable.readAllFromID(this.latestRowID_ + 1);
  var newLogEntries = newRows.map(function (row) {
    this.latestRowID_ = Math.max(row.id, this.latestRowID_);
    return new NetSimLogEntry(this.shard_, row, headerSpec);
  }, this);

  // Modify this.logEntries_ in-place, appending new log entries
  Array.prototype.push.apply(this.logEntries_, newLogEntries);

  // Add any new senders to the uniqueSenderNames list
  newLogEntries.forEach(entry => {
    if (!this.uniqueSenderNames_.includes(entry.sentBy)) {
      this.uniqueSenderNames_.push(entry.sentBy);
    }
  });

  this.render();
};
