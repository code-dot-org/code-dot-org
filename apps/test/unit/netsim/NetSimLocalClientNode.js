import {assert} from '../../util/deprecatedChai';
var NetSimTestUtils = require('../../util/netsimTestUtils');
var NetSimGlobals = require('@cdo/apps/netsim/NetSimGlobals');
var NetSimLogger = require('@cdo/apps/netsim/NetSimLogger');
var NetSimEntity = require('@cdo/apps/netsim/NetSimEntity');
var NetSimMessage = require('@cdo/apps/netsim/NetSimMessage');
var NetSimRouterNode = require('@cdo/apps/netsim/NetSimRouterNode');
var NetSimClientNode = require('@cdo/apps/netsim/NetSimClientNode');
var NetSimLocalClientNode = require('@cdo/apps/netsim/NetSimLocalClientNode');

var assertTableSize = NetSimTestUtils.assertTableSize;
var fakeShard = NetSimTestUtils.fakeShard;

describe('NetSimLocalClientNode', function() {
  var testShard, testLocalNode, testRemoteNode;

  /**
   * Synchronous router creation on shard for test
   * @returns {NetSimRouterNode}
   */
  var makeRemoteRouter = function() {
    var newRouter;
    NetSimRouterNode.create(testShard, function(e, r) {
      newRouter = r;
    });
    assert.isDefined(newRouter, 'Failed to create a remote router.');
    return newRouter;
  };

  beforeEach(function() {
    NetSimLogger.getSingleton().setVerbosity(NetSimLogger.LogLevel.NONE);
    NetSimTestUtils.initializeGlobalsToDefaultValues();

    testShard = fakeShard();

    NetSimLocalClientNode.create(testShard, 'testLocalNode', function(
      err,
      node
    ) {
      testLocalNode = node;
    });
    assert.isDefined(testLocalNode, 'Made a local node');

    NetSimEntity.create(NetSimClientNode, testShard, function(err, node) {
      testRemoteNode = node;
    });
    assert.isDefined(testRemoteNode, 'Made a remote node');
  });

  describe('onNodeTableChange_', function() {
    var lostConnection;
    beforeEach(function() {
      testLocalNode.initializeSimulation(null, null);

      // Set up testing for lost connection callback
      lostConnection = false;
      testLocalNode.setLostConnectionCallback(function() {
        lostConnection = true;
      });
      assert.isFalse(lostConnection);
    });

    it('detects when own row has gone away and calls lost connection callback', function() {
      testShard.nodeTable.api_.remoteTable.deleteMany(
        [testLocalNode.entityID],
        function() {}
      );
      testShard.nodeTable.refresh();
      assert.isTrue(lostConnection);
    });

    it('detects shard reset even when own ID has been reclaimed', function() {
      // Reset fake remote table and repopulate first two rows.
      testShard.nodeTable = NetSimTestUtils.overrideNetSimTableApi(
        testShard.nodeTable
      );
      NetSimEntity.create(NetSimClientNode, testShard, function() {});
      NetSimEntity.create(NetSimClientNode, testShard, function() {});

      testShard.nodeTable.refresh();
      assert.isTrue(lostConnection);
    });
  });

  describe('onWireTableChange_', function() {
    it('detects when remote client disconnects, and removes local wire', function() {
      var localWireRow, remoteWireRow;

      testLocalNode.connectToNode(testRemoteNode, function() {});
      testRemoteNode.connectToNode(testLocalNode, function() {});

      localWireRow = testLocalNode.getOutgoingWire().buildRow();
      localWireRow.id = 1;
      remoteWireRow = testRemoteNode.getOutgoingWire().buildRow();
      remoteWireRow.id = 2;

      assert.equal(localWireRow.localNodeID, remoteWireRow.remoteNodeID);
      assert.equal(localWireRow.remoteNodeID, remoteWireRow.localNodeID);

      // Trigger onWireTableChange_ with both wires; the connection
      // should be complete!
      testLocalNode.shard_.wireTable.fullCacheUpdate_([
        localWireRow,
        remoteWireRow
      ]);
      testLocalNode.onWireTableChange_();
      assert.deepEqual(testLocalNode.myRemoteClient, testRemoteNode);

      // Trigger onWireTableChange_ without the remoteWire; the
      // connection should be broken
      testLocalNode.shard_.wireTable.fullCacheUpdate_([localWireRow]);
      testLocalNode.onWireTableChange_();
      assert.isNull(testLocalNode.getOutgoingWire());
      assert.isNull(testLocalNode.myRemoteClient);
    });

    it('detects when attempted connection is rejected', function() {
      var testThirdNode;
      var localWireRow, remoteWireRow, thirdWireRow;

      NetSimEntity.create(NetSimClientNode, testShard, function(err, node) {
        testThirdNode = node;
      });
      testLocalNode.connectToNode(testRemoteNode, function() {});
      testRemoteNode.connectToNode(testThirdNode, function() {});

      localWireRow = testLocalNode.getOutgoingWire().buildRow();
      localWireRow.id = 1;
      remoteWireRow = testRemoteNode.getOutgoingWire().buildRow();
      remoteWireRow.id = 2;

      testLocalNode.shard_.wireTable.fullCacheUpdate_([
        localWireRow,
        remoteWireRow
      ]);
      testLocalNode.onWireTableChange_();
      var newLocalWireRow = testLocalNode.getOutgoingWire().buildRow();
      newLocalWireRow.id = 1;
      assert.deepEqual(newLocalWireRow, localWireRow);
      assert.isNull(testLocalNode.myRemoteClient);

      testThirdNode.connectToNode(testRemoteNode, function() {});

      thirdWireRow = testThirdNode.getOutgoingWire().buildRow();
      thirdWireRow.id = 3;
      testLocalNode.shard_.wireTable.fullCacheUpdate_([
        localWireRow,
        remoteWireRow,
        thirdWireRow
      ]);
      testLocalNode.onWireTableChange_();
      assert.isNull(testLocalNode.getOutgoingWire());
    });
  });

  describe('sendMessage', function() {
    it('fails with error when not connected', function() {
      var error;
      testLocalNode.sendMessage('101010010101', function(e) {
        error = e;
      });
      assert.instanceOf(error, Error);
      assert.equal(error.message, 'Cannot send message; not connected.');
      assertTableSize(testShard, 'messageTable', 0);
    });

    it('puts the message in the messages table', function() {
      testLocalNode.connectToNode(testRemoteNode, function() {});
      testLocalNode.sendMessage('10101010101', function() {});
      assertTableSize(testShard, 'messageTable', 1);
    });

    it('callback has undefined result, even on success', function() {
      // Init to non-success values to make sure they get set.
      var err = true;
      var result = true;
      testLocalNode.connectToNode(testRemoteNode, function() {});
      testLocalNode.sendMessage('10100110101', function(e, r) {
        err = e;
        result = r;
      });
      assert.isNull(err);
      assert.isUndefined(result);
    });

    it('Generated message has correct from/to node IDs', function() {
      var fromNodeID, toNodeID;
      testLocalNode.connectToNode(testRemoteNode, function() {});
      testLocalNode.sendMessage('101001100101', function() {});
      testShard.messageTable.refresh(function(err, rows) {
        fromNodeID = rows[0].fromNodeID;
        toNodeID = rows[0].toNodeID;
      });
      assert.equal(fromNodeID, testLocalNode.entityID);
      assert.equal(toNodeID, testRemoteNode.entityID);
    });

    it('Generated message has correct payload', function() {
      var message;
      testLocalNode.connectToNode(testRemoteNode, function() {});
      testLocalNode.sendMessage('1010101010100101010', function() {});
      testShard.messageTable.refresh(function(err, rows) {
        message = new NetSimMessage(testShard, rows[0]);
      });
      assert.equal('1010101010100101010', message.payload);
    });
  });

  describe('sendMessages', function() {
    var payloads = [
      '10100111',
      '0100110010',
      '0001100110',
      '00111000',
      '1000010100',
      '1110100110'
    ];

    it('fails with error when not connected', function() {
      var error;
      testLocalNode.sendMessages(payloads, function(e) {
        error = e;
      });
      assert.instanceOf(error, Error);
      assert.equal(error.message, 'Cannot send message; not connected.');
      assertTableSize(testShard, 'messageTable', 0);
    });

    it('succeeds immediately with empty payload', function() {
      var error, result;
      testLocalNode.sendMessages([], function(e, r) {
        error = e;
        result = r;
      });
      assert.isNull(error);
      assert.isUndefined(result);
    });

    it('puts all of the payloads into the message table', function() {
      testLocalNode.connectToNode(testRemoteNode, function() {});
      testLocalNode.sendMessages(payloads, function() {});
      assertTableSize(testShard, 'messageTable', payloads.length);
    });
  });

  describe('getShortDisplayName', function() {
    it('reflects no change for names below 10 characters', function() {
      testLocalNode.displayName_ = 'Sam';
      assert.equal('Sam', testLocalNode.getShortDisplayName());

      testLocalNode.displayName_ = 'Sam Well';
      assert.equal('Sam Well', testLocalNode.getShortDisplayName());

      // Note: spaces preserved for short names
      testLocalNode.displayName_ = 'Samuel 999';
      assert.equal('Samuel 999', testLocalNode.getShortDisplayName());
    });

    it('uses first word for names longer than 10 characters', function() {
      // Even short first names used, as long as whole name is > 10
      testLocalNode.displayName_ = 'A Modest Proposal';
      assert.equal('A', testLocalNode.getShortDisplayName());

      // Ordinary case
      testLocalNode.displayName_ = 'Jonathan Swift';
      assert.equal('Jonathan', testLocalNode.getShortDisplayName());

      // First name longer than 10 characters
      testLocalNode.displayName_ = 'Constantine Rey';
      assert.equal('Constantine', testLocalNode.getShortDisplayName());
    });
  });

  describe('getHostname', function() {
    it('is a transformation of the short display name and node ID', function() {
      assert.equal(1, testLocalNode.entityID);
      testLocalNode.displayName_ = 'Sam';
      assert.equal('sam1', testLocalNode.getHostname());
    });

    it('strips spaces, preserves digits', function() {
      assert.equal(1, testLocalNode.entityID);
      testLocalNode.displayName_ = 'Sam Well';
      assert.equal('samwell1', testLocalNode.getHostname());

      // Note: spaces preserved for short names
      testLocalNode.displayName_ = 'Samuel 999';
      assert.equal('samuel9991', testLocalNode.getHostname());
    });

    it('abbreviates with short-name rules', function() {
      assert.equal(1, testLocalNode.entityID);
      // Even short first names used, as long as whole name is > 10
      testLocalNode.displayName_ = 'A Modest Proposal';
      assert.equal('a1', testLocalNode.getHostname());

      // Ordinary case
      testLocalNode.displayName_ = 'Jonathan Swift';
      assert.equal('jonathan1', testLocalNode.getHostname());

      // First name longer than 10 characters
      testLocalNode.displayName_ = 'Constantine Rey';
      assert.equal('constantine1', testLocalNode.getHostname());
    });
  });

  describe('makeWireRowForConnectingTo', function() {
    var wireRow;

    describe('a router', function() {
      var routerNode;

      beforeEach(function() {
        NetSimGlobals.setRandomSeed('fizzbusters');
        routerNode = makeRemoteRouter();
        wireRow = testLocalNode.makeWireRowForConnectingTo(routerNode);
      });

      it('Sets localNodeID to own entity ID', function() {
        assert.equal(testLocalNode.entityID, wireRow.localNodeID);
      });

      it('Sets remoteNodeID to router entity ID', function() {
        assert.equal(routerNode.entityID, wireRow.remoteNodeID);
      });

      it('Gets a random local address from the router', function() {
        // Pinned by 'setRandomSeed', above.
        assert.equal('9', wireRow.localAddress);
      });

      it("Sets remoteAddress to router's address", function() {
        assert.equal(routerNode.getAddress(), wireRow.remoteAddress);
      });

      it('Sets localHostname to own hostname', function() {
        assert.equal(testLocalNode.getHostname(), wireRow.localHostname);
      });

      it("Sets remoteHostname to router's hostname", function() {
        assert.equal(routerNode.getHostname(), wireRow.remoteHostname);
      });
    });

    describe('a client', function() {
      beforeEach(function() {
        wireRow = testLocalNode.makeWireRowForConnectingTo(testRemoteNode);
      });

      it('Sets localNodeID to own entity ID', function() {
        assert.equal(testLocalNode.entityID, wireRow.localNodeID);
      });

      it('Sets remoteNodeID to remote entity ID', function() {
        assert.equal(testRemoteNode.entityID, wireRow.remoteNodeID);
      });

      it('Leaves remaining fields undefined', function() {
        assert.isUndefined(wireRow.localAddress);
        assert.isUndefined(wireRow.remoteAddress);
        assert.isUndefined(wireRow.localHostname);
        assert.isUndefined(wireRow.remoteHostname);
      });
    });
  });

  // TODO: A test that covers connecting to a router and then disconnecting
  //       and ensures we end up in a consistent state.
});
