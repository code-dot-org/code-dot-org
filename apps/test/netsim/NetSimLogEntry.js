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
  
    it ("logText (default empty string)", function () {
      assertOwnProperty(row, 'logText');
      assertEqual(row.logText, '');
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
      logText: 'Non-default log text',
      timestamp: 52000
    };
    var logEntry = new NetSimLogEntry(testShard, row);

    assertEqual(logEntry.entityID, 1);
    assertEqual(logEntry.nodeID, 42);
    assertEqual(logEntry.logText, 'Non-default log text');
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
      var logText = 'xyzzy';

      NetSimLogEntry.create(testShard, nodeID, logText, function () {});

      testShard.logTable.readAll(function (rows) {
        var row = rows[0];
        assertEqual(row.nodeID, nodeID);
        assertEqual(row.logText, logText);
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
    testShard.logTable.create({}, function (row) {
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

});
