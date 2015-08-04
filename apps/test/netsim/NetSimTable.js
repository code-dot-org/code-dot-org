var testUtils = require('../util/testUtils');
var assert = testUtils.assert;
var assertEqual = testUtils.assertEqual;
var assertThrows = testUtils.assertThrows;
var netsimTestUtils = require('../util/netsimTestUtils');
var fakeStorageTable = netsimTestUtils.fakeStorageTable;

var NetSimTable = require('@cdo/apps/netsim/NetSimTable');

/**
 * Helper method for introducing a delay in your test method.
 * @param {number} delayMs - Number of milliseconds to wait before continuing.
 * @param {function} testDone - Chai's "done" callback.
 * @param {function} nextStep - Function to call after the delay.
 */
function delayTest(delayMs, testDone, nextStep) {
  setTimeout(function () {
    try {
      nextStep();
    } catch (e) {
      testDone(e);
    }
  }, delayMs);
}

describe("NetSimTable", function () {
  var apiTable, netsimTable, callback, notified, fakeChannel;

  beforeEach(function () {
    fakeChannel = {
      subscribe: function () {}
    };
    netsimTable = netsimTestUtils.overrideNetSimTableApi(
        new NetSimTable(fakeChannel, 'testShard', 'testTable'));

    apiTable = netsimTable.api_.remoteTable;
    callback = function () {};
    notified = false;
    netsimTable.tableChange.register(function () {
      notified = true;
    });
  });

  it ("throws if constructed with missing arguments", function () {
    assertThrows(Error, function () {
      var _ = new NetSimTable('just-one-argument');
    });

    assertThrows(Error, function () {
      var _ = new NetSimTable('just-two', 'arguments');
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
    netsimTable.create({data: "A"}, callback);

    notified = false;
    netsimTable.readAll(callback);
    assertEqual(notified, false);

    // Remote update - doesn't hit our caches
    apiTable.update(1, {data: "B"}, callback);

    notified = false;
    netsimTable.readAll(callback);
    assertEqual(notified, true);
  });

  it ("notifies on read if the requested remote row changed", function () {
    netsimTable.create({data: "A"}, callback);

    notified = false;
    netsimTable.read(1, callback);
    assertEqual(notified, false);

    // Remote update - doesn't hit our caches
    apiTable.update(1, {data: "B"}, callback);

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
    netsimTable.create({data: "A"}, callback);

    notified = false;
    netsimTable.update(1, {data: "A"}, callback);
    assertEqual(notified, false);

    notified = false;
    netsimTable.update(1, {data: "B"}, callback);
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
    netsimTable.tableChange.register(function (newTableData) {
      receivedTableData = newTableData;
    });

    netsimTable.create({data: "A"}, callback);
    assertEqual(receivedTableData,
        [
          {data: "A", id: 1}
        ]);

    // Remote change
    apiTable.create({data: "B"}, callback);
    netsimTable.readAll(callback);
    assertEqual(receivedTableData,
        [
          {data: "A", id: 1},
          {data: "B", id: 2}
        ]);

    netsimTable.update(2, {data: "C"}, callback);
    assertEqual(receivedTableData,
        [
          {data: "A", id: 1},
          {data: "C", id: 2}
        ]);

    netsimTable.delete(1, callback);
    assertEqual(
        receivedTableData,
        [
          {data: "C", id: 2}
        ]);
  });

  it ("polls table on tick", function () {
    // For this test, disable refresh throttling
    netsimTable.setRefreshThrottleTime(0);
    
    // Initial tick always triggers a poll event.
    netsimTable.tick();
    assertEqual(apiTable.log(), 'readAll');

    // Additional tick does not trigger poll event...
    apiTable.log('');
    netsimTable.tick();
    assertEqual(apiTable.log(), '');

    // Until poll interval has passed.
    netsimTable.lastRefreshTime_ = Date.now() - (netsimTable.pollingInterval_ + 1);
    netsimTable.tick();
    assertEqual(apiTable.log(), 'readAll');
  });

  describe ("refreshTable_ throttling", function () {
    beforeEach(function () {
      // Re-enable 10ms refreshTable_ throttle to test throttling feature
      netsimTable.setRefreshThrottleTime(50);
    });

    it ("still reads immediately on first request", function () {
      netsimTable.refreshTable_(callback);
      assertEqual(apiTable.log(), 'readAll');
    });

    it ("coalesces multiple rapid requests", function () {
      for (var i = 0; i < 5; i++) {
        netsimTable.refreshTable_(callback);
      }
      assertEqual(apiTable.log(), 'readAll');
    });

    it ("does not issue trailing request when only one request occurred", function (testDone) {
      netsimTable.refreshTable_(callback);
      delayTest(50, testDone, function () {
        assertEqual(apiTable.log(), 'readAll');
        testDone();
      });
    });

    it ("issues trailing request when multiple requests occurred", function (testDone) {
      for (var i = 0; i < 5; i++) {
        netsimTable.refreshTable_(callback);
      }
      assertEqual(apiTable.log(), 'readAll');
      delayTest(10, testDone, function () {
        assertEqual(apiTable.log(), 'readAll');
        delayTest(40, testDone, function () {
          // See the second request come in by 50ms of delay
          assertEqual(apiTable.log(), 'readAllreadAll');
          testDone();
        });
      });
    });

    it ("throttles requests", function (testDone) {
      assertEqual(apiTable.log(), '');
      delayTest(10, testDone, function () {

        // Call at 10ms happens immediately, even when delayed
        assertEqual(apiTable.log(), '');
        netsimTable.refreshTable_(callback);
        assertEqual(apiTable.log(), 'readAll');
        delayTest(10, testDone, function () {

          // Call at 20ms causes no request (yet)
          assertEqual(apiTable.log(), 'readAll');
          netsimTable.refreshTable_(callback);
          assertEqual(apiTable.log(), 'readAll');
          delayTest(40, testDone, function () {

            // Trailing request from second call has already happened, but
            // third call does not cause immediate request.
            assertEqual(apiTable.log(), 'readAllreadAll');
            netsimTable.refreshTable_(callback);
            assertEqual(apiTable.log(), 'readAllreadAll');
            delayTest(60, testDone, function () {

              // Trailing request from third call has arrived
              assertEqual(apiTable.log(), 'readAllreadAllreadAll');
              testDone();
            });
          });
        });
      });
    });
  });

  describe ("incremental update", function () {

    beforeEach(function () {
      // New table configured for incremental refresh
      netsimTable = netsimTestUtils.overrideNetSimTableApi(
          new NetSimTable(fakeChannel, 'testShard', 'testTable', {
            useIncrementalRefresh: true
          }));

      // Allow multiple quick reads for testing
      netsimTable.setRefreshThrottleTime(0);

      // Necessary to re-get apiTable when we recreate netsimTable
      apiTable = netsimTable.api_.remoteTable;
    });

    it ("Initially requests from row 1", function () {
      assertEqual(apiTable.log(), '');
      netsimTable.refreshTable_(callback);
      assertEqual(apiTable.log(), 'readAllFromID[1]');
      assertEqual(netsimTable.readAllCached(), []);

      // Keeps requesting from row 1 when there's no content
      apiTable.clearLog();
      assertEqual(apiTable.log(), '');
      netsimTable.refreshTable_(callback);
      assertEqual(apiTable.log(), 'readAllFromID[1]');
    });

    it ("Requests from beyond most recent row received in refresh", function () {
      netsimTable.create({}, callback);
      netsimTable.create({}, callback);
      netsimTable.create({}, callback);
      assertEqual('create[{}]create[{}]create[{}]', apiTable.log());

      apiTable.clearLog();
      netsimTable.refreshTable_(callback);
      // Intentionally "1" here - we update our internal "latestRowID"
      // until after an incremental or full read.
      assertEqual('readAllFromID[1]', apiTable.log());
      assertEqual([{id:1}, {id:2}, {id:3}], netsimTable.readAllCached());

      apiTable.clearLog();
      netsimTable.create({}, callback);
      netsimTable.refreshTable_(callback);
      // Got 1, 2, 3 in last refresh, so we read all from 4 this time.
      assertEqual('create[{}]readAllFromID[4]', apiTable.log());
      assertEqual([{id:1}, {id:2}, {id:3}, {id:4}], netsimTable.readAllCached());
    });

  });

});
