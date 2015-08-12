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
var i18n = require('./locale');
var NetSimLogEntry = require('./NetSimLogEntry');
var Packet = require('./Packet');
var markup = require('./NetSimRouterLogModal.html.ejs');
var NetSimGlobals = require('./NetSimGlobals');

/** @const {string} */
var LOG_ENTRY_DATA_KEY = 'LogEntry';

/** @const {number} */
var MAXIMUM_ROWS_IN_FULL_RENDER = 500;

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

  // Attach handlers for showing and hiding the modal
  this.rootDiv_.on('shown.bs.modal', function () {
    if (this.shard_) {
      this.shard_.logTable.subscribe();
    }
    this.render();
  }.bind(this));

  this.rootDiv_.on('hidden.bs.modal', function () {
    if (this.shard_) {
      this.shard_.logTable.unsubscribe();
    }
  }.bind(this));

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
   * The highest log row ID stored in logEntries_, used to only retrieve new
   * log rows, we don't need to retrieve everything.
   * @private {number}
   */
  this.latestRowID_ = 0;

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
 * @returns {boolean} TRUE if the modal is currently showing.
 */
NetSimRouterLogModal.prototype.isVisible = function () {
  return this.rootDiv_.is(':visible');
};

/**
 * Fill the root div with new elements reflecting the current state
 */
NetSimRouterLogModal.prototype.render = function () {
  // Be lazy, don't render if not visible.
  if (!this.isVisible()) {
    return;
  }

  // Re-render entire log browser UI
  var renderedMarkup = $(markup({
    isAllRouterLogMode: this.isAllRouterLogMode_,
    canToggleRouterLogMode: this.canToggleRouterLogMode_(),
    sortBy: this.sortBy_,
    sortDescending: this.sortDescending_
  }));
  this.rootDiv_.html(renderedMarkup);

  // Add input handlers
  this.getRouterLogToggleButton().one('click', function() {
    this.toggleRouterLogMode_();
    this.render();
  }.bind(this));

  this.rootDiv_.find('th').click(function (event) {
    this.onSortHeaderClick_($(event.target).attr('data-sort-key'));
  }.bind(this));

  // Add rows to the table
  var rows = this.getSortedFilteredLogEntries(this.logEntries_)
      .slice(0, MAXIMUM_ROWS_IN_FULL_RENDER)
      .map(this.makeTableRow_.bind(this));
  this.rootDiv_.find('tbody').append(rows);

  if (rows.length === MAXIMUM_ROWS_IN_FULL_RENDER) {
    var maxRenderedWarning = document.createElement('div');
    maxRenderedWarning.className = 'log-browser-limit-message';
    maxRenderedWarning.innerText = i18n.showingFirstXLogEntries({
      x: MAXIMUM_ROWS_IN_FULL_RENDER
    });
    this.rootDiv_.find('table').after(maxRenderedWarning);
  }
};

/**
 * Convert the given set of log entries to table rows and insert them
 * into the DOM, instead of re-rendering the whole table.
 * @param {!NetSimLogEntry[]} newEntries
 * @private
 */
NetSimRouterLogModal.prototype.renderNewLogEntries_ = function (newEntries) {
  // Be lazy, don't render at all if not visible.
  if (!this.isVisible() || newEntries.length === 0) {
    return;
  }

  /** @type {jQuery} Table body element. */
  var tbody = this.rootDiv_.find('tbody');

  // Get existing table row elements, which are already sorted and filtered.
  var oldRows = tbody.find('tr');

  // Sort and filter the new entries, and generate DOM rows for them.
  newEntries = this.getSortedFilteredLogEntries(newEntries);
  var newRows = $(newEntries.map(this.makeTableRow_.bind(this)));

  // Get the current sort value function
  var iterateeFunction = NetSimRouterLogModal.iterateeMap[this.sortBy_];

  // Walk both collections to merge new rows into the DOM
  var nextOld = getNextInfo(oldRows, 0, iterateeFunction);
  var nextNew = getNextInfo(newRows, 0, iterateeFunction);
  var insertHere = false;
  while (nextNew.index < newRows.length && nextOld.index < oldRows.length) {

    // Is this where the next row goes?
    insertHere = nextNew.sortValue < nextOld.sortValue ?
        !this.sortDescending_ : this.sortDescending_;

    if (insertHere) {
      nextNew.tableRow.insertBefore(nextOld.tableRow);
      nextNew = getNextInfo(newRows, nextNew.index + 1, iterateeFunction);
    } else {
      nextOld = getNextInfo(oldRows, nextOld.index + 1, iterateeFunction);
    }
  }

  // Put whatever's left on the end of the table
  tbody.append(newRows.slice(nextNew.index));
};

/**
 * Generates a helper object for performing the log row merge.
 * @param {jQuery} rows - Wrapped collection of table rows.
 * @param {!number} atIndex - Index into `rows` at which info should be generated.
 * @param {!function(NetSimLogEntry)} iterateeFunction - function to get current
 *        sort value from log entry object.
 * @returns {{index: number, tableRow: jQuery, sortValue: ?}}
 */
function getNextInfo(rows, atIndex, iterateeFunction) {
  var tempRow = rows.eq(atIndex);
  return {
    index: atIndex,
    tableRow: tempRow,
    sortValue: tempRow.length > 0 ?
        iterateeFunction(tempRow.data(LOG_ENTRY_DATA_KEY)) : undefined
  };
}

/**
 * @param {!NetSimLogEntry[]} logEntries
 * @returns {NetSimLogEntry[]} subset of logEntries, sorted and filtered
 *          according to the log browser's current settings.
 */
NetSimRouterLogModal.prototype.getSortedFilteredLogEntries = function (logEntries) {
  // Filter entries to current log browser filter mode
  var filteredLogEntries = this.isAllRouterLogMode_ ?
      logEntries :
      logEntries.filter(function (entry) {
        return entry.nodeID === this.router_.entityID;
      }, this);

  // Sort entries according to current log browser sort setting
  var iterateeFunction = NetSimRouterLogModal.iterateeMap[this.sortBy_];
  var sortedFilteredLogEntries = _.sortBy(filteredLogEntries, iterateeFunction);
  if (this.sortDescending_) {
    sortedFilteredLogEntries.reverse();
  }
  return sortedFilteredLogEntries;
};

/**
 * Given a log entry, generate a table row that can be added to the log modal.
 * @param {!NetSimLogEntry} logEntry
 * @returns {Element} a tr element.
 * @private
 */
NetSimRouterLogModal.prototype.makeTableRow_ = function (logEntry) {
  var headerFields = NetSimGlobals.getLevelConfig().routerExpectsPacketHeader;

  var showToAddress = headerFields.indexOf(Packet.HeaderType.TO_ADDRESS) > -1;

  var showFromAddress = headerFields.indexOf(Packet.HeaderType.FROM_ADDRESS) > -1;

  var showPacketInfo = headerFields.indexOf(Packet.HeaderType.PACKET_INDEX) > -1 &&
      headerFields.indexOf(Packet.HeaderType.PACKET_COUNT) > -1;

  var originNode = logEntry.getOriginNode();

  var row = document.createElement('tr');

  // Store the actual logEntry on the row for sorting/merging later.
  $(row).data(LOG_ENTRY_DATA_KEY, logEntry);

  var tdTimestamp = document.createElement('td');
  tdTimestamp.innerText = logEntry.getTimeString();
  tdTimestamp.style.whiteSpace = 'nowrap';

  var tdDisplayName = document.createElement('td');
  tdDisplayName.innerText = (originNode ?
      originNode.getDisplayName() : logEntry.nodeID);
  tdDisplayName.style.whiteSpace = 'nowrap';

  var tdStatus = document.createElement('td');
  tdStatus.innerText = logEntry.getLocalizedStatus();
  tdStatus.style.whiteSpace = 'nowrap';

  row.appendChild(tdTimestamp);
  row.appendChild(tdDisplayName);
  row.appendChild(tdStatus);

  if (showFromAddress) {
    var tdFrom = document.createElement('td');
    tdFrom.innerText = logEntry.getHeaderField(Packet.HeaderType.FROM_ADDRESS);
    tdFrom.style.whiteSpace = 'nowrap';
    row.appendChild(tdFrom);
  }
  if (showToAddress) {
    var tdTo = document.createElement('td');
    tdTo.innerText = logEntry.getHeaderField(Packet.HeaderType.TO_ADDRESS);
    tdTo.style.whiteSpace = 'nowrap';
    row.appendChild(tdTo);
  }
  if (showPacketInfo) {
    var tdPacketInfo = document.createElement('td');
    tdPacketInfo.innerText = logEntry.getLocalizedPacketInfo();
    tdPacketInfo.style.whiteSpace = 'nowrap';
    row.appendChild(tdPacketInfo);
  }

  var tdMessageBody = document.createElement('td');
  tdMessageBody.innerText = logEntry.getMessageAscii();
  row.appendChild(tdMessageBody);

  return row;
};

/**
 * Change the sort settings and re-render the log table.
 * @param {!string} sortKey
 * @private
 */
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

  // When changing shards, reset log so we fetch the whole thing next time.
  this.logEntries_.length = 0;
  this.latestRowID_ = 0;
  this.shard_ = newShard;
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
  this.renderNewLogEntries_(newLogEntries);
};
