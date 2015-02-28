var testUtils = require('../util/testUtils');
var assert = testUtils.assert;
var assertEqual = testUtils.assertEqual;
var assertOwnProperty = testUtils.assertOwnProperty;
var netsimTestUtils = require('../util/netsimTestUtils');
var fakeShard = netsimTestUtils.fakeShard;

var NetSimMessage = testUtils.requireWithGlobalsCheckBuildFolder('netsim/NetSimMessage');

describe("NetSimMessage", function () {
  var testShard, messageTable;

  beforeEach(function () {
    testShard = fakeShard();
    messageTable = testShard.messageTable;
  });

  it ("uses the message table", function () {
    var message = new NetSimMessage(testShard);
    assert(message.getTable_() === testShard.messageTable);
  });

  describe("default row structure", function () {
    var row;

    beforeEach(function () {
      var message = new NetSimMessage(testShard);
      row = message.buildRow_();
    });

    it ("fromNodeID (default undefined)", function () {
      assertOwnProperty(row, 'fromNodeID');
      assertEqual(row.fromNodeID, undefined);
    });

    it ("toNodeID (default undefined)", function () {
      assertOwnProperty(row, 'toNodeID');
      assertEqual(row.toNodeID, undefined);
    });

    it ("payload (default undefined)", function () {
      assertOwnProperty(row, 'payload');
      assertEqual(row.payload, undefined);
    });
  });

  describe("static method send", function () {
    it ("adds an entry to the message table", function () {
      messageTable.readAll(function (err, rows) {
        assert(rows.length === 0, "Table is empty");
      });

      NetSimMessage.send(testShard, null, null, null, function () {});

      messageTable.readAll(function (err, rows) {
        assert(rows.length === 1, "Table has one row");
      });
    });

    it ("Puts row values in remote table", function () {
      var fromNodeID = 1;
      var toNodeID = 2;
      var payload = 'xyzzy';

      NetSimMessage.send(testShard, fromNodeID, toNodeID, payload, function () {});

      messageTable.readAll(function (err, rows) {
        var row = rows[0];
        assertEqual(row.fromNodeID, fromNodeID);
        assertEqual(row.toNodeID, toNodeID);
        assertEqual(row.payload, payload);
      });
    });

    it ("Returns a success boolean to its callback", function () {
      NetSimMessage.send(testShard, null, null, null, function (result) {
        assert(result === true, "Result is boolean true");
      });
    });
  });

  it ("can be instatiated from remote row", function () {
    var testRow;

    // Create a message row in remote table
    messageTable.create({
      fromNodeID: 1,
      toNodeID: 2,
      payload: 'xyzzy'
    }, function (row) {
      testRow = row;
    });
    assert(testRow !== undefined, "Failed to create test row");

    // Instantiate message
    var message = new NetSimMessage(testShard, testRow);
    assertEqual(message.fromNodeID, 1);
    assertEqual(message.toNodeID, 2);
    assertEqual(message.payload, 'xyzzy');
  });

  it ("can be removed from the remote table with destroy()", function () {
    var testRow;

    // Create a message row in remote table
    messageTable.create({}, function (row) {
      testRow = row;
    });
    assert(testRow !== undefined, "Failed to create test row");

    // Call destroy()
    var message = new NetSimMessage(testShard, testRow);
    message.destroy();

    // Verify that message is gone from the remote table.
    var rowCount = Infinity;
    messageTable.readAll(function (err, rows) {
      rowCount = rows.length;
    });
    assertEqual(rowCount, 0);
  });

});
