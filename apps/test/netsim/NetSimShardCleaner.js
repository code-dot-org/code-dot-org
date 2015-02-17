var testUtils = require('../util/testUtils');
var assert = testUtils.assert;
var assertEqual = testUtils.assertEqual;
var assertWithinRange = testUtils.assertWithinRange;
var assertOwnProperty = testUtils.assertOwnProperty;
var netsimTestUtils = require('../util/netsimTestUtils');
var fauxShard = netsimTestUtils.fauxShard;
var assertTableSize = netsimTestUtils.assertTableSize;

var NetSimShardCleaner = testUtils.requireWithGlobalsCheckBuildFolder('netsim/NetSimShardCleaner');
var NetSimLogger = testUtils.requireWithGlobalsCheckBuildFolder('netsim/NetSimLogger');

var makeNode = function (shard) {
  var newNodeID;
  shard.nodeTable.create({}, function (node) {
    newNodeID = node.id;
  });
  return newNodeID;
};

var makeHeartbeat = function (shard, nodeID) {
  shard.heartbeatTable.create({
    nodeID: nodeID,
    time: Date.now()
  }, function () {});
};

var makeExpiredHeartbeat = function (shard, nodeID) {
  shard.heartbeatTable.create({
    nodeID: nodeID,
    time: Date.now() - 30001
  }, function () {});
};

var makeNodeWithHeartbeat = function (shard) {
  var newNodeID = makeNode(shard);
  makeHeartbeat(shard, newNodeID);
  return newNodeID;
};

var makeNodeWithExpiredHeartbeat = function (shard) {
  var newNodeID = makeNode(shard);
  makeExpiredHeartbeat(shard, newNodeID);
  return newNodeID;
};

describe("NetSimShardCleaner", function () {
  var testShard, cleaner;

  beforeEach(function () {
    NetSimLogger.getSingleton().setVerbosity(NetSimLogger.LogLevel.NONE);
    testShard = fauxShard();
    cleaner = new NetSimShardCleaner(testShard);
  });

  it ("makes a cleaning attempt on its first tick", function () {
    assertWithinRange(cleaner.nextAttemptTime_, Date.now(), 10);
    cleaner.tick({});
    assert(cleaner.nextAttemptTime_ > Date.now(), "Next attempt pushed into future");
  });

  it ("gets Cleaning Lock by putting a special row in the heartbeat table", function () {
    assertTableSize(testShard, 'heartbeatTable', 0);
    cleaner.getCleaningLock(function (success) {
      assert(success === true, "Callback takes a boolean success value");
    });
    assertTableSize(testShard, 'heartbeatTable', 1);
    testShard.heartbeatTable.readAll(function (rows) {
      assertOwnProperty(rows[0], 'cleaner');
    });
  });

  it ("fails to get Cleaning Lock if one already exists", function () {
    cleaner.getCleaningLock(function (success) {
      assert(success === true, "First cleaner gets lock.");
    });

    assertTableSize(testShard, 'heartbeatTable', 1);
    assert(cleaner.hasCleaningLock());

    var cleaner2 = new NetSimShardCleaner(testShard);
    cleaner2.getCleaningLock(function (success) {
      assert(success === false, "Second cleaner fails to get lock.");
    });

    // Make sure clean-up of second lock happens
    assertTableSize(testShard, 'heartbeatTable', 1);
    assert(!cleaner2.hasCleaningLock());
  });

  it ("ignores cleaning locks older than 15 seconds", function () {
    testShard.heartbeatTable.create({
      nodeID: 0,
      time: Date.now() - 15001,
      cleaner: true
    }, function () {});

    assertTableSize(testShard, 'heartbeatTable', 1);

    cleaner.getCleaningLock(function (success) {
      assert(success === true, "Cleaner gets cleaning lock");
    });

    assertTableSize(testShard, 'heartbeatTable', 2);
  });

  it ("can release cleaning lock", function () {
    cleaner.getCleaningLock(function (success) {
      assert(success === true, "Cleaner gets lock.");
    });

    assertTableSize(testShard, 'heartbeatTable', 1);
    assert(cleaner.hasCleaningLock());

    cleaner.releaseCleaningLock(function (success) {
      assert(success === true, "Cleaner releases lock.");
    });

    assertTableSize(testShard, 'heartbeatTable', 0);
    assert(!cleaner.hasCleaningLock());
  });

  it ("deletes heartbeats older than 30 seconds", function () {
    makeHeartbeat(testShard, 'valid');
    makeExpiredHeartbeat(testShard, 'invalid');

    assertTableSize(testShard, 'heartbeatTable', 2);

    cleaner.tick(); // First tick triggers cleaning and starts it
    cleaner.tick(); // Second tick runs sub-CommandSequence that removes rows

    assertTableSize(testShard, 'heartbeatTable', 1);
    testShard.heartbeatTable.readAll(function (rows) {
      assertEqual(rows[0].nodeID, 'valid');
    });
  });

  it ("deletes nodes that lack a heartbeat", function () {
    var validNodeID = makeNodeWithHeartbeat(testShard);
    var invalidNodeID = makeNode(testShard);

    assertTableSize(testShard, 'nodeTable', 2);
    assertTableSize(testShard, 'heartbeatTable', 1);

    cleaner.tick(); // First tick triggers cleaning and starts it
    cleaner.tick(); // Second tick runs node cleanup

    assertTableSize(testShard, 'nodeTable', 1);
    assertTableSize(testShard, 'heartbeatTable', 1);
    testShard.nodeTable.readAll(function (rows) {
      assertEqual(rows[0].id, validNodeID);
    });
  });

  it ("deletes nodes that have an expired heartbeat", function () {
    var validNodeID = makeNodeWithHeartbeat(testShard);
    var invalidNodeID = makeNodeWithExpiredHeartbeat(testShard);

    assertTableSize(testShard, 'nodeTable', 2);
    assertTableSize(testShard, 'heartbeatTable', 2);

    cleaner.tick(); // First tick triggers cleaning and starts it
    cleaner.tick(); // Second tick runs heartbeat cleanup
    cleaner.tick(); // Third tick runs node cleanup

    assertTableSize(testShard, 'nodeTable', 1);
    assertTableSize(testShard, 'heartbeatTable', 1);
    testShard.nodeTable.readAll(function (rows) {
      assertEqual(rows[0].id, validNodeID);
    });
  });

  it ("deletes wires that reference bad nodes", function () {
    var validNodeID = makeNodeWithHeartbeat(testShard);
    var invalidNodeID = makeNodeWithExpiredHeartbeat(testShard);

    // Loopback is okay
    testShard.wireTable.create({
      localNodeID: validNodeID,
      remoteNodeID: validNodeID
    }, function () {});

    testShard.wireTable.create({
      localNodeID: invalidNodeID,
      remoteNodeID: validNodeID
    }, function () {});


    assertTableSize(testShard, 'heartbeatTable', 2);
    assertTableSize(testShard, 'nodeTable', 2);
    assertTableSize(testShard, 'wireTable', 2);

    cleaner.tick(); // First tick triggers cleaning and starts it
    cleaner.tick(); // Second tick runs heartbeat cleanup
    cleaner.tick(); // Third tick runs node cleanup
    cleaner.tick(); // Fourth tick runs wire cleanup

    assertTableSize(testShard, 'heartbeatTable', 1);
    assertTableSize(testShard, 'nodeTable', 1);
    assertTableSize(testShard, 'wireTable', 1);
    testShard.wireTable.readAll(function (rows) {
      assertEqual(rows[0].localNodeID, validNodeID);
    });
  });

  it ("deletes messages destined for bad nodes", function () {
    var validNodeID = makeNodeWithHeartbeat(testShard);
    var invalidNodeID = makeNodeWithExpiredHeartbeat(testShard);

    testShard.messageTable.create({
      toNodeID: validNodeID
    }, function () {});

    testShard.messageTable.create({
      toNodeID: invalidNodeID
    }, function () {});

    assertTableSize(testShard, 'heartbeatTable', 2);
    assertTableSize(testShard, 'nodeTable', 2);
    assertTableSize(testShard, 'messageTable', 2);

    cleaner.tick(); // First tick triggers cleaning and starts it
    cleaner.tick(); // Second tick runs heartbeat cleanup
    cleaner.tick(); // Third tick runs node cleanup
    cleaner.tick(); // Fourth tick runs message cleanup

    assertTableSize(testShard, 'heartbeatTable', 1);
    assertTableSize(testShard, 'nodeTable', 1);
    assertTableSize(testShard, 'messageTable', 1);
    testShard.messageTable.readAll(function (rows) {
      assertEqual(rows[0].toNodeID, validNodeID);
    });
  });

  it ("deletes logs associated with bad nodes", function () {
    var validNodeID = makeNodeWithHeartbeat(testShard);
    var invalidNodeID = makeNode(testShard);

    testShard.logTable.create({
      nodeID: validNodeID
    }, function () {});
    testShard.logTable.create({
      nodeID: invalidNodeID
    }, function () {});

    assertTableSize(testShard, 'nodeTable', 2);
    assertTableSize(testShard, 'logTable', 2);

    cleaner.tick(); // First tick triggers cleaning and starts it
    cleaner.tick(); // Second tick triggers node cleanup
    cleaner.tick(); // Third tick triggers log cleanup

    assertTableSize(testShard, 'nodeTable', 1);
    assertTableSize(testShard, 'logTable', 1);
    testShard.logTable.readAll(function (rows) {
      assertEqual(rows[0].nodeID, validNodeID);
    });
  });
});
