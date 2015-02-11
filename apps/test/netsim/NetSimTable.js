var testUtils = require('../util/testUtils');
var assert = testUtils.assert;
var NetSimTable = testUtils.requireWithGlobalsCheckBuildFolder('netsim/NetSimTable');

var assertEqual = function (left, right) {
  assert(left === right, '' + left + '===' + right);
};

/**
 * Storage table API placeholder for testing, always hits callbacks immediately
 * so tests can be written imperatively.
 * @returns {Object}
 */
var fauxStorageTable = function () {
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

describe("NetSimTable", function () {
  var apiTable, netsimTable, callback, notified;

  beforeEach(function () {
    apiTable = fauxStorageTable();
    netsimTable = new NetSimTable(apiTable);
    callback = function () {};
    notified = false;
    netsimTable.tableChangeEvent.register(function () {
      notified = true;
    });
  });

  it ("calls readAll on the API table", function () {
    netsimTable.readAll(callback);
    assertEqual(apiTable.log(), 'readAll');
  });

  it ("calls read on the API table", function () {
    netsimTable.read(1, callback);
    assertEqual(apiTable.log(), 'read[1]');
  });

  it ("calls create on the API table", function () {
    netsimTable.create({}, callback);
    assertEqual(apiTable.log(), 'create[{}]');
  });

  it ("calls update on the API table", function () {
    netsimTable.update(1, {}, callback);
    assertEqual(apiTable.log(), 'update[1, {}]');
  });

  it ("calls delete on the API table", function () {
    netsimTable.delete(1, callback);
    assertEqual(apiTable.log(), 'delete[1]');
  });

  it ("notifies on readAll if any remote row changed", function () {
    netsimTable.create({data:"A"}, callback);

    notified = false;
    netsimTable.readAll(callback);
    assertEqual(notified, false);

    // Remote update - doesn't hit our caches
    apiTable.update(1, {data:"B"}, callback);

    notified = false;
    netsimTable.readAll(callback);
    assertEqual(notified, true);
  });

  it ("notifies on read if the requested remote row changed", function () {
    netsimTable.create({data:"A"}, callback);

    notified = false;
    netsimTable.read(1, callback);
    assertEqual(notified, false);

    // Remote update - doesn't hit our caches
    apiTable.update(1, {data:"B"}, callback);

    notified = false;
    netsimTable.read(1, callback);
    assertEqual(notified, true);
  });

  it ("notifies on every create", function () {
    notified = false;
    netsimTable.create({}, callback);
    assertEqual(notified, true);
  });

  it ("notifies on update if the cache row changed", function () {
    netsimTable.create({data:"A"}, callback);

    notified = false;
    netsimTable.update(1, {data:"A"}, callback);
    assertEqual(notified, false);

    notified = false;
    netsimTable.update(1, {data:"B"}, callback);
    assertEqual(notified, true);
  });

  it ("notifies on delete when row was previously in cache", function () {
    notified = false;
    netsimTable.delete(1, callback);
    assertEqual(notified, false);

    netsimTable.create({}, callback);

    notified = false;
    netsimTable.delete(1, callback);
    assertEqual(notified, true);
  });

  it ("passes new full table contents to notification callbacks", function () {
    var receivedTableData;
    netsimTable.tableChangeEvent.register(function (newTableData) {
      receivedTableData = newTableData;
    });

    netsimTable.create({data:"A"}, callback);
    assertEqual(
        JSON.stringify(receivedTableData),
        '[{"data":"A","id":1}]');

    // Remote change
    apiTable.create({data:"B"}, callback);
    netsimTable.readAll(callback);
    assertEqual(
        JSON.stringify(receivedTableData),
        '[{"data":"A","id":1},{"data":"B","id":2}]');

    netsimTable.update(2, {data:"C"}, callback);
    assertEqual(
        JSON.stringify(receivedTableData),
        '[{"data":"A","id":1},{"data":"C","id":2}]');

    netsimTable.delete(1, callback);
    assertEqual(
        JSON.stringify(receivedTableData),
        '[{"data":"C","id":2}]');
  });

  it ("polls table on tick", function () {
    // Initial tick always triggers a poll event.
    netsimTable.tick();
    assertEqual(apiTable.log(), 'readAll');

    // Additional tick does not trigger poll event...
    apiTable.log('');
    netsimTable.tick();
    assertEqual(apiTable.log(), '');

    // Until 5-second poll interval has passed.
    netsimTable.lastFullUpdateTime_ = Date.now() - 5001;
    netsimTable.tick();
    assertEqual(apiTable.log(), 'readAll');
  });

});
