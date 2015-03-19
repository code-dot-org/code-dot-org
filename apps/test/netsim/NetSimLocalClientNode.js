'use strict';
/* global describe */
/* global beforeEach */
/* global it */

var testUtils = require('../util/testUtils');
var assert = testUtils.assert;
var assertEqual = testUtils.assertEqual;
var netsimTestUtils = require('../util/netsimTestUtils');
var fakeShard = netsimTestUtils.fakeShard;
var assertTableSize = netsimTestUtils.assertTableSize;

var NetSimLogger = testUtils.requireWithGlobalsCheckBuildFolder('netsim/NetSimLogger');
var NetSimEntity = testUtils.requireWithGlobalsCheckBuildFolder('netsim/NetSimEntity');
var NetSimClientNode = testUtils.requireWithGlobalsCheckBuildFolder('netsim/NetSimClientNode');
var NetSimLocalClientNode = testUtils.requireWithGlobalsCheckBuildFolder('netsim/NetSimLocalClientNode');
var NetSimWire = testUtils.requireWithGlobalsCheckBuildFolder('netsim/NetSimWire');

describe("NetSimLocalClientNode", function () {
  var testShard, testLocalNode, testRemoteNode;

  beforeEach(function () {
    NetSimLogger.getSingleton().setVerbosity(NetSimLogger.LogLevel.NONE);

    testShard = fakeShard();

    NetSimLocalClientNode.create(testShard, function (err, node) {
      testLocalNode = node;
    });
    assert(undefined !== testLocalNode, "Made a local node");

    NetSimEntity.create(NetSimClientNode, testShard, function (err, node) {
      testRemoteNode = node;
    });
    assert(undefined !== testRemoteNode, "Made a remote node");
  });

  describe("sendMessage", function () {
    it ("fails with error when not connected", function () {
      var error;
      testLocalNode.sendMessage('1 1 2 3 5 8', function (e, r) {
        error = e;
      });
      assert(error instanceof Error);
      assertEqual(error.message, 'Cannot send message; not connected.');
      assertTableSize(testShard, 'messageTable', 0);
    });

    it ("puts the message in the messages table", function () {
      testLocalNode.connectToNode(testRemoteNode, function () {});
      testLocalNode.sendMessage('payload', function () {});
      assertTableSize(testShard, 'messageTable', 1);
    });

    it ("callback has undefined result, even on success", function () {
      // Init to non-success values to make sure they get set.
      var err = true;
      var result = true;
      testLocalNode.connectToNode(testRemoteNode, function () {});
      testLocalNode.sendMessage('payload', function (e,r) {
        err = e;
        result = r;
      });
      assertEqual(null, err);
      assertEqual(undefined, result);
    });

    it ("Generated message has correct from/to node IDs", function () {
      var fromNodeID, toNodeID;
      testLocalNode.connectToNode(testRemoteNode, function () {});
      testLocalNode.sendMessage('payload', function () {});
      testShard.messageTable.readAll(function (err, rows) {
        fromNodeID = rows[0].fromNodeID;
        toNodeID = rows[0].toNodeID;
      });
      assertEqual(fromNodeID, testLocalNode.entityID);
      assertEqual(toNodeID, testRemoteNode.entityID);
    });

    it ("Generated message has correct payload", function () {
      var payload;
      testLocalNode.connectToNode(testRemoteNode, function () {});
      testLocalNode.sendMessage('boogaloo', function () {});
      testShard.messageTable.readAll(function (err, rows) {
        payload = rows[0].payload;
      });
      assertEqual('boogaloo', payload);
    });
  });

  describe("sendMessages", function () {
    var payloads = ['1', '1', '2', '3', '5', '8'];

    it ("fails with error when not connected", function () {
      var error;
      testLocalNode.sendMessages(payloads, function (e, r) {
        error = e;
      });
      assert(error instanceof Error);
      assertEqual(error.message, 'Cannot send message; not connected.');
      assertTableSize(testShard, 'messageTable', 0);
    });

    it ("succeeds immediately with empty payload", function () {
      var error, result;
      testLocalNode.sendMessages([], function (e, r) {
        error = e;
        result = r;
      });
      assertEqual(null, error);
      assertEqual(undefined, result);
    });

    it ("puts all of the payloads into the message table", function () {
      testLocalNode.connectToNode(testRemoteNode, function () {});
      testLocalNode.sendMessages(payloads, function () {});
      assertTableSize(testShard, 'messageTable', payloads.length);
    });
  });
});
