var testUtils = require('../util/testUtils');
var assert = testUtils.assert;

/**
 * Checks whether the given table has the specified number of rows.
 *
 * @param {!NetSimShard} shard - Ideally a fauxShard
 * @param {!string} tableName - Passed a string instead of the table for error
 *        message readability.  Should be name of a member of the shard.
 * @param {!number} size - Expected number of rows.
 */
exports.assertTableSize = function (shard, tableName, size) {
  var rowCount;
  shard[tableName].readAll(function (rows) {
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

      callback(tableData_);
    },

    read: function (id, callback) {
      log_ += 'read[' + id + ']';

      for (var i = 0; i < tableData_.length; i++) {
        if (tableData_[i].id === id) {
          callback(tableData_[i]);
          return;
        }
      }
      callback(undefined);
    },

    create: function (value, callback) {
      log_ += 'create[' + JSON.stringify(value) + ']';

      value.id = rowIndex_;
      rowIndex_++;
      tableData_.push(value);

      callback(value);
    },

    update: function (id, value, callback) {
      log_ += 'update[' + id + ', ' + JSON.stringify(value) + ']';

      value.id = id;
      for (var i = 0; i < tableData_.length; i++) {
        if (tableData_[i].id === id) {
          tableData_[i] = value;
          callback(true);
          return;
        }
      }

      callback(false);
    },

    delete: function (id, callback) {
      log_ += 'delete[' + id + ']';

      for (var i = 0; i < tableData_.length; i++) {
        if (tableData_[i].id === id) {
          tableData_.splice(i, 1);
          callback(true);
          return;
        }
      }

      callback(false);
    },

    log: function () {
      if (arguments.length > 0) {
        log_ = arguments[0];
      }

      return log_;
    }
  };
};

exports.fauxShard = function () {
  return {
    nodeTable: exports.fauxStorageTable(),
    wireTable: exports.fauxStorageTable(),
    messageTable: exports.fauxStorageTable(),
    heartbeatTable: exports.fauxStorageTable()
  };
};
