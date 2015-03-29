var testUtils = require('../util/testUtils');
var assert = testUtils.assert;
var assertEqual = testUtils.assertEqual;
var assertWithinRange = testUtils.assertWithinRange;
var assertOwnProperty = testUtils.assertOwnProperty;
var netsimTestUtils = require('../util/netsimTestUtils');
var fakeShard = netsimTestUtils.fakeShard;
var assertTableSize = netsimTestUtils.assertTableSize;

var NetSimHeartbeat = testUtils.requireWithGlobalsCheckBuildFolder('netsim/NetSimHeartbeat');

describe("NetSimHeartbeat", function () {
  var testShard;

  beforeEach(function () {
    testShard = fakeShard();
  });

  it ("has expected row structure and default values", function () {
    var heartbeat = new NetSimHeartbeat(testShard);
    var row = heartbeat.buildRow_();

    assertOwnProperty(row, 'nodeID');
    assertEqual(row.fromNodeID, undefined);

    assertOwnProperty(row, 'time');
    assertWithinRange(row.time, Date.now(), 10);
  });

  it ("Implements getTable_ pointing to the heartbeat table", function () {
    var heartbeat = new NetSimHeartbeat(testShard, undefined);
    assert(heartbeat.getTable_() === testShard.heartbeatTable);
  });

  describe("static method getOrCreate", function () {

    it ("creates when no record is present with " +
    "given node ID", function () {
      var myNodeID, heartbeat;
      myNodeID = 1;
      NetSimHeartbeat.getOrCreate(testShard, myNodeID, function (err, newHeartbeat) {
        heartbeat = newHeartbeat;
      });
      assert(heartbeat, "Created a heartbeat");
      assertEqual(heartbeat.nodeID, myNodeID);
    });

    it ("retrieves existing record when one already exists with the given ID", function () {
      var myNodeID, originalHeartbeat, retrievedHeartbeat;
      myNodeID = 1;

      // Make the heartbeat in the first place.
      NetSimHeartbeat.getOrCreate(testShard, myNodeID, function (e, h) {
        originalHeartbeat = h;
      });
      assert(originalHeartbeat, "Created a heartbeat");

      // Same operation with same Node ID, should get existing row.
      NetSimHeartbeat.getOrCreate(testShard, myNodeID, function (e, h) {
        retrievedHeartbeat = h;
      });
      assertEqual(originalHeartbeat, retrievedHeartbeat);
    });

  });

  it ("update changes remote heartbeat time to its time_", function () {
    var myNodeID, originalHeartbeat, originalTime, retrievedHeartbeat,
        retrievedTime;
    myNodeID = 1;

    // Make original heartbeat (remotely)
    testShard.remoteHeartbeatTable.create({
      nodeID: myNodeID,
      time: 42
    }, function () {});

    // Retrieve heartbeat from table
    NetSimHeartbeat.getOrCreate(testShard, myNodeID, function (e, h) {
      originalHeartbeat = h;
    });
    assertEqual(originalHeartbeat.time_, 42);

    originalHeartbeat.time_ = 84;
    testShard.remoteHeartbeatTable.log('');
    originalHeartbeat.update();
    assertEqual("update", testShard.remoteHeartbeatTable.log().slice(0, 6));

    var remoteRow;
    testShard.heartbeatTable.readAll(function (err, rows) {
      remoteRow = rows[0];
    });
    assertEqual(84, remoteRow.time);

  });

  it ("updates every 6 seconds if ticked, setting local and remote " +
      "time to Date.now()", function () {
    var myNodeID, originalHeartbeat;
    myNodeID = 1;

    // Make original heartbeat
    NetSimHeartbeat.getOrCreate(testShard, myNodeID, function (e, h) {
      originalHeartbeat = h;
    });
    assert(originalHeartbeat, "Created a heartbeat");
    assertEqual("readAllcreate", testShard.remoteHeartbeatTable.log().slice(0, 13));

    // Tick immediately does nothing
    testShard.remoteHeartbeatTable.log('');
    originalHeartbeat.time_ = Date.now() - 1000; // Not enough!
    originalHeartbeat.tick();
    assertEqual("", testShard.remoteHeartbeatTable.log().slice(0, 13));

    // Tick after 6 seconds updates retrieved time
    var sixSecondsAgo = Date.now() - 6001;
    originalHeartbeat.time_ = sixSecondsAgo;
    testShard.remoteHeartbeatTable.log('');
    originalHeartbeat.tick();
    assertEqual("update", testShard.remoteHeartbeatTable.log().slice(0, 6));
    assertWithinRange(Date.now(), originalHeartbeat.time_, 10);
  });

  it ("can be removed from the remote table with destroy()", function () {
    var myNodeID, heartbeat;
    myNodeID = 1;

    // Make heartbeat
    NetSimHeartbeat.getOrCreate(testShard, myNodeID, function (e, h) {
      heartbeat = h;
    });
    assert(heartbeat, "Created a heartbeat");

    // Check that table is not empty
    assertTableSize(testShard, 'heartbeatTable', 1);

    // Destory heartbeat
    testShard.remoteHeartbeatTable.log('');
    heartbeat.destroy();
    assert("destroy", testShard.remoteHeartbeatTable.log().slice(0, 7));

    // Check that table is empty
    assertTableSize(testShard, 'heartbeatTable', 0);
  });

});
