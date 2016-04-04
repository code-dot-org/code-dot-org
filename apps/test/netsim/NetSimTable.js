'use strict';
/* global describe, beforeEach, it */

var assert = require('../util/testUtils').assert;
var NetSimTestUtils = require('../util/netsimTestUtils');
var NetSimTable = require('@cdo/apps/netsim/NetSimTable');
var NetSimGlobals = require('@cdo/apps/netsim/NetSimGlobals');

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
  var apiTable, netsimTable, callback, notified, notifyCount, fakeChannel;

  beforeEach(function () {
    fakeChannel = {
      subscribe: function () {}
    };
    netsimTable = NetSimTestUtils.overrideNetSimTableApi(
        new NetSimTable(fakeChannel, 'testShard', 'testTable', {
          // In tests we usually want zero delay to allow fast test runs
          // and immediate reading at any time.
          minimumDelayBeforeRefresh: 0,
          maximumJitterDelay: 0,
          minimumDelayBetweenRefreshes: 0
        }));

    apiTable = netsimTable.api_.remoteTable;
    callback = function () {};
    notified = false;
    notifyCount = 0;
    netsimTable.tableChange.register(function () {
      notified = true;
      notifyCount++;
    });
  });

  it("throws if constructed with missing arguments", function () {
    assert.throws(function () {
      var _ = new NetSimTable('just-one-argument');
    }, TypeError);

    assert.throws(function () {
      var _ = new NetSimTable('just-two', 'arguments');
    }, TypeError);
  });

  describe("throws if constructed with invalid options", function () {
    describe("useIncrementalRefresh", function () {
      it("accepts `undefined`, defaults to false", function () {
        var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
          useIncrementalRefresh: undefined
        });
        assert.isFalse(_.useIncrementalRefresh_);
      });

      it("accepts booelan values", function () {
        var _a = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
          useIncrementalRefresh: true
        });

        var _b = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
          useIncrementalRefresh: false
        });
      });

      it("rejects numbers", function () {
        assert.throws(function () {
          var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
            useIncrementalRefresh: 45.302
          });
        }, TypeError);
        assert.throws(function () {
          var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
            useIncrementalRefresh: -88
          });
        }, TypeError);
      });

      it("rejects `null`", function () {
        assert.throws(function () {
          var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
            useIncrementalRefresh: null
          });
        }, TypeError);
      });

      it("rejects strings", function () {
        assert.throws(function () {
          var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
            useIncrementalRefresh: "twenty hours"
          });
        }, TypeError);
      });

      it("rejects objects", function () {
        assert.throws(function () {
          var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
            useIncrementalRefresh: {}
          });
        }, TypeError);
      });

      it("rejects Infinities", function () {
        assert.throws(function () {
          var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
            useIncrementalRefresh: Infinity
          });
        }, TypeError);

        assert.throws(function () {
          var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
            useIncrementalRefresh: -Infinity
          });
        }, TypeError);
      });

      it("rejects NaN", function () {
        assert.throws(function () {
          var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
            useIncrementalRefresh: NaN
          });
        }, TypeError);
      });
    });

    describe("minimumDelayBeforeRefresh", function () {
      it("accepts `undefined`", function () {
        var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
          minimumDelayBeforeRefresh: undefined
        });
      });

      it("accepts ordinary numbers > 0", function () {
        var _a = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
          minimumDelayBeforeRefresh: 50.354
        });

        var _b = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
          minimumDelayBeforeRefresh: 0
        });
      });

      it("rejects negative numbers", function () {
        assert.throws(function () {
          var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
            minimumDelayBeforeRefresh: -88
          });
        }, TypeError);
      });

      it("rejects `null`", function () {
        assert.throws(function () {
          var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
            minimumDelayBeforeRefresh: null
          });
        }, TypeError);
      });

      it("rejects strings", function () {
        assert.throws(function () {
          var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
            minimumDelayBeforeRefresh: "twenty hours"
          });
        }, TypeError);
      });

      it("rejects objects", function () {
        assert.throws(function () {
          var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
            minimumDelayBeforeRefresh: {}
          });
        }, TypeError);
      });

      it("rejects Infinities", function () {
        assert.throws(function () {
          var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
            minimumDelayBeforeRefresh: Infinity
          });
        }, TypeError);

        assert.throws(function () {
          var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
            minimumDelayBeforeRefresh: -Infinity
          });
        }, TypeError);
      });

      it("rejects NaN", function () {
        assert.throws(function () {
          var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
            minimumDelayBeforeRefresh: NaN
          });
        }, TypeError);
      });
    });

    describe("maximumJitterDelay", function () {
      it("accepts `undefined`", function () {
        var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
          maximumJitterDelay: undefined
        });
      });

      it("accepts ordinary numbers > 0", function () {
        var _a = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
          maximumJitterDelay: 50.354
        });

        var _b = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
          maximumJitterDelay: 0
        });
      });

      it("rejects negative numbers", function () {
        assert.throws(function () {
          var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
            maximumJitterDelay: -88
          });
        }, TypeError);
      });

      it("rejects `null`", function () {
        assert.throws(function () {
          var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
            maximumJitterDelay: null
          });
        }, TypeError);
      });

      it("rejects strings", function () {
        assert.throws(function () {
          var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
            maximumJitterDelay: "twenty hours"
          });
        }, TypeError);
      });

      it("rejects objects", function () {
        assert.throws(function () {
          var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
            maximumJitterDelay: {}
          });
        }, TypeError);
      });

      it("rejects Infinities", function () {
        assert.throws(function () {
          var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
            maximumJitterDelay: Infinity
          });
        }, TypeError);

        assert.throws(function () {
          var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
            maximumJitterDelay: -Infinity
          });
        }, TypeError);
      });

      it("rejects NaN", function () {
        assert.throws(function () {
          var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
            maximumJitterDelay: NaN
          });
        }, TypeError);
      });
    });

    describe("minimumDelayBetweenRefreshes", function () {
      it("accepts `undefined`", function () {
        var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
          minimumDelayBetweenRefreshes: undefined
        });
      });

      it("accepts ordinary numbers > 0", function () {
        var _a = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
          minimumDelayBetweenRefreshes: 50.354
        });

        var _b = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
          minimumDelayBetweenRefreshes: 0
        });
      });

      it("rejects negative numbers", function () {
        assert.throws(function () {
          var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
            minimumDelayBetweenRefreshes: -88
          });
        }, TypeError);
      });

      it("rejects `null`", function () {
        assert.throws(function () {
          var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
            minimumDelayBetweenRefreshes: null
          });
        }, TypeError);
      });

      it("rejects strings", function () {
        assert.throws(function () {
          var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
            minimumDelayBetweenRefreshes: "twenty hours"
          });
        }, TypeError);
      });

      it("rejects objects", function () {
        assert.throws(function () {
          var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
            minimumDelayBetweenRefreshes: {}
          });
        }, TypeError);
      });

      it("rejects Infinities", function () {
        assert.throws(function () {
          var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
            minimumDelayBetweenRefreshes: Infinity
          });
        }, TypeError);

        assert.throws(function () {
          var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
            minimumDelayBetweenRefreshes: -Infinity
          });
        }, TypeError);
      });

      it("rejects NaN", function () {
        assert.throws(function () {
          var _ = new NetSimTable(fakeChannel, 'shardID', 'tableName', {
            minimumDelayBetweenRefreshes: NaN
          });
        }, TypeError);
      });
    });
  });

  it("calls readAll on the API table", function () {
    netsimTable.refresh(callback);
    assert.equal(apiTable.log(), 'readAll');
  });

  it("can give back all rows in local cache with readAll", function () {
    netsimTable.create({}, callback);
    netsimTable.create({}, callback);
    netsimTable.create({}, callback);
    netsimTable.create({}, callback);
    netsimTable.create({}, callback);
    var rows = netsimTable.readAll();
    assert.equal(5, rows.length);
  });

  it("can give back a subset of rows with readAllFromID", function () {
    netsimTable.create({type: 'old'}, callback);
    netsimTable.create({type: 'old'}, callback);
    netsimTable.create({type: 'old'}, callback);
    netsimTable.create({type: 'new'}, callback);
    netsimTable.create({type: 'new'}, callback);
    var rows = netsimTable.readAllFromID(4);
    assert.equal(2, rows.length);
    rows.forEach(function (row) {
      assert.equal('new', row.type);
    });
  });

  it("calls read on the API table", function () {
    netsimTable.read(1, callback);
    assert.equal(apiTable.log(), 'read[1]');
  });

  it("calls create on the API table", function () {
    netsimTable.create({}, callback);
    assert.equal(apiTable.log(), 'create[{}]');
  });

  it("calls multiCreate on the API table", function () {
    netsimTable.multiCreate([{order:'first'}, {order:'second'}], callback);
    assert.equal(apiTable.log(), 'create[{"order":"first"}]create[{"order":"second"}]');
  });

  it("calls update on the API table", function () {
    netsimTable.update(1, {}, callback);
    assert.equal(apiTable.log(), 'update[1, {}]');
  });

  it("calls delete on the API table", function () {
    netsimTable.delete(1, callback);
    assert.equal(apiTable.log(), 'delete[1]');
  });

  it("calls deleteRows on the API table", function () {
    netsimTable.deleteMany([1, 2], callback);
    assert.equal(apiTable.log(), 'delete[1,2]');
  });

  it("notifies on refresh if any remote row changed", function () {
    netsimTable.create({data: "A"}, callback);

    notified = false;
    netsimTable.refresh(callback);
    assert.isFalse(notified);

    // Remote update - doesn't hit our caches
    apiTable.update(1, {data: "B"}, callback);

    notified = false;
    netsimTable.refresh(callback);
    assert.isTrue(notified);
  });

  it("notifies on read if the requested remote row changed", function () {
    netsimTable.create({data: "A"}, callback);

    notified = false;
    netsimTable.read(1, callback);
    assert.isFalse(notified);

    // Remote update - doesn't hit our caches
    apiTable.update(1, {data: "B"}, callback);

    notified = false;
    netsimTable.read(1, callback);
    assert.isTrue(notified);
  });

  it("notifies on every create", function () {
    notified = false;
    netsimTable.create({}, callback);
    assert.isTrue(notified);
  });

  it("notifies on update if the cache row changed", function () {
    netsimTable.create({data: "A"}, callback);

    notified = false;
    netsimTable.update(1, {data: "A"}, callback);
    assert.isFalse(notified);

    notified = false;
    netsimTable.update(1, {data: "B"}, callback);
    assert.isTrue(notified);
  });

  it("notifies on delete when row was previously in cache", function () {
    notified = false;
    netsimTable.delete(1, callback);
    assert.isFalse(notified);

    netsimTable.create({}, callback);

    notified = false;
    netsimTable.delete(1, callback);
    assert.isTrue(notified);
  });

  it("notifies once on deleteMany operation if anything was deleted", function () {
    notifyCount = 0;
    netsimTable.deleteMany([1, 2, 3], callback);
    assert.equal(notifyCount, 0);

    notifyCount = 0;
    netsimTable.create({}, callback);
    netsimTable.create({}, callback);
    netsimTable.create({}, callback);
    assert.equal(notifyCount, 3);

    notifyCount = 0;
    netsimTable.deleteMany([1, 3], callback);
    assert.equal(notifyCount, 1);
  });

  it("polls table on tick", function () {
    // Initial tick always triggers a poll event.
    netsimTable.tick();
    assert.equal(apiTable.log(), 'readAll');

    // Additional tick does not trigger poll event...
    apiTable.log('');
    netsimTable.tick();
    assert.equal(apiTable.log(), '');

    // Until poll interval is reached.
    netsimTable.lastRefreshTime_ = Date.now() - (netsimTable.pollingInterval_);
    netsimTable.tick();
    assert.equal(apiTable.log(), 'readAll');
  });

  describe("initial delay coalescing", function () {
    var COALESCE_WINDOW = 100; // ms

    beforeEach(function () {
      // Re-enable 100ms before-refresh delay to coalesce messages
      netsimTable.setMinimumDelayBeforeRefresh(COALESCE_WINDOW);
    });

    it("does not read until minimum delay passes", function (testDone) {
      netsimTable.refreshTable_(callback);
      assert.equal('', apiTable.log());
      delayTest(COALESCE_WINDOW, testDone, function () {
        assert.equal('readAll', apiTable.log());
        testDone();
      });
    });

    it("coalesces multiple rapid requests", function (testDone) {
      netsimTable.refreshTable_(callback);
      netsimTable.refreshTable_(callback);
      netsimTable.refreshTable_(callback);
      assert.equal('', apiTable.log());

      delayTest(COALESCE_WINDOW / 2, testDone, function () {
        netsimTable.refreshTable_(callback);
        netsimTable.refreshTable_(callback);
        netsimTable.refreshTable_(callback);
        assert.equal('', apiTable.log());

        delayTest(COALESCE_WINDOW / 2, testDone, function () {
          // Only one request at initial delay
          assert.equal('readAll', apiTable.log());

          delayTest(COALESCE_WINDOW / 2, testDone, function () {
            // Still only one request has occurred - the calls at 50ms
            // were coalesced into the initial call.
            assert.equal('readAll', apiTable.log());

            testDone();
          });
        });
      });
    });

    it("does not coalesce if requests are far enough apart", function (testDone) {
      netsimTable.refreshTable_(callback);
      delayTest(COALESCE_WINDOW, testDone, function () {
        assert.equal('readAll', apiTable.log());

        // This kicks off another delayed request
        netsimTable.refreshTable_(callback);
        assert.equal('readAll', apiTable.log());

        delayTest(COALESCE_WINDOW, testDone, function () {
          // Both requests occur
          assert.equal('readAllreadAll', apiTable.log());

          testDone();
        });
      });
    });
  });

  describe("refresh throttling", function () {
    beforeEach(function () {
      // Re-enable 50ms refreshTable_ throttle to test throttling feature
      netsimTable.setMinimumDelayBetweenRefreshes(50);
    });

    it("still reads immediately on first request", function () {
      netsimTable.refreshTable_(callback);
      assert.equal(apiTable.log(), 'readAll');
    });

    it("coalesces multiple rapid requests", function () {
      for (var i = 0; i < 5; i++) {
        netsimTable.refreshTable_(callback);
      }
      assert.equal(apiTable.log(), 'readAll');
    });

    it("does not issue trailing request when only one request occurred", function (testDone) {
      netsimTable.refreshTable_(callback);
      delayTest(50, testDone, function () {
        assert.equal(apiTable.log(), 'readAll');
        testDone();
      });
    });

    it("issues trailing request when multiple requests occurred", function (testDone) {
      for (var i = 0; i < 5; i++) {
        netsimTable.refreshTable_(callback);
      }
      assert.equal('readAll', apiTable.log());
      delayTest(10, testDone, function () {
        assert.equal('readAll', apiTable.log());
        delayTest(40, testDone, function () {
          // See the second request come in by 50ms of delay
          assert.equal('readAllreadAll', apiTable.log());
          testDone();
        });
      });
    });

    it("throttles requests", function (testDone) {
      assert.equal('', apiTable.log());
      delayTest(10, testDone, function () {

        // Call at 10ms happens immediately, even when delayed
        assert.equal('', apiTable.log());
        netsimTable.refreshTable_(callback);
        assert.equal('readAll', apiTable.log());
        delayTest(10, testDone, function () {

          // Call at 20ms causes no request (yet)
          assert.equal('readAll', apiTable.log());
          netsimTable.refreshTable_(callback);
          assert.equal('readAll', apiTable.log());
          delayTest(40, testDone, function () {

            // Trailing request from second call has already happened, but
            // third call does not cause immediate request.
            assert.equal('readAllreadAll', apiTable.log());
            netsimTable.refreshTable_(callback);
            assert.equal('readAllreadAll', apiTable.log());
            delayTest(60, testDone, function () {

              // Trailing request from third call has arrived
              assert.equal('readAllreadAllreadAll', apiTable.log());
              testDone();
            });
          });
        });
      });
    });
  });

  describe("refresh jitter", function () {
    beforeEach(function () {
      // Re-enable 50ms jitter to test random refresh delays.
      netsimTable.setMaximumJitterDelay(50);
    });

    it("waits a random amount of time before reading on each request", function (testDone) {
      NetSimGlobals.setRandomSeed('Jitter test 1');
      // With this seed, the refresh fires sometime between 30-40ms.

      netsimTable.refresh();
      delayTest(30, testDone, function () {
        assert.equal('', apiTable.log());

        delayTest(10, testDone, function () {
          assert.equal('readAll', apiTable.log());
          testDone();
        });
      });
    });

    it("second example (different random seed)", function (testDone) {
      NetSimGlobals.setRandomSeed('Jitter test 2');
      // With this seed, the refresh fires almost immediately - in under 10 ms.

      netsimTable.refresh();
      assert.equal('', apiTable.log());

      delayTest(10, testDone, function () {
        assert.equal('readAll', apiTable.log());
        testDone();
      });
    });

    it("recalculated for every refresh", function (testDone) {
      NetSimGlobals.setRandomSeed('Jitter test 3');
      // Without request coalescing, we start two requests at the same time,
      // but they will actually fire with different random delays.

      netsimTable.refresh();
      netsimTable.refresh();

      // Neither fires instantly
      assert.equal('', apiTable.log());

      // First one has fired after 20ms
      delayTest(20, testDone, function () {
        assert.equal('readAll', apiTable.log());

        // Second has fired after 20ms more
        delayTest(20, testDone, function () {
          assert.equal('readAllreadAll', apiTable.log());
          testDone();
        });
      });
    });
  });

  describe("incremental update", function () {

    beforeEach(function () {
      // New table configured for incremental refresh
      netsimTable = NetSimTestUtils.overrideNetSimTableApi(
          new NetSimTable(fakeChannel, 'testShard', 'testTable', {
            useIncrementalRefresh: true,
            minimumDelayBeforeRefresh: 0,
            maximumJitterDelay: 0,
            minimumDelayBetweenRefreshes: 0
          }));

      // Necessary to re-get apiTable when we recreate netsimTable
      apiTable = netsimTable.api_.remoteTable;
    });

    it("Initially requests from row 1", function () {
      assert.equal('', apiTable.log());
      netsimTable.refreshTable_(callback);
      assert.equal('readAllFromID[1]', apiTable.log());
      assert.deepEqual([], netsimTable.readAll());

      // Keeps requesting from row 1 when there's no content
      apiTable.clearLog();
      assert.equal('', apiTable.log());
      netsimTable.refreshTable_(callback);
      assert.equal('readAllFromID[1]', apiTable.log());
    });

    it("Requests from beyond most recent row received in refresh", function () {
      var row1, row2, row3, row4;
      netsimTable.create({}, function (err, result) { row1 = result; });
      netsimTable.create({}, function (err, result) { row2 = result; });
      netsimTable.create({}, function (err, result) { row3 = result; });
      assert.equal('create[{}]create[{}]create[{}]', apiTable.log());

      apiTable.clearLog();
      netsimTable.refreshTable_(callback);
      // Intentionally "1" here - we update our internal "latestRowID"
      // until after an incremental or full read.
      assert.equal('readAllFromID[1]', apiTable.log());
      assert.deepEqual([row1, row2, row3], netsimTable.readAll());

      apiTable.clearLog();
      netsimTable.create({}, function (err, result) { row4 = result; });
      netsimTable.refreshTable_(callback);
      // Got 1, 2, 3 in last refresh, so we read all from 4 this time.
      assert.equal('create[{}]readAllFromID[4]', apiTable.log());
      assert.deepEqual([row1, row2, row3, row4], netsimTable.readAll());
    });

  });

});
