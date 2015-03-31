var testUtils = require('../util/testUtils');
var assert = testUtils.assert;
var assertEqual = testUtils.assertEqual;
var assertOwnProperty = testUtils.assertOwnProperty;
var netsimTestUtils = require('../util/netsimTestUtils');
var fakeShard = netsimTestUtils.fakeShard;
var assertTableSize = netsimTestUtils.assertTableSize;

var NetSimMessage = testUtils.requireWithGlobalsCheckBuildFolder('netsim/NetSimMessage');
var NetSimEntity = testUtils.requireWithGlobalsCheckBuildFolder('netsim/NetSimEntity');

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

  it ("has expected row structure and default values", function () {
    var message = new NetSimMessage(testShard);
    var row = message.buildRow_();

    assertOwnProperty(row, 'fromNodeID');
    assertEqual(row.fromNodeID, undefined);

    assertOwnProperty(row, 'toNodeID');
    assertEqual(row.toNodeID, undefined);

    assertOwnProperty(row, 'simulatedBy');
    assertEqual(row.simulatedBy, undefined);

    assertOwnProperty(row, 'payload');
    assertEqual(row.payload, undefined);
  });

  describe("static method send", function () {
    it ("adds an entry to the message table", function () {
      messageTable.readAll(function (err, rows) {
        assert(rows.length === 0, "Table is empty");
      });

      NetSimMessage.send(testShard, null, null, null, null, function () {});

      messageTable.readAll(function (err, rows) {
        assert(rows.length === 1, "Table has one row");
      });
    });

    it ("Puts row values in remote table", function () {
      var fromNodeID = 1;
      var toNodeID = 2;
      var simulatedBy = 2;
      var payload = 'xyzzy';

      NetSimMessage.send(testShard, fromNodeID, toNodeID, simulatedBy, payload, function () {});

      messageTable.readAll(function (err, rows) {
        var row = rows[0];
        assertEqual(row.fromNodeID, fromNodeID);
        assertEqual(row.toNodeID, toNodeID);
        assertEqual(row.simulatedBy, simulatedBy);
        assertEqual(row.payload, payload);
      });
    });

    it ("Returns no error to its callback when successful", function () {
      NetSimMessage.send(testShard, null, null, null, null, function (err) {
        assert(err === null, "Error is null on success");
      });
    });
  });

  it ("can be instatiated from remote row", function () {
    var testRow;

    // Create a message row in remote table
    messageTable.create({
      fromNodeID: 1,
      toNodeID: 2,
      simulatedBy: 2,
      payload: 'xyzzy'
    }, function (err, row) {
      testRow = row;
    });
    assert(testRow !== undefined, "Failed to create test row");

    // Instantiate message
    var message = new NetSimMessage(testShard, testRow);
    assertEqual(message.fromNodeID, 1);
    assertEqual(message.toNodeID, 2);
    assertEqual(message.simulatedBy, 2);
    assertEqual(message.payload, 'xyzzy');
  });

  it ("can be removed from the remote table with destroy()", function () {
    var testRow;

    // Create a message row in remote table
    messageTable.create({}, function (err, row) {
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

  describe("destroyEntities on messages", function () {
    it ("deletes all messages passed to it", function () {
      NetSimMessage.send(testShard, 1, 2, 2, 'alpha', function () {});
      NetSimMessage.send(testShard, 1, 2, 2, 'beta', function () {});
      NetSimMessage.send(testShard, 1, 2, 2, 'gamma', function () {});
      assertTableSize(testShard, 'messageTable', 3);

      var messages;
      messageTable.readAll(function (err, rows) {
        messages = rows.map(function (row) {
          return new NetSimMessage(testShard, row);
        });
      });
      assertEqual(3, messages.length);
      assert(messages[0] instanceof NetSimMessage);

      NetSimEntity.destroyEntities(messages, function () {});
      assertTableSize(testShard, 'messageTable', 0);
    });
  });

});
