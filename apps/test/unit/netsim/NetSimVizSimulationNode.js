import {assert} from '../../util/deprecatedChai';
var NetSimTestUtils = require('../../util/netsimTestUtils');
var NetSimGlobals = require('@cdo/apps/netsim/NetSimGlobals');
var NetSimLocalClientNode = require('@cdo/apps/netsim/NetSimLocalClientNode');
var NetSimRouterNode = require('@cdo/apps/netsim/NetSimRouterNode');
var NetSimVizElement = require('@cdo/apps/netsim/NetSimVizElement');
var NetSimVizNode = require('@cdo/apps/netsim/NetSimVizNode');
var NetSimVizSimulationNode = require('@cdo/apps/netsim/NetSimVizSimulationNode');

var fakeShard = NetSimTestUtils.fakeShard;

describe('NetSimVizSimulationNode', function() {
  var vizElement, simEntity, shard;

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
   * Synchronous router creation on shard for test
   * @returns {NetSimRouterNode}
   */
  var makeRemoteRouter = function() {
    var newRouter;
    NetSimRouterNode.create(shard, function(e, r) {
      newRouter = r;
    });
    assert.isDefined(newRouter, 'Failed to create a remote router.');
    return newRouter;
  };

  beforeEach(function() {
    NetSimTestUtils.initializeGlobalsToDefaultValues();
    shard = fakeShard();
  });

  describe('defaults', function() {
    beforeEach(function() {
      simEntity = new NetSimLocalClientNode();
      vizElement = new NetSimVizSimulationNode(simEntity);
    });

    it('is a VizElement', function() {
      assert.instanceOf(vizElement, NetSimVizElement);
    });

    it('is a VizNode', function() {
      assert.instanceOf(vizElement, NetSimVizNode);
    });

    it('has default properties', function() {
      assert.isUndefined(vizElement.correspondingNodeID_);
      assert.isUndefined(vizElement.autoDnsAddress);
    });
  });

  describe('initializing from a client node', function() {
    beforeEach(function() {
      simEntity = makeRemoteClient('Jonathan A Deough');
      vizElement = new NetSimVizSimulationNode(simEntity);
    });

    it("captures the client's node ID", function() {
      assert.equal(simEntity.entityID, vizElement.getCorrespondingEntityId());
    });

    it("shows the client's display name (by default)", function() {
      assert.equal('Jonathan', vizElement.displayName_.text());
    });

    it("shows the client's hostname when level expects it", function() {
      NetSimGlobals.getLevelConfig().showHostnameInGraph = true;
      vizElement = new NetSimVizSimulationNode(simEntity);
      assert.equal('jonathan1', vizElement.displayName_.text());
    });

    it("knows it's not a router", function() {
      assert.isFalse(vizElement.isRouter);
    });

    it('does not cache an auto-dns address', function() {
      assert.equal(undefined, vizElement.autoDnsAddress);
    });

    it("does not assume it's the local node (must be told explicitly)", function() {
      assert.isFalse(vizElement.isLocalNode);
    });

    it("does not assume it's the DNS node (must be told explicitly)", function() {
      assert.isFalse(vizElement.isDnsNode);
    });
  });

  describe('initializing from a router node', function() {
    beforeEach(function() {
      simEntity = makeRemoteRouter();
      vizElement = new NetSimVizSimulationNode(simEntity);
    });

    it("captures the router's node ID", function() {
      assert.equal(simEntity.entityID, vizElement.getCorrespondingEntityId());
    });

    it("shows the router's display name (by default)", function() {
      assert.equal('Router 1', vizElement.displayName_.text());
    });

    it("shows the router's hostname when level expects it", function() {
      NetSimGlobals.getLevelConfig().showHostnameInGraph = true;
      vizElement = new NetSimVizSimulationNode(simEntity);
      assert.equal('router1', vizElement.displayName_.text());
    });

    it("knows it's a router", function() {
      assert.isTrue(vizElement.isRouter);
    });

    it('caches an auto-dns address', function() {
      assert.equal('15', vizElement.autoDnsAddress);
    });

    it('is not the local node or dns node)', function() {
      assert.isFalse(vizElement.isLocalNode);
      assert.isFalse(vizElement.isDnsNode);
    });

    it("adds the 'router-node' class to its root element", function() {
      assert.isTrue(vizElement.getRoot().is('.router-node'));
    });

    it('is visible by default', function() {
      assert.equal('', vizElement.getRoot().css('display'));
    });

    it('is hidden in broadcast mode', function() {
      NetSimGlobals.getLevelConfig().broadcastMode = true;
      vizElement = new NetSimVizSimulationNode(simEntity);
      assert.equal('none', vizElement.getRoot().css('display'));
    });
  });
});
