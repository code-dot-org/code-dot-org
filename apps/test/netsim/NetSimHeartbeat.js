var testUtils = require('../util/testUtils');
var assert = testUtils.assert;
var assertEqual = testUtils.assertEqual;
var assertOwnProperty = testUtils.assertOwnProperty;
var netsimTestUtils = require('../util/netsimTestUtils');
var fauxShard = netsimTestUtils.fauxShard;

var NetSimHeartbeat = testUtils.requireWithGlobalsCheckBuildFolder('netsim/NetSimHeartbeat');

describe("NetSimHeartbeat", function () {
  var testShard;

  beforeEach(function () {
    testShard = fauxShard();
  });

  describe("default row structure", function () {
    var row;

    beforeEach(function () {
      var heartbeat = new NetSimHeartbeat(testShard);
      row = heartbeat.buildRow_();
    });

    it ("nodeID (default undefined)", function () {
      assertOwnProperty(row, 'nodeID');
      assertEqual(row.fromNodeID, undefined);
    });

    it ("time (default 0)", function () {
      assertOwnProperty(row, 'time');
      assertEqual(row.time, 0);
    });
  });

  it ("Implements getTable_ pointing to the heartbeat table", function () {
    var heartbeat = new NetSimHeartbeat(testShard, undefined);
    assert(heartbeat.getTable_() === testShard.heartbeatTable);
  });

  it ("buildRow_ method includes needed fields", function () {
    var entity = new NetSimHeartbeat(testShard, undefined);
    var row = entity.buildRow_();
    assert(row.hasOwnProperty('nodeID'), "Row has no nodeID field");
    assert(row.hasOwnProperty('time'), "Row has no time field");
  });

  describe("static method getOrCreate", function () {

    it ("creates when no record is present with " +
    "given node ID", function () {
      var myNodeID, heartbeat;
      myNodeID = 1;
      NetSimHeartbeat.getOrCreate(testShard, myNodeID, function (newHeartbeat) {
        heartbeat = newHeartbeat;
      });
      assert(heartbeat, "Created a heartbeat");
      assertEqual(heartbeat.nodeID, myNodeID);
    });

    it ("retrieves existing record when one already exists with the given ID", function () {
      var myNodeID, originalHeartbeat, retrievedHeartbeat;
      myNodeID = 1;

      // Make the heartbeat in the first place.
      NetSimHeartbeat.getOrCreate(testShard, myNodeID, function (h) {
        originalHeartbeat = h;
      });
      assert(originalHeartbeat, "Created a heartbeat");

      // Same operation with same Node ID, should get existing row.
      NetSimHeartbeat.getOrCreate(testShard, myNodeID, function (h) {
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
    testShard.heartbeatTable.create({
      nodeID: myNodeID,
      time: 42
    }, function () {});

    // Retrieve heartbeat from table
    NetSimHeartbeat.getOrCreate(testShard, myNodeID, function (h) {
      originalHeartbeat = h;
    });
    assertEqual(originalHeartbeat.time_, 42);

    originalHeartbeat.time_ = 84;
    testShard.heartbeatTable.log('');
    originalHeartbeat.update();
    assertEqual("update", testShard.heartbeatTable.log().slice(0, 6));

    var remoteRow;
    testShard.heartbeatTable.readAll(function (rows) {
      remoteRow = rows[0];
    });
    assertEqual(84, remoteRow.time);

  });

  it ("updates every 5 seconds if ticked, setting local and remote " +
      "time to Date.now()", function () {
    var myNodeID, originalHeartbeat;
    myNodeID = 1;

    // Make original heartbeat
    NetSimHeartbeat.getOrCreate(testShard, myNodeID, function (h) {
      originalHeartbeat = h;
    });
    assert(originalHeartbeat, "Created a heartbeat");
    assertEqual("readAllcreate", testShard.heartbeatTable.log().slice(0, 13));

    // Tick immediately does nothing
    testShard.heartbeatTable.log('');
    originalHeartbeat.time_ = Date.now() - 1000; // Not enough!
    originalHeartbeat.tick();
    assertEqual("", testShard.heartbeatTable.log().slice(0, 13));

    // Tick after 5 seconds updates retrieved time
    var fiveSecondsAgo = Date.now() - 5001;
    originalHeartbeat.time_ = fiveSecondsAgo;
    testShard.heartbeatTable.log('');
    originalHeartbeat.tick();
    assertEqual("update", testShard.heartbeatTable.log().slice(0, 6));
    assert(originalHeartbeat.time_ > fiveSecondsAgo, "Time has been updated");
  });

  it ("can be removed from the remote table with destroy()", function () {
    var myNodeID, heartbeat;
    myNodeID = 1;

    // Make heartbeat
    NetSimHeartbeat.getOrCreate(testShard, myNodeID, function (h) {
      heartbeat = h;
    });
    assert(heartbeat, "Created a heartbeat");

    // Check that table is not empty
    testShard.heartbeatTable.readAll(function (rows) {
      assertEqual(rows.length, 1);
    });

    // Destory heartbeat
    testShard.heartbeatTable.log('');
    heartbeat.destroy();
    assert("destroy", testShard.heartbeatTable.log().slice(0, 7));

    // Check that table is empty
    testShard.heartbeatTable.readAll(function (rows) {
      assertEqual(rows.length, 0);
    });
  });

});
