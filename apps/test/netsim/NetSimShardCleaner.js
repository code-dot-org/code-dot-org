var testUtils = require('../util/testUtils');
var assert = testUtils.assert;
var assertEqual = testUtils.assertEqual;
var assertOwnProperty = testUtils.assertOwnProperty;
var netsimTestUtils = require('../util/netsimTestUtils');
var fauxShard = netsimTestUtils.fauxShard;

var NetSimShardCleaner = testUtils.requireWithGlobalsCheckBuildFolder('netsim/NetSimShardCleaner');
var NetSimLogger = testUtils.requireWithGlobalsCheckBuildFolder('netsim/NetSimLogger');

describe("NetSimShardCleaner", function () {
  var testShard, cleaner;

  beforeEach(function () {
    NetSimLogger.getSingleton().setVerbosity(NetSimLogger.LogLevel.NONE);
    testShard = fauxShard();
    cleaner = new NetSimShardCleaner(testShard);
  });

  it ("makes a cleaning attempt on its first tick", function () {
    assertEqual(cleaner.nextAttempt_, Date.now());
    cleaner.tick({});
    assert(cleaner.nextAttempt_ > Date.now(), "Next attempt pushed into future");
  });

  it ("gets Cleaning Lock by putting a special row in the heartbeat table", function () {
    testShard.heartbeatTable.readAll(function (rows) {
      assertEqual(rows.length, 0);
    });
    cleaner.getCleaningLock(function (success) {
      assert(success === true, "Callback takes a boolean success value");
    });
    testShard.heartbeatTable.readAll(function (rows) {
      assertEqual(rows.length, 1);
      assertOwnProperty(rows[0], 'cleaner');
    });
  });

  it ("fails to get Cleaning Lock if one already exists", function () {
    cleaner.getCleaningLock(function (success) {
      assert(success === true, "First cleaner gets lock.");
    });

    testShard.heartbeatTable.readAll(function (rows) {
      assertEqual(rows.length, 1);
    });
    assert(cleaner.hasCleaningLock());

    var cleaner2 = new NetSimShardCleaner(testShard);
    cleaner2.getCleaningLock(function (success) {
      assert(success === false, "Second cleaner fails to get lock.");
    });

    // Make sure clean-up of second lock happens
    testShard.heartbeatTable.readAll(function (rows) {
      assertEqual(rows.length, 1);
    });
    assert(!cleaner2.hasCleaningLock());
  });

  it ("can release cleaning lock", function () {
    cleaner.getCleaningLock(function (success) {
      assert(success === true, "Cleaner gets lock.");
    });

    testShard.heartbeatTable.readAll(function (rows) {
      assertEqual(rows.length, 1);
    });
    assert(cleaner.hasCleaningLock());

    cleaner.releaseCleaningLock(function (success) {
      assert(success === true, "Cleaner releases lock.");
    });

    testShard.heartbeatTable.readAll(function (rows) {
      assertEqual(rows.length, 0);
    });
    assert(!cleaner.hasCleaningLock());
  });
});