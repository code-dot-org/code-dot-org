'use strict';
/* global describe, beforeEach, it */

var testUtils = require('../util/testUtils');
var DataConverters = require('@cdo/apps/netsim/DataConverters');
var NetSimLogEntry = require('@cdo/apps/netsim/NetSimLogEntry');
var NetSimGlobals = require('@cdo/apps/netsim/NetSimGlobals');
var NetSimTestUtils = require('../util/netsimTestUtils');
var Packet = require('@cdo/apps/netsim/Packet');

var assert = testUtils.assert;
var assertTableSize = NetSimTestUtils.assertTableSize;
var base64ToBinary = DataConverters.base64ToBinary;
var binaryToBase64 = DataConverters.binaryToBase64;
var fakeShard = NetSimTestUtils.fakeShard;

describe("NetSimLogEntry", function () {
  var testShard;

  beforeEach(function () {
    NetSimTestUtils.initializeGlobalsToDefaultValues();
    testShard = fakeShard();
  });

  it("uses the logEntry table", function () {
    var logEntry = new NetSimLogEntry(testShard);
    assert.strictEqual(logEntry.getTable(), testShard.logTable, "Using wrong table");
  });

  it("has expected row structure and default values", function () {
    var logEntry = new NetSimLogEntry(testShard);
    var row = logEntry.buildRow();

    assert(row.hasOwnProperty('nodeID'));
    assert.isUndefined(row.nodeID);

    assert.property(row, 'base64Binary');
    assert.property(row.base64Binary, 'string');
    assert.strictEqual(row.base64Binary.string, '');
    assert.property(row.base64Binary, 'len');
    assert.strictEqual(row.base64Binary.len, 0);

    assert.property(row, 'status');
    assert.equal(row.status, NetSimLogEntry.LogStatus.SUCCESS);

    assert.property(row, 'timestamp');
    assert.closeTo(row.timestamp, Date.now(), 10);
  });

  it("initializes from row", function () {
    var row = {
      id: 1,
      nodeID: 42,
      base64Binary: {
        string: "kg==",
        len: 7
      },
      status: NetSimLogEntry.LogStatus.DROPPED,
      timestamp: 52000
    };
    var logEntry = new NetSimLogEntry(testShard, row);

    assert.equal(logEntry.entityID, 1);
    assert.equal(logEntry.nodeID, 42);
    assert.equal(logEntry.binary, '1001001');
    assert.equal(logEntry.status, NetSimLogEntry.LogStatus.DROPPED);
    assert.equal(logEntry.timestamp, 52000);
  });

  it("gracefully converts a malformed base64Payload to empty string", function () {
    var logEntry = new NetSimLogEntry(testShard, {
      base64Binary: {
        string: "totally not a base64 string",
        len: 7
      },
    });
    assert.equal(logEntry.binary, '');
  });

  describe("static method create", function () {
    it("adds an entry to the log table", function () {
      assertTableSize(testShard, 'logTable', 0);

      NetSimLogEntry.create(testShard, null, '10100101', null, function () {});

      assertTableSize(testShard, 'logTable', 1);
    });

    it("Puts row values in remote table", function () {
      var nodeID = 1;
      var binary = '1001010100101';
      var status = NetSimLogEntry.LogStatus.SUCCESS;

      NetSimLogEntry.create(testShard, nodeID, binary, status, function () {});

      testShard.logTable.refresh(function (err, rows) {
        var row = rows[0];
        var rowBinary = base64ToBinary(row.base64Binary.string, row.base64Binary.len);
        assert.equal(row.nodeID, nodeID);
        assert.equal(rowBinary, binary);
        assert.equal(row.status, status);
        assert.closeTo(row.timestamp, Date.now(), 10);
      });
    });

    it("Returns log and no error on success", function () {
      NetSimLogEntry.create(testShard, null, '10101010', null, function (err, result) {
        assert.isNull(err, "Error is null on success");
        assert.instanceOf(result, NetSimLogEntry, "Result is a NetSimLogEntry");
      });
    });
  });

  it("can be removed from the remote table with destroy()", function () {
    var testRow;

    // Create a logEntry row in remote table
    testShard.logTable.create({}, function (err, row) {
      testRow = row;
    });
    assert.isDefined(testRow, "Failed to create test row");
    assertTableSize(testShard, 'logTable', 1);

    // Call destroy()
    var logEntry = new NetSimLogEntry(testShard, testRow);
    logEntry.destroy();

    // Verify that logEntry is gone from the remote table.
    assertTableSize(testShard, 'logTable', 0);
  });

  it("can extract binary data based on standard format", function () {
    NetSimGlobals.getLevelConfig().addressFormat = '4';
    NetSimGlobals.getLevelConfig().packetCountBitWidth = 4;
    var logEntry = new NetSimLogEntry(null, {
      base64Binary: binaryToBase64('000100100011010001010110')
    }, [
      Packet.HeaderType.TO_ADDRESS,
      Packet.HeaderType.FROM_ADDRESS,
      Packet.HeaderType.PACKET_INDEX,
      Packet.HeaderType.PACKET_COUNT
    ]);
    assert.equal('1', logEntry.getHeaderField(Packet.HeaderType.TO_ADDRESS));
    assert.equal('2', logEntry.getHeaderField(Packet.HeaderType.FROM_ADDRESS));
    assert.equal('3', logEntry.getHeaderField(Packet.HeaderType.PACKET_INDEX));
    assert.equal('4', logEntry.getHeaderField(Packet.HeaderType.PACKET_COUNT));
    assert.equal('01010110', logEntry.getMessageBinary());
  });

});
