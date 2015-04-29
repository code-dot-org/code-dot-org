var testUtils = require('../util/testUtils');
var assert = testUtils.assert;
var assertEqual = testUtils.assertEqual;
var assertWithinRange = testUtils.assertWithinRange;
var assertOwnProperty = testUtils.assertOwnProperty;
var NetSimLogEntry = require('@cdo/apps/netsim/NetSimLogEntry');
var Packet = require('@cdo/apps/netsim/Packet');

var netsimTestUtils = require('../util/netsimTestUtils');
var fakeShard = netsimTestUtils.fakeShard;
var assertTableSize = netsimTestUtils.assertTableSize;

describe("NetSimLogEntry", function () {
  var testShard;

  beforeEach(function () {
    testShard = fakeShard();
  });

  it ("uses the logEntry table", function () {
    var logEntry = new NetSimLogEntry(testShard);
    assert(logEntry.getTable_() === testShard.logTable, "Using wrong table");
  });

  it ("has expected row structure and default values", function () {
    var logEntry = new NetSimLogEntry(testShard);
    var row = logEntry.buildRow_();

    assertOwnProperty(row, 'nodeID');
    assertEqual(row.nodeID, undefined);

    assertOwnProperty(row, 'binary');
    assertEqual(row.binary, '');

    assertOwnProperty(row, 'status');
    assertEqual(row.status, NetSimLogEntry.LogStatus.SUCCESS);

    assertOwnProperty(row, 'timestamp');
    assertWithinRange(row.timestamp, Date.now(), 10);
  });

  it ("initializes from row", function () {
    var row = {
      id: 1,
      nodeID: 42,
      binary: 'Non-default log text',
      status: NetSimLogEntry.LogStatus.DROPPED,
      timestamp: 52000
    };
    var logEntry = new NetSimLogEntry(testShard, row);

    assertEqual(logEntry.entityID, 1);
    assertEqual(logEntry.nodeID, 42);
    assertEqual(logEntry.binary, 'Non-default log text');
    assertEqual(logEntry.status, NetSimLogEntry.LogStatus.DROPPED);
    assertEqual(logEntry.timestamp, 52000);
  });

  describe("static method create", function () {
    it ("adds an entry to the log table", function () {
      assertTableSize(testShard, 'logTable', 0);

      NetSimLogEntry.create(testShard, null, null, null, function () {});

      assertTableSize(testShard, 'logTable', 1);
    });

    it ("Puts row values in remote table", function () {
      var nodeID = 1;
      var binary = 'xyzzy';
      var status = NetSimLogEntry.LogStatus.SUCCESS;

      NetSimLogEntry.create(testShard, nodeID, binary, status, function () {});

      testShard.logTable.readAll(function (err, rows) {
        var row = rows[0];
        assertEqual(row.nodeID, nodeID);
        assertEqual(row.binary, binary);
        assertEqual(row.status, status);
        assertWithinRange(row.timestamp, Date.now(), 10);
      });
    });

    it ("Returns log and no error on success", function () {
      NetSimLogEntry.create(testShard, null, null, null, function (err, result) {
        assert(err === null, "Error is null on success");
        assert(result instanceof NetSimLogEntry, "Result is a NetSimLogEntry");
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

  it ("can extract binary data based on standard format", function () {
    var logEntry = new NetSimLogEntry(null, {
      binary: '0001 0010 0011 0100 01010110'
    }, [
      { key: Packet.HeaderType.TO_ADDRESS, bits: 4 },
      { key: Packet.HeaderType.FROM_ADDRESS, bits: 4 },
      { key: Packet.HeaderType.PACKET_INDEX, bits: 4 },
      { key: Packet.HeaderType.PACKET_COUNT, bits: 4 }
    ]);
    assertEqual(1, logEntry.getHeaderField(Packet.HeaderType.TO_ADDRESS));
    assertEqual(2, logEntry.getHeaderField(Packet.HeaderType.FROM_ADDRESS));
    assertEqual(3, logEntry.getHeaderField(Packet.HeaderType.PACKET_INDEX));
    assertEqual(4, logEntry.getHeaderField(Packet.HeaderType.PACKET_COUNT));
    assertEqual('01010110', logEntry.getMessageBinary());
  });

});
