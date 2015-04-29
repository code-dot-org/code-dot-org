var testUtils = require('../util/testUtils');
var assert = testUtils.assert;
var assertEqual = testUtils.assertEqual;
var assertWithinRange = testUtils.assertWithinRange;
var assertOwnProperty = testUtils.assertOwnProperty;
var netsimTestUtils = require('../util/netsimTestUtils');
var fakeShard = netsimTestUtils.fakeShard;
var assertTableSize = netsimTestUtils.assertTableSize;

var NetSimShardCleaner = testUtils.requireWithGlobalsCheckBuildFolder('netsim/NetSimShardCleaner');
var NetSimLogger = testUtils.requireWithGlobalsCheckBuildFolder('netsim/NetSimLogger');
var NodeType = testUtils.requireWithGlobalsCheckBuildFolder('netsim/netsimConstants').NodeType;

var makeNode = function (shard) {
  var newNodeID;
  shard.nodeTable.create({}, function (err, node) {
    newNodeID = node.id;
  });
  return newNodeID;
};

var makeRouter = function (shard) {
  var newNodeID;
  shard.nodeTable.create({
    type: NodeType.ROUTER
  }, function (err, node) {
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
    time: Date.now() - 60001
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

var makeRouterWithHeartbeat = function (shard) {
  var newNodeID = makeRouter(shard);
  makeHeartbeat(shard, newNodeID);
  return newNodeID;
};

describe("NetSimShardCleaner", function () {
  var testShard, cleaner;

  beforeEach(function () {
    NetSimLogger.getSingleton().setVerbosity(NetSimLogger.LogLevel.NONE);
    testShard = fakeShard();
    cleaner = new NetSimShardCleaner(testShard, 0);
  });

  it ("makes a cleaning attempt on its first tick", function () {
    assertWithinRange(cleaner.nextAttemptTime_, Date.now(), 10);
    cleaner.tick({});
    assert(cleaner.nextAttemptTime_ > Date.now(), "Next attempt pushed into future");
  });

  it ("gets Cleaning Lock by putting a special row in the heartbeat table", function () {
    assertTableSize(testShard, 'heartbeatTable', 0);
    cleaner.getCleaningLock(function (err) {
      assert(err === null, "Callback gets null error on success");
    });
    assertTableSize(testShard, 'heartbeatTable', 1);
    testShard.heartbeatTable.readAll(function (err, rows) {
      assertOwnProperty(rows[0], 'cleaner');
    });
  });

  it ("fails to get Cleaning Lock if one already exists", function () {
    cleaner.getCleaningLock(function (err) {
      assert(err === null, "First cleaner gets lock.");
    });

    assertTableSize(testShard, 'heartbeatTable', 1);
    assert(cleaner.hasCleaningLock());

    var cleaner2 = new NetSimShardCleaner(testShard, 0);
    cleaner2.getCleaningLock(function (err, success) {
      assert(err !== null, "Second cleaner fails to get lock.");
    });

    // Make sure clean-up of second lock happens
    assertTableSize(testShard, 'heartbeatTable', 1);
    assert(!cleaner2.hasCleaningLock());
  });

  it ("ignores cleaning locks older than 60 seconds", function () {
    testShard.heartbeatTable.create({
      nodeID: 0,
      time: Date.now() - 60001,
      cleaner: true
    }, function () {});

    assertTableSize(testShard, 'heartbeatTable', 1);

    cleaner.getCleaningLock(function (err) {
      assert(err === null, "Cleaner gets cleaning lock");
    });

    assertTableSize(testShard, 'heartbeatTable', 2);
  });

  it ("can release cleaning lock", function () {
    cleaner.getCleaningLock(function (err) {
      assert(err === null, "Cleaner gets lock.");
    });

    assertTableSize(testShard, 'heartbeatTable', 1);
    assert(cleaner.hasCleaningLock());

    cleaner.releaseCleaningLock(function (err) {
      assert(err === null, "Cleaner releases lock.");
    });

    assertTableSize(testShard, 'heartbeatTable', 0);
    assert(!cleaner.hasCleaningLock());
  });

  it ("deletes heartbeats older than 60 seconds", function () {
    makeHeartbeat(testShard, 'valid');
    makeExpiredHeartbeat(testShard, 'invalid');

    assertTableSize(testShard, 'heartbeatTable', 2);

    cleaner.tick(); // First tick triggers cleaning and starts it
    cleaner.tick(); // Second tick runs sub-CommandSequence that removes rows

    assertTableSize(testShard, 'heartbeatTable', 1);
    testShard.heartbeatTable.readAll(function (err, rows) {
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
    testShard.nodeTable.readAll(function (err, rows) {
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
    testShard.nodeTable.readAll(function (err, rows) {
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
    testShard.wireTable.readAll(function (err, rows) {
      assertEqual(rows[0].localNodeID, validNodeID);
    });
  });

  it ("deletes messages destined for bad nodes", function () {
    var validNodeID = makeNodeWithHeartbeat(testShard);
    var invalidNodeID = makeNodeWithExpiredHeartbeat(testShard);

    testShard.messageTable.create({
      toNodeID: validNodeID,
      fromNodeID: invalidNodeID,
      simulatedBy: validNodeID
    }, function () {});

    testShard.messageTable.create({
      toNodeID: invalidNodeID,
      fromNodeID: validNodeID,
      simulatedBy: validNodeID
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
    testShard.messageTable.readAll(function (err, rows) {
      assertEqual(rows[0].toNodeID, validNodeID);
    });
  });

  it ("deletes messages that don't have a valid simulating client node", function () {
    var validNodeID = makeNodeWithHeartbeat(testShard);
    var invalidNodeID = makeNodeWithExpiredHeartbeat(testShard);
    var routerID = makeRouterWithHeartbeat(testShard);

    testShard.messageTable.create({
      toNodeID: routerID,
      fromNodeID: validNodeID,
      simulatedBy: validNodeID
    }, function () {});

    testShard.messageTable.create({
      toNodeID: routerID,
      fromNodeID: invalidNodeID,
      simulatedBy: invalidNodeID
    }, function () {});

    assertTableSize(testShard, 'heartbeatTable', 3);
    assertTableSize(testShard, 'nodeTable', 3);
    assertTableSize(testShard, 'messageTable', 2);

    cleaner.tick(); // First tick triggers cleaning and starts it
    cleaner.tick(); // Second tick runs heartbeat cleanup
    cleaner.tick(); // Third tick runs node cleanup
    cleaner.tick(); // Fourth tick runs message cleanup

    assertTableSize(testShard, 'heartbeatTable', 2);
    assertTableSize(testShard, 'nodeTable', 2);
    assertTableSize(testShard, 'messageTable', 1);
    testShard.messageTable.readAll(function (err, rows) {
      assertEqual(rows[0].toNodeID, routerID);
      assertEqual(rows[0].fromNodeID, validNodeID);
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
    testShard.logTable.readAll(function (err, rows) {
      assertEqual(rows[0].nodeID, validNodeID);
    });
  });
});
