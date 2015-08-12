'use strict';
/* global describe */
/* global beforeEach */
/* global it */

var testUtils = require('../util/testUtils');
testUtils.setupLocale('netsim');
var assert = testUtils.assert;
var assertEqual = testUtils.assertEqual;
var NetSimTestUtils = require('../util/netsimTestUtils');
var fakeShard = NetSimTestUtils.fakeShard;
var assertTableSize = NetSimTestUtils.assertTableSize;

var NetSimLogger = require('@cdo/apps/netsim/NetSimLogger');
var NetSimEntity = require('@cdo/apps/netsim/NetSimEntity');
var NetSimMessage = require('@cdo/apps/netsim/NetSimMessage');
var NetSimClientNode = require('@cdo/apps/netsim/NetSimClientNode');
var NetSimLocalClientNode = require('@cdo/apps/netsim/NetSimLocalClientNode');
var NetSimWire = require('@cdo/apps/netsim/NetSimWire');

describe("NetSimLocalClientNode", function () {
  var testShard, testLocalNode, testRemoteNode;

  beforeEach(function () {
    NetSimLogger.getSingleton().setVerbosity(NetSimLogger.LogLevel.NONE);
    NetSimTestUtils.initializeGlobalsToDefaultValues();

    testShard = fakeShard();

    NetSimLocalClientNode.create(testShard, "testLocalNode", function (err, node) {
      testLocalNode = node;
    });
    assert(undefined !== testLocalNode, "Made a local node");

    NetSimEntity.create(NetSimClientNode, testShard, function (err, node) {
      testRemoteNode = node;
    });
    assert(undefined !== testRemoteNode, "Made a remote node");
  });

  describe("onWireTableChange_", function () {
    it ("detects when remote client disconnects, and removes local wire", function () {

      var localWireRow, remoteWireRow;

      testLocalNode.connectToNode(testRemoteNode, function () {});
      testRemoteNode.connectToNode(testLocalNode, function () {});

      localWireRow = testLocalNode.myWire.buildRow();
      remoteWireRow = testRemoteNode.getOutgoingWire().buildRow();

      assertEqual(localWireRow.localNodeID, remoteWireRow.remoteNodeID);
      assertEqual(localWireRow.remoteNodeID, remoteWireRow.localNodeID);

      // Trigger onWireTableChange_ with both wires; the connection
      // should be complete!
      testLocalNode.onWireTableChange_([localWireRow, remoteWireRow]);
      assertEqual(testLocalNode.myRemoteClient, testRemoteNode);

      // Trigger onWireTableChange_ without the remoteWire; the
      // connection should be broken
      testLocalNode.onWireTableChange_([localWireRow]);
      assertEqual(testLocalNode.myWire, null);
      assertEqual(testLocalNode.myRemoteClient, null);

    });

    it ("detects when attempted connection is rejected", function () {

      var testThirdNode;
      var localWireRow, remoteWireRow, thirdWireRow;

      NetSimEntity.create(NetSimClientNode, testShard, function (err, node) {
        testThirdNode = node;
      });
      testLocalNode.connectToNode(testRemoteNode, function () {});
      testRemoteNode.connectToNode(testThirdNode, function () {});

      localWireRow = testLocalNode.myWire.buildRow();
      remoteWireRow = testRemoteNode.getOutgoingWire().buildRow();

      testLocalNode.onWireTableChange_([localWireRow, remoteWireRow]);
      assertEqual(testLocalNode.myWire.buildRow(), localWireRow);
      assertEqual(testLocalNode.myRemoteClient, null);

      testThirdNode.connectToNode(testRemoteNode, function () {});

      thirdWireRow = testThirdNode.getOutgoingWire().buildRow();
      testLocalNode.onWireTableChange_([localWireRow, remoteWireRow, thirdWireRow]);
      assertEqual(testLocalNode.myWire, null);

    });
  });

  describe("sendMessage", function () {
    it ("fails with error when not connected", function () {
      var error;
      testLocalNode.sendMessage('101010010101', function (e, r) {
        error = e;
      });
      assert(error instanceof Error);
      assertEqual(error.message, 'Cannot send message; not connected.');
      assertTableSize(testShard, 'messageTable', 0);
    });

    it ("puts the message in the messages table", function () {
      testLocalNode.connectToNode(testRemoteNode, function () {});
      testLocalNode.sendMessage('10101010101', function () {});
      assertTableSize(testShard, 'messageTable', 1);
    });

    it ("callback has undefined result, even on success", function () {
      // Init to non-success values to make sure they get set.
      var err = true;
      var result = true;
      testLocalNode.connectToNode(testRemoteNode, function () {});
      testLocalNode.sendMessage('10100110101', function (e,r) {
        err = e;
        result = r;
      });
      assertEqual(null, err);
      assertEqual(undefined, result);
    });

    it ("Generated message has correct from/to node IDs", function () {
      var fromNodeID, toNodeID;
      testLocalNode.connectToNode(testRemoteNode, function () {});
      testLocalNode.sendMessage('101001100101', function () {});
      testShard.messageTable.refresh(function (err, rows) {
        fromNodeID = rows[0].fromNodeID;
        toNodeID = rows[0].toNodeID;
      });
      assertEqual(fromNodeID, testLocalNode.entityID);
      assertEqual(toNodeID, testRemoteNode.entityID);
    });

    it ("Generated message has correct payload", function () {
      var message;
      testLocalNode.connectToNode(testRemoteNode, function () {});
      testLocalNode.sendMessage('1010101010100101010', function () {});
      testShard.messageTable.refresh(function (err, rows) {
        message = new NetSimMessage(testShard, rows[0]);
      });
      assertEqual('1010101010100101010', message.payload);
    });
  });

  describe("sendMessages", function () {
    var payloads = [
      '10100111',
      '0100110010',
      '0001100110',
      '00111000',
      '1000010100',
      '1110100110'
    ];

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

  describe("getShortDisplayName", function () {
    it ("reflects no change for names below 10 characters", function () {
      testLocalNode.displayName_ = 'Sam';
      assertEqual('Sam', testLocalNode.getShortDisplayName());

      testLocalNode.displayName_ = 'Sam Well';
      assertEqual('Sam Well', testLocalNode.getShortDisplayName());

      // Note: spaces preserved for short names
      testLocalNode.displayName_ = 'Samuel 999';
      assertEqual('Samuel 999', testLocalNode.getShortDisplayName());
    });

    it ("uses first word for names longer than 10 characters", function () {
      // Even short first names used, as long as whole name is > 10
      testLocalNode.displayName_ = 'A Modest Proposal';
      assertEqual('A', testLocalNode.getShortDisplayName());

      // Ordinary case
      testLocalNode.displayName_ = 'Jonathan Swift';
      assertEqual('Jonathan', testLocalNode.getShortDisplayName());

      // First name longer than 10 characters
      testLocalNode.displayName_ = 'Constantine Rey';
      assertEqual('Constantine', testLocalNode.getShortDisplayName());
    });
  });

  describe("getHostname", function () {
    it ("is a transformation of the short display name and node ID", function () {
      assertEqual(1, testLocalNode.entityID);
      testLocalNode.displayName_ = 'Sam';
      assertEqual('sam1', testLocalNode.getHostname());
    });

    it ("strips spaces, preserves digits", function () {
      assertEqual(1, testLocalNode.entityID);
      testLocalNode.displayName_ = 'Sam Well';
      assertEqual('samwell1', testLocalNode.getHostname());

      // Note: spaces preserved for short names
      testLocalNode.displayName_ = 'Samuel 999';
      assertEqual('samuel9991', testLocalNode.getHostname());
    });

    it ("abbreviates with short-name rules", function () {
      assertEqual(1, testLocalNode.entityID);
      // Even short first names used, as long as whole name is > 10
      testLocalNode.displayName_ = 'A Modest Proposal';
      assertEqual('a1', testLocalNode.getHostname());

      // Ordinary case
      testLocalNode.displayName_ = 'Jonathan Swift';
      assertEqual('jonathan1', testLocalNode.getHostname());

      // First name longer than 10 characters
      testLocalNode.displayName_ = 'Constantine Rey';
      assertEqual('constantine1', testLocalNode.getHostname());
    });
  });

  // TODO: A test that covers connecting to a router and then disconnecting
  //       and ensures we end up in a consistent state.
});
