var testUtils = require('../util/testUtils');
var assert = testUtils.assert;
var assertEqual = testUtils.assertEqual;
var assertThrows = testUtils.assertThrows;
var assertOwnProperty = testUtils.assertOwnProperty;
var netsimTestUtils = require('../util/netsimTestUtils');
var fakeShard = netsimTestUtils.fakeShard;
var assertTableSize = netsimTestUtils.assertTableSize;

var NetSimMessage = require('@cdo/apps/netsim/NetSimMessage');
var NetSimEntity = require('@cdo/apps/netsim/NetSimEntity');

describe("NetSimMessage", function () {
  var testShard, messageTable;

  beforeEach(function () {
    testShard = fakeShard();
    messageTable = testShard.messageTable;
  });

  it ("uses the message table", function () {
    var message = new NetSimMessage(testShard);
    assert(message.getTable() === testShard.messageTable);
  });

  it ("has expected row structure and default values", function () {
    var message = new NetSimMessage(testShard);
    var row = message.buildRow();

    assertOwnProperty(row, 'fromNodeID');
    assertEqual(row.fromNodeID, undefined);

    assertOwnProperty(row, 'toNodeID');
    assertEqual(row.toNodeID, undefined);

    assertOwnProperty(row, 'simulatedBy');
    assertEqual(row.simulatedBy, undefined);

    assertOwnProperty(row, 'base64Payload');
    assertEqual(row.payload, undefined);

    assertOwnProperty(row, 'extraHopsRemaining');
    assertEqual(row.extraHopsRemaining, 0);

    assertOwnProperty(row, 'visitedNodeIDs');
    assertEqual(row.visitedNodeIDs, []);
  });

  it ("converts messageRow.base64Payload to local binary payload", function () {
    var message = new NetSimMessage(testShard, {
      fromNodeID: 1,
      toNodeID: 2,
      simulatedBy: 2,
      base64Payload: {
        string: "kg==",
        len: 7
      },
      extraHopsRemaining: 3,
      visitedNodeIDs: [4]
    });
    assertEqual(message.payload, "1001001");
  });

  it ("converts local binary payload to base64 before creating row", function () {
    var base64Payload = {
      string: "kg==",
      len: 7
    };
    var message = new NetSimMessage(testShard, {
      fromNodeID: 1,
      toNodeID: 2,
      simulatedBy: 2,
      base64Payload: base64Payload,
      extraHopsRemaining: 3,
      visitedNodeIDs: [4]
    });
    var row = message.buildRow();
    assertEqual(row.base64Payload.string, base64Payload.string);
    assertEqual(row.base64Payload.len, base64Payload.len);
  });

  describe("static method send", function () {
    it ("adds an entry to the message table", function () {
      messageTable.readAll(function (err, rows) {
        assert(rows.length === 0, "Table is empty");
      });

      NetSimMessage.send(testShard, {}, function () {});

      messageTable.readAll(function (err, rows) {
        assert(rows.length === 1, "Table has one row");
      });
    });

    it ("Puts row values in remote table", function () {
      var fromNodeID = 1;
      var toNodeID = 2;
      var simulatedBy = 2;
      var base64Payload = {
        string: "kg==",
        len: 7
      };
      var extraHopsRemaining = 3;
      var visitedNodeIDs = [4];

      NetSimMessage.send(
          testShard,
          {
            fromNodeID: fromNodeID,
            toNodeID: toNodeID,
            simulatedBy: simulatedBy,
            payload: '1001001',
            extraHopsRemaining: extraHopsRemaining,
            visitedNodeIDs: visitedNodeIDs
          },
          function () {});

      messageTable.readAll(function (err, rows) {
        var row = rows[0];
        assertEqual(row.fromNodeID, fromNodeID);
        assertEqual(row.toNodeID, toNodeID);
        assertEqual(row.simulatedBy, simulatedBy);
        assertEqual(row.base64Payload, base64Payload);
        assertEqual(row.extraHopsRemaining, extraHopsRemaining);
        assertEqual(row.visitedNodeIDs, visitedNodeIDs);
      });
    });

    it ("Returns no error to its callback when successful", function () {
      NetSimMessage.send(testShard, {}, function (err) {
        assert(err === null, "Error is null on success");
      });
    });

    it ("throws an exception when given a non-binary String as a payload", function () {
      assertThrows(TypeError, NetSimMessage.send.bind(null, testShard, {
        fromNodeID: 1,
        toNodeID: 2,
        simulatedBy: 2,
        payload: 'some non-binary payload',
        extraHopsRemaining: 3,
        visitedNodeIDs: [4]
      }, function () {}));
    });
  });

  it ("can be instatiated from remote row", function () {
    var testRow;

    // Create a message row in remote table
    // The source payload that generates this base64Payload is "1001001"
    messageTable.create({
      fromNodeID: 1,
      toNodeID: 2,
      simulatedBy: 2,
      base64Payload: {
        string: "kgA=",
        len: 7
      },
      extraHopsRemaining: 3,
      visitedNodeIDs: [4]
    }, function (err, row) {
      testRow = row;
    });
    assert(testRow !== undefined, "Failed to create test row");

    // Instantiate message
    var message = new NetSimMessage(testShard, testRow);
    assertEqual(message.fromNodeID, 1);
    assertEqual(message.toNodeID, 2);
    assertEqual(message.simulatedBy, 2);
    assertEqual(message.payload, '1001001');
    assertEqual(message.extraHopsRemaining, 3);
    assertEqual(message.visitedNodeIDs, [4]);
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
      NetSimMessage.send(
          testShard,
          {
            fromNodeID: 1,
            toNodeID: 2,
            simulatedBy: 2,
            payload: '001'
          },
          function () {});
      NetSimMessage.send(
          testShard,
          {
            fromNodeID: 1,
            toNodeID: 2,
            simulatedBy: 2,
            payload: '010'
          },
          function () {});
      NetSimMessage.send(
          testShard,
          {
            fromNodeID: 1,
            toNodeID: 2,
            simulatedBy: 2,
            payload: '100'
          },
          function () {});
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
