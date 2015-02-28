var testUtils = require('../util/testUtils');
var assert = testUtils.assert;

var NetSimTable = testUtils.requireWithGlobalsCheckBuildFolder('netsim/NetSimTable');

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
  shard[tableName].readAll(function (err, rows) {
    rowCount = rows.length;
  });
  assert(rowCount === size, "Expected table '" + tableName +
      "' to contain " + size + " rows, but it had " + rowCount +
      " rows.");
};

/**
 * Storage table API placeholder for testing, always hits callbacks immediately
 * so tests can be written imperatively.
 * @returns {Object}
 */
exports.fauxStorageTable = function () {
  var log_ = '';
  var rowIndex_ = 1;
  var tableData_ = [];

  return {

    readAll: function (callback) {
      log_ += 'readAll';

      callback(null, tableData_);
    },

    read: function (id, callback) {
      log_ += 'read[' + id + ']';

      for (var i = 0; i < tableData_.length; i++) {
        if (tableData_[i].id === id) {
          callback(null, tableData_[i]);
          return;
        }
      }
      callback(new Error('Not Found'), undefined);
    },

    create: function (value, callback) {
      log_ += 'create[' + JSON.stringify(value) + ']';

      value.id = rowIndex_;
      rowIndex_++;
      tableData_.push(value);

      callback(null, value);
    },

    update: function (id, value, callback) {
      log_ += 'update[' + id + ', ' + JSON.stringify(value) + ']';

      value.id = id;
      for (var i = 0; i < tableData_.length; i++) {
        if (tableData_[i].id === id) {
          tableData_[i] = value;
          callback(null, true);
          return;
        }
      }

      callback(new Error('Not Found'), false);
    },

    delete: function (id, callback) {
      log_ += 'delete[' + id + ']';

      for (var i = 0; i < tableData_.length; i++) {
        if (tableData_[i].id === id) {
          tableData_.splice(i, 1);
          callback(null, true);
          return;
        }
      }

      callback(new Error('Not Found'), false);
    },

    log: function () {
      if (arguments.length > 0) {
        log_ = arguments[0];
      }

      return log_;
    }
  };
};

exports.fakeShard = function () {
  var nodeTable_ = exports.fauxStorageTable();
  var wireTable_ = exports.fauxStorageTable();
  var messageTable_ = exports.fauxStorageTable();
  var logTable_ = exports.fauxStorageTable();
  var heartbeatTable_ = exports.fauxStorageTable();
  return {
    remoteNodeTable: nodeTable_,
    nodeTable: new NetSimTable(nodeTable_),

    remoteWireTable: wireTable_,
    wireTable: new NetSimTable(wireTable_),

    remoteMessageTable: messageTable_,
    messageTable: new NetSimTable(messageTable_),

    remoteLogTable: logTable_,
    logTable: new NetSimTable(logTable_),

    remoteHeartbeatTable: heartbeatTable_,
    heartbeatTable: new NetSimTable(heartbeatTable_)
  };
};
