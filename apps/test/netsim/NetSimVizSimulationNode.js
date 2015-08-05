'use strict';
/* global describe */
/* global beforeEach */
/* global it */
/* global $ */

var testUtils = require('../util/testUtils');
testUtils.setupLocale('netsim');
var assert = testUtils.assert;
var assertEqual = testUtils.assertEqual;
var NetSimTestUtils = require('../util/netsimTestUtils');
var fakeShard = NetSimTestUtils.fakeShard;
var assertTableSize = NetSimTestUtils.assertTableSize;

var NetSimGlobals = require('@cdo/apps/netsim/netsimGlobals_renaming');
var NetSimLocalClientNode = require('@cdo/apps/netsim/NetSimLocalClientNode');
var NetSimRouterNode = require('@cdo/apps/netsim/NetSimRouterNode');
var NetSimVizElement = require('@cdo/apps/netsim/NetSimVizElement');
var NetSimVizNode = require('@cdo/apps/netsim/NetSimVizNode');
var NetSimVizSimulationNode = require('@cdo/apps/netsim/NetSimVizSimulationNode');

describe("NetSimVizSimulationNode", function () {
  var vizElement, simEntity, shard;

  /**
   * Synchronous client creation on shard for test
   * @param {string} displayName
   * @returns {NetSimLocalClientNode}
   */
  var makeRemoteClient = function (displayName) {
    var newClient;
    NetSimLocalClientNode.create(shard, displayName, function (e, n) {
      newClient = n;
    });
    assert(newClient !== undefined, "Failed to create a remote client.");
    return newClient;
  };

  /**
   * Synchronous router creation on shard for test
   * @returns {NetSimRouterNode}
   */
  var makeRemoteRouter = function () {
    var newRouter;
    NetSimRouterNode.create(shard, function (e, r) {
      newRouter = r;
    });
    assert(newRouter !== undefined, "Failed to create a remote router.");
    return newRouter;
  };

  beforeEach(function () {
    NetSimTestUtils.initializeGlobalsToDefaultValues();
    shard = fakeShard();
  });

  describe("defaults", function () {
    beforeEach(function () {
      simEntity = new NetSimLocalClientNode();
      vizElement = new NetSimVizSimulationNode(simEntity);
    });

    it ("is a VizElement", function () {
      assert(vizElement instanceof NetSimVizElement);
    });

    it ("is a VizNode", function () {
      assert(vizElement instanceof NetSimVizNode);
    });

    it ("has default properties", function () {
      assertEqual(undefined, vizElement.correspondingNodeID_);
      assertEqual(undefined, vizElement.autoDnsAddress);
    });
  });

  describe("initializing from a client node", function () {
    beforeEach(function () {
      simEntity = makeRemoteClient('Jonathan A Deough');
      vizElement = new NetSimVizSimulationNode(simEntity);
    });

    it ("captures the client's node ID", function () {
      assertEqual(simEntity.entityID, vizElement.getCorrespondingEntityID());
    });

    it ("shows the client's display name (by default)", function () {
      assertEqual('Jonathan', vizElement.displayName_.text());
    });

    it ("shows the client's hostname when level expects it", function () {
      NetSimGlobals.getLevelConfig().showHostnameInGraph = true;
      vizElement = new NetSimVizSimulationNode(simEntity);
      assertEqual('jonathan1', vizElement.displayName_.text());
    });

    it ("knows it's not a router", function () {
      assertEqual(false, vizElement.isRouter);
    });

    it ("does not cache an auto-dns address", function () {
      assertEqual(undefined, vizElement.autoDnsAddress);
    });

    it ("does not assume it's the local node (must be told explicitly)", function () {
      assertEqual(false, vizElement.isLocalNode);
    });

    it ("does not assume it's the DNS node (must be told explicitly)", function () {
      assertEqual(false, vizElement.isDnsNode);
    });
  });

  describe("initializing from a router node", function () {
    beforeEach(function () {
      simEntity = makeRemoteRouter();
      vizElement = new NetSimVizSimulationNode(simEntity);
    });

    it ("captures the router's node ID", function () {
      assertEqual(simEntity.entityID, vizElement.getCorrespondingEntityID());
    });

    it ("shows the router's display name (by default)", function () {
      assertEqual('Router 1', vizElement.displayName_.text());
    });

    it ("shows the router's hostname when level expects it", function () {
      NetSimGlobals.getLevelConfig().showHostnameInGraph = true;
      vizElement = new NetSimVizSimulationNode(simEntity);
      assertEqual('router1', vizElement.displayName_.text());
    });

    it ("knows it's a router", function () {
      assertEqual(true, vizElement.isRouter);
    });

    it ("caches an auto-dns address", function () {
      assertEqual('15', vizElement.autoDnsAddress);
    });

    it ("is not the local node or dns node)", function () {
      assertEqual(false, vizElement.isLocalNode);
      assertEqual(false, vizElement.isDnsNode);
    });

    it ("adds the 'router-node' class to its root element", function () {
      assertEqual(true, vizElement.getRoot().is('.router-node'));
    });

    it ("is visible by default", function () {
      assertEqual('', vizElement.getRoot().css('display'));
    });

    it ("is hidden in broadcast mode", function () {
      NetSimGlobals.getLevelConfig().broadcastMode = true;
      vizElement = new NetSimVizSimulationNode(simEntity);
      assertEqual('none', vizElement.getRoot().css('display'));
    });
  });

});
