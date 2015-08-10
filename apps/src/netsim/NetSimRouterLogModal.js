/**
 * @overview a modal dialog showing the union of all router logs for the
 *           current shard.
 */
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

var _ = require('../utils').getLodash();
var NetSimLogEntry = require('./NetSimLogEntry');
var Packet = require('./Packet');
var markup = require('./NetSimRouterLogModal.html.ejs');
var NetSimGlobals = require('./NetSimGlobals');

/**
 * Generator and controller for contents of modal dialog that reveals
 * all router logs together, in a searchable/sortable/filterable manner.
 *
 * @param {jQuery} rootDiv
 * @constructor
 */
var NetSimRouterLogModal = module.exports = function (rootDiv) {

  /**
   * Component root, which we fill whenever we call render()
   * @private {jQuery}
   */
  this.rootDiv_ = rootDiv;

  /**
   * @private {NetSimShard}
   */
  this.shard_ = null;

  /**
   * @private {NetSimRouterNode}
   */
  this.router_ = null;

  /**
   * @private {NetSimLogEntry}
   */
  this.logEntries_ = [];

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
  * single router. Initializes to true iff we are currently capable of
  * logging all routers
  * @private {boolean}
  */
  this.isAllRouterLogMode_ = this.canLogAllRouters_();

  this.render();
};

NetSimRouterLogModal.iterateeMap = {

  'timestamp': function (logEntry) {
    return logEntry.timestamp;
  },

  'logged-by': function (logEntry) {
    var originNode = logEntry.getOriginNode();
    if (originNode) {
      return originNode.getDisplayName();
    }
    return logEntry.nodeID.toString(10);
  },

  'status': function (logEntry) {
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

  'message': function (logEntry) {
    return logEntry.getMessageAscii();
  }

};

/**
 * Fill the root div with new elements reflecting the current state
 */
NetSimRouterLogModal.prototype.render = function () {

  this.rootDiv_.off('shown.bs.modal.onModalOpen');
  this.rootDiv_.off('hidden.bs.modal.onModalClose');

  var filteredLogEntries = this.isAllRouterLogMode_ ?
      this.logEntries_ :
      this.logEntries_.filter(function (entry) {
        return entry.nodeID === this.router_.entityID;
      }, this);

  // Sort before rendering
  var iterateeFunction = NetSimRouterLogModal.iterateeMap[this.sortBy_];
  var sortedFilteredLogEntries = _.sortBy(filteredLogEntries, iterateeFunction);
  if (this.sortDescending_) {
    sortedFilteredLogEntries.reverse();
  }

  var renderedMarkup = $(markup({
    logEntries: sortedFilteredLogEntries,
    isAllRouterLogMode: this.isAllRouterLogMode_,
    canToggleRouterLogMode: this.canToggleRouterLogMode_(),
    sortBy: this.sortBy_,
    sortDescending: this.sortDescending_
  }));
  this.rootDiv_.html(renderedMarkup);

  this.getRouterLogToggleButton().one('click', function() {
    this.toggleRouterLogMode_();
    this.render();
  }.bind(this));

  this.rootDiv_.on('shown.bs.modal.onModalOpen', function () {
    if (this.shard_) {
      this.shard_.logTable.subscribe();
    }
  }.bind(this));

  this.rootDiv_.on('hidden.bs.modal.onModalClose', function () {
      if (this.shard_) {
        this.shard_.logTable.unsubscribe();
      }
  }.bind(this));

  this.rootDiv_.find('th').click(function (event) {
    this.onSortHeaderClick_($(event.target).attr('data-sort-key'));
  }.bind(this));
};

NetSimRouterLogModal.prototype.onSortHeaderClick_ = function (sortKey) {
  if (!sortKey) {
    return;
  }

  if (this.sortBy_ === sortKey) {
    this.sortDescending_ = !this.sortDescending_;
  } else {
    this.sortBy_ = sortKey;
    this.sortDescending_ = false;
  }
  this.render();
};

/**
 * Called by the sumulation's onRouterConnect and onRouterDisconnect
 * methods, this locally remembers the current router state and triggers
 * a rerender
 * @param {NetSimRouterNode} router
 */
NetSimRouterLogModal.prototype.setRouter = function (router) {
  this.router_ = router;
  this.isAllRouterLogMode_ = this.canLogAllRouters_();
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
  return NetSimGlobals.getLevelConfig().connectedRouters || !this.hasLocalRouter_();
};

/**
 * Returns true iff we are locally connected to a router.
 * @returns {boolean}
 * @private
 */
NetSimRouterLogModal.prototype.hasLocalRouter_ = function () {
  return !!(this.router_);
};

/**
 * Whether or not we can switch between all-router and single-router log
 * mode. We can switch to single-router iff we have a local router, and
 * we can switch to all-router iff we are capable of logging all routers
 * @returns {boolean}
 * @private
 */
NetSimRouterLogModal.prototype.canToggleRouterLogMode_ = function () {
  if (this.isAllRouterLogMode_) {
    return this.hasLocalRouter_();
  } else {
    return this.canLogAllRouters_();
  }
};

/**
 * Toggles this.isAllRouterLogMode_ between `true` and `false`
 * @private
 */
NetSimRouterLogModal.prototype.toggleRouterLogMode_ = function () {
  this.isAllRouterLogMode_ = !this.isAllRouterLogMode_;
};

/**
 * Finds the button used to toggle between router log modes
 * @returns {jQuery}
 * @private
 */
NetSimRouterLogModal.prototype.getRouterLogToggleButton = function () {
  return this.rootDiv_.find('button#routerlog-toggle');
};

/**
 * Give the log browser a reference to the shard, so that it can query the
 * log table.  Or, pass null when disconnecting from a shard.
 * @param {NetSimShard|null} newShard
 */
NetSimRouterLogModal.prototype.setShard = function (newShard) {

  if (this.eventKeys_.registeredWithShard) {
    this.eventKeys_.registeredWithShard.logTable.tableChange.unregister(
        this.eventKeys_.logTableChange);
    this.eventKeys_.registeredWithShard = null;
  }

  if (newShard) {
    this.eventKeys_.logTableChange = newShard.logTable.tableChange.register(
        this.onLogTableChange_.bind(this));
    this.eventKeys_.registeredWithShard = newShard;
  }

  this.shard_ = newShard;
};

/**
 * Handle log table changes.
 * @param {LogEntryRow[]} logRows
 * @private
 */
NetSimRouterLogModal.prototype.onLogTableChange_ = function (logRows) {
  var headerSpec = NetSimGlobals.getLevelConfig().routerExpectsPacketHeader;
  this.logEntries_ = logRows.map(function (row) {
    return new NetSimLogEntry(this.shard_, row, headerSpec);
  }, this);
  this.render();
};
