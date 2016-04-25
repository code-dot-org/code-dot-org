'use strict';

var testUtils = require('../util/testUtils');
var assert = testUtils.assert;

var utils = require('@cdo/apps/utils');
var _ = require('@cdo/apps/lodash');
var NetSimLogger = require('@cdo/apps/netsim/NetSimLogger');
var NetSimTable = require('@cdo/apps/netsim/NetSimTable');
var NetSimGlobals = require('@cdo/apps/netsim/NetSimGlobals');
var levels = require('@cdo/apps/netsim/levels');

/**
 * Checks whether the given table has the specified number of rows.
 *
 * @param {!NetSimShard} shard - Ideally a fakeShard
 * @param {!string} tableName - Passed a string instead of the table for error
 *        message readability.  Should be name of a member of the shard.
 * @param {!number} size - Expected number of rows.
 */
exports.assertTableSize = function (shard, tableName, size) {
  var rowCount;
  shard[tableName].refresh(function () {
    rowCount = shard[tableName].readAll().length;
  });
  assert(rowCount === size, "Expected table '" + tableName +
      "' to contain " + size + " rows, but it had " + rowCount +
      " rows.");
};

/**
 * Replace our clientApi with a mock that hits a fakeStorageTable instead of
 * accessing the server API.
 * @param {NetSimTable} netsimTable
 */
exports.overrideNetSimTableApi = function (netsimTable) {
  var table = fakeStorageTable();

  // send client api calls through our fake storage table
  netsimTable.api_ = {
    remoteTable: table,
    allRows: function (callback) {
      return table.readAll(callback);
    },
    allRowsFromID: function (id, callback) {
      return table.readAllFromID(id, callback);
    },
    fetchRow: function (id, callback) {
      return table.read(id, callback);
    },
    createRow: function (value, callback) {
      if (Array.isArray(value)) {
        return table.multiCreate(value, callback);
      } else {
        return table.create(value, callback);
      }
    },
    updateRow: function (id, value, callback) {
      return table.update(id, value, callback);
    },
    deleteRows: function (ids, callback) {
      return table.deleteMany(ids, callback);
    },
    log: function () {
      return table.log();
    },
    clearLog: function () {
      table.clearLog();
    }
  };

  return netsimTable;
};

/**
 * Storage table API placeholder for testing, always hits callbacks immediately
 * so tests can be written imperatively.
 * @returns {Object}
 */
var fakeStorageTable = function () {
  var log_ = '';
  var rowIndex_ = 1;
  var tableData_ = [];

  return {

    /**
     * @param {!NodeStyleCallback} callback
     */
    readAll: function (callback) {
      log_ += 'readAll';

      callback(null, tableData_);
    },

    /**
     * @param {!number} id
     * @param {!NodeStyleCallback} callback
     */
    readAllFromID: function (id, callback) {
      log_ += 'readAllFromID[' + id + ']';

      callback(null, tableData_.filter(function (row) {
        return row.id >= id;
      }));
    },

    /**
     * @param {!number} id
     * @param {!NodeStyleCallback} callback
     */
    read: function (id, callback) {
      log_ += 'read[' + id + ']';

      for (var i = 0; i < tableData_.length; i++) {
        if (tableData_[i].id === id) {
          callback(null, tableData_[i]);
          return;
        }
      }
      callback(new Error('Not Found'), null);
    },

    /**
     * @param {!Object} value
     * @param {!NodeStyleCallback} callback
     */
    create: function (value, callback) {
      log_ += 'create[' + JSON.stringify(value) + ']';

      value.id = rowIndex_;
      value.uuid = utils.createUuid();
      rowIndex_++;
      tableData_.push(value);

      callback(null, value);
    },

    /**
     * @param {!Object[]} values
     * @param {!NodeStyleCallback} callback
     */
    multiCreate: function (values, callback) {
      values.forEach(function (value) {
        log_ += 'create[' + JSON.stringify(value) + ']';

        value.id = rowIndex_;
        rowIndex_++;
        tableData_.push(value);
      });

      callback(null, values);
    },

    /**
     * @param {!number} id
     * @param {!Object} value
     * @param {!NodeStyleCallback} callback
     */
    update: function (id, value, callback) {
      log_ += 'update[' + id + ', ' + JSON.stringify(value) + ']';

      value.id = id;
      for (var i = 0; i < tableData_.length; i++) {
        if (tableData_[i].id === id) {
          value.uuid = tableData_[i].uuid;
          tableData_[i] = value;
          callback(null, null);
          return;
        }
      }

      callback(new Error('Not Found'), null);
    },

    /**
     * @param {!number[]} ids
     * @param {!NodeStyleCallback} callback
     */
    deleteMany: function (ids, callback) {
      log_ += 'delete[' + ids.join(',') + ']';

      var matchesAnyDeleteID = function (row) {
        return ids.some(function (id) {
          return row.id === id;
        });
      };

      var deleteCount = 0;
      for (var i = tableData_.length - 1; i >= 0; i--) {
        if (matchesAnyDeleteID(tableData_[i])) {
          tableData_.splice(i, 1);
          deleteCount++;
        }
      }

      if (deleteCount > 0) {
        callback(null, null);
      } else {
        callback(new Error('Not Found'), null);
      }
    },

    /**
     * @returns {string}
     */
    log: function () {
      if (arguments.length > 0) {
        log_ = arguments[0];
      }

      return log_;
    },

    /** Reset test log to empty */
    clearLog: function () {
      log_ = '';
    }
  };
};

/**
 * Fake set of storage tables for use in tests.
 */
exports.fakeShard = function () {
  /** @implements {PubSubChannel} */
  var fakeChannel = {
    subscribe: function (eventName, callback) {},
    unsubscribe: function (eventName, callback) {}
  };

  // In tests we normally disable delays, coalescing and jitter so that they
  // run fast and predictably.  See specific NetSimTable tests covering the
  // behavior of these parameters.
  var defaultTestTableConfig = {
    minimumDelayBeforeRefresh: 0,
    maximumJitterDelay: 0,
    minimumDelayBetweenRefreshes: 0
  };

  return {
    nodeTable: exports.overrideNetSimTableApi(
        new NetSimTable(fakeChannel, 'fakeShard', 'node', defaultTestTableConfig)),
    wireTable: exports.overrideNetSimTableApi(
        new NetSimTable(fakeChannel, 'fakeShard', 'wire', defaultTestTableConfig)),
    messageTable: exports.overrideNetSimTableApi(
        new NetSimTable(fakeChannel, 'fakeShard', 'message', defaultTestTableConfig)),
    logTable: exports.overrideNetSimTableApi(
        new NetSimTable(fakeChannel, 'fakeShard', 'log',
            $.extend({}, defaultTestTableConfig, {
              useIncrementalRefresh: true
            })))
  };
};

/**
 * Set up global singleton with default level configuration
 */
exports.initializeGlobalsToDefaultValues = function () {
  NetSimLogger.getSingleton().setVerbosity(NetSimLogger.LogLevel.NONE);
  // Deep clone level so that changes we make to it for testing don't bleed
  // into other tests.
  NetSimGlobals.setRootControllers({}, {
    level: _.clone(levels.custom, true),
    globalMaxRouters: 20
  });
};
