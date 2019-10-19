import {assert} from '../../util/deprecatedChai';
var NetSimTestUtils = require('../../util/netsimTestUtils');
var NetSimGlobals = require('@cdo/apps/netsim/NetSimGlobals');
var NetSimLocalClientNode = require('@cdo/apps/netsim/NetSimLocalClientNode');
var NetSimWire = require('@cdo/apps/netsim/NetSimWire');
var NetSimVizElement = require('@cdo/apps/netsim/NetSimVizElement');
var NetSimVizWire = require('@cdo/apps/netsim/NetSimVizWire');
var NetSimVizSimulationNode = require('@cdo/apps/netsim/NetSimVizSimulationNode');
var NetSimVizSimulationWire = require('@cdo/apps/netsim/NetSimVizSimulationWire');

var fakeShard = NetSimTestUtils.fakeShard;

describe('NetSimVizSimulationWire', function() {
  var vizWire,
    vizLocalNode,
    vizRemoteNode,
    simWire,
    localNode,
    remoteNode,
    shard;

  /**
   * Synchronous client creation on shard for test
   * @param {string} displayName
   * @returns {NetSimLocalClientNode}
   */
  var makeRemoteClient = function(displayName) {
    var newClient;
    NetSimLocalClientNode.create(shard, displayName, function(e, n) {
      newClient = n;
    });
    assert.isDefined(newClient, 'Failed to create a remote client.');
    return newClient;
  };

  /**
   * Synchronous wire creation on shard for test
   * @param {number} localNodeID
   * @param {number} remoteNodeID
   * @returns {NetSimWire}
   */
  var makeRemoteWire = function(localNodeID, remoteNodeID) {
    var newWire;
    NetSimWire.create(
      shard,
      {
        localNodeID: localNodeID,
        remoteNodeID: remoteNodeID
      },
      function(e, w) {
        newWire = w;
      }
    );
    assert.isDefined(newWire, 'Failed to create a remote wire.');
    return newWire;
  };

  var getVizNodeByEntityID = function(_, id) {
    if (vizLocalNode && vizLocalNode.getCorrespondingEntityId() === id) {
      return vizLocalNode;
    } else if (
      vizRemoteNode &&
      vizRemoteNode.getCorrespondingEntityId() === id
    ) {
      return vizRemoteNode;
    }
    return undefined;
  };

  beforeEach(function() {
    NetSimTestUtils.initializeGlobalsToDefaultValues();
    shard = fakeShard();
  });

  describe('defaults', function() {
    beforeEach(function() {
      localNode = makeRemoteClient('Antony');
      remoteNode = makeRemoteClient('Cleopatra');
      simWire = makeRemoteWire(localNode.entityID, remoteNode.entityID);
      vizLocalNode = new NetSimVizSimulationNode(localNode);
      vizRemoteNode = new NetSimVizSimulationNode(remoteNode);
      vizWire = new NetSimVizSimulationWire(simWire, getVizNodeByEntityID);
    });

    it('is a VizElement', function() {
      assert.instanceOf(vizWire, NetSimVizElement);
    });

    it('is a VizWire', function() {
      assert.instanceOf(vizWire, NetSimVizWire);
    });

    it('has default properties', function() {
      assert.strictEqual(0, vizWire.textPosX_);
      assert.strictEqual(0, vizWire.textPosY_);
      assert.deepEqual([], vizWire.encodings_);
      assert.strictEqual(simWire.entityID, vizWire.getCorrespondingEntityId());
      assert.strictEqual(vizLocalNode, vizWire.localVizNode);
      assert.strictEqual(vizRemoteNode, vizWire.remoteVizNode);
    });

    it('sets addresses on its endpoints', function() {
      assert.isUndefined(vizLocalNode.address_);
      assert.isUndefined(vizRemoteNode.address_);
      simWire.localAddress = 'boo';
      simWire.remoteAddress = 'hiss';
      vizWire.configureFrom(simWire);
      assert.equal('boo', vizLocalNode.address_);
      assert.equal('hiss', vizRemoteNode.address_);
    });

    it('is hidden in broadcast mode', function() {
      NetSimGlobals.getLevelConfig().broadcastMode = true;
      vizWire.configureFrom(simWire);
      assert.equal('none', vizWire.getRoot().css('display'));
    });
  });
});
