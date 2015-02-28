var testUtils = require('../util/testUtils');
var assert = testUtils.assert;
var assertEqual = testUtils.assertEqual;
var assertWithinRange = testUtils.assertWithinRange;
var assertOwnProperty = testUtils.assertOwnProperty;
var netsimTestUtils = require('../util/netsimTestUtils');
var fakeShard = netsimTestUtils.fakeShard;
var assertTableSize = netsimTestUtils.assertTableSize;

var NetSimLogEntry = testUtils.requireWithGlobalsCheckBuildFolder('netsim/NetSimLogEntry');

describe("NetSimLogEntry", function () {
  var testShard;

  beforeEach(function () {
    testShard = fakeShard();
  });

  it ("uses the logEntry table", function () {
    var logEntry = new NetSimLogEntry(testShard);
    assert(logEntry.getTable_() === testShard.logTable, "Using wrong table");
  });
  
  describe("default row structure", function () {
    var row;
  
    beforeEach(function () {
      var logEntry = new NetSimLogEntry(testShard);
      row = logEntry.buildRow_();
    });
  
    it ("nodeID (default undefined)", function () {
      assertOwnProperty(row, 'nodeID');
      assertEqual(row.nodeID, undefined);
    });
  
    it ("packet (default empty string)", function () {
      assertOwnProperty(row, 'packet');
      assertEqual(row.packet, '');
    });

    it ("timestamp (default Date.now())", function () {
      assertOwnProperty(row, 'timestamp');
      assertWithinRange(row.timestamp, Date.now(), 10);
    });
  });

  it ("initializes from row", function () {
    var row = {
      id: 1,
      nodeID: 42,
      packet: 'Non-default log text',
      timestamp: 52000
    };
    var logEntry = new NetSimLogEntry(testShard, row);

    assertEqual(logEntry.entityID, 1);
    assertEqual(logEntry.nodeID, 42);
    assertEqual(logEntry.packet, 'Non-default log text');
    assertEqual(logEntry.timestamp, 52000);
  });

  describe("static method create", function () {
    it ("adds an entry to the log table", function () {
      assertTableSize(testShard, 'logTable', 0);

      NetSimLogEntry.create(testShard, null, null, function () {});

      assertTableSize(testShard, 'logTable', 1);
    });

    it ("Puts row values in remote table", function () {
      var nodeID = 1;
      var packet = 'xyzzy';

      NetSimLogEntry.create(testShard, nodeID, packet, function () {});

      testShard.logTable.readAll(function (err, rows) {
        var row = rows[0];
        assertEqual(row.nodeID, nodeID);
        assertEqual(row.packet, packet);
        assertWithinRange(row.timestamp, Date.now(), 10);
      });
    });

    it ("Returns a success boolean to its callback", function () {
      NetSimLogEntry.create(testShard, null, null, function (result) {
        assert(result === true, "Result is boolean true");
      });
    });
  });

  it ("can be removed from the remote table with destroy()", function () {
    var testRow;

    // Create a logEntry row in remote table
    testShard.logTable.create({}, function (err, row) {
      testRow = row;
    });
    assert(testRow !== undefined, "Failed to create test row");
    assertTableSize(testShard, 'logTable', 1);

    // Call destroy()
    var logEntry = new NetSimLogEntry(testShard, testRow);
    logEntry.destroy();

    // Verify that logEntry is gone from the remote table.
    assertTableSize(testShard, 'logTable', 0);
  });

  it ("can extract packet data based on standard format", function () {
    var logEntry = new NetSimLogEntry(null, {
      packet: '000100100011010001010110'
    });
    assertEqual(1, logEntry.getToAddress());
    assertEqual(2, logEntry.getFromAddress());
    assertEqual(3, logEntry.getPacketIndex());
    assertEqual(4, logEntry.getPacketCount());
    assertEqual('01010110', logEntry.getMessageBinary());
  });

});
