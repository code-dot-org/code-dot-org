'use strict';
/* global describe */
/* global beforeEach */
/* global it */
/* global $ */

var testUtils = require('../util/testUtils');
testUtils.setupLocale('netsim');
var assert = testUtils.assert;
var NetSimTestUtils = require('../util/netsimTestUtils');
var fakeShard = NetSimTestUtils.fakeShard;

var NetSimLocalClientNode = require('@cdo/apps/netsim/NetSimLocalClientNode');
var NetSim = require('@cdo/apps/netsim/netsim');
var NetSimWire = require('@cdo/apps/netsim/NetSimWire');
var NetSimRouterNode = require('@cdo/apps/netsim/NetSimRouterNode');
var NetSimVizNode = require('@cdo/apps/netsim/NetSimVizNode');
var NetSimVizWire = require('@cdo/apps/netsim/NetSimVizWire');
var NetSimVizSimulationNode = require('@cdo/apps/netsim/NetSimVizSimulationNode');
var NetSimVizSimulationWire = require('@cdo/apps/netsim/NetSimVizSimulationWire');
var NetSimVisualization = require('@cdo/apps/netsim/NetSimVisualization');

var NetSimConstants = require('@cdo/apps/netsim/netsimConstants_renaming');
var NetSimGlobals = require('@cdo/apps/netsim/netsimGlobals_renaming');
var DnsMode = NetSimConstants.DnsMode;
var EncodingType = NetSimConstants.EncodingType;

describe("NetSimVisualization", function () {
  
  var testShard, alphaNode, betaNode, deltaNode, gammaNode, router,
      alphaWire, betaWire, deltaWire, gammaWire, netSimVis;

  /**
   * Creates an svg placeholder so that NetSimVisualization's foreground
   * and background searches work
   * @returns {jQuery}
   */
  var makeSVGElement = function () {
    return $("<svg version=\"1.1\" width=\"298\" height=\"298\" xmlns=\"http://www.w3.org/2000/svg\">" +
        "<g id=\"centered-group\">" +
          "<g id=\"background-group\"></g>" +
          "<g id=\"foreground-group\"></g>" +
        "</g>" +
      "</svg>");
  };

  /**
   * Synchronous client creation on shard for test
   * @param {string} displayName
   * @returns {NetSimVizSimulationNode}
   */
  var makeRemoteClient = function (displayName) {
    var newClient;
    NetSimLocalClientNode.create(testShard, displayName, function (e, n) {
      newClient = n;
    });
    assert(newClient !== undefined, "Failed to create a remote client.");
    return new NetSimVizSimulationNode(newClient);
  };

  /**
   * Synchronous router creation on shard for test
   * @returns {NetSimVizSimulationNode}
   */
  var makeRemoteRouter = function () {
    var newRouter;
    NetSimRouterNode.create(testShard, function (e, r) {
      newRouter = r;
    });
    assert(newRouter !== undefined, "Failed to create a remote router.");
    return new NetSimVizSimulationNode(newRouter);
  };

  /**
   * Synchronous wire creation on shard for test
   * @param {number} localNodeID
   * @param {number} remoteNodeID
   * @returns {NetSimVizSimulationWire}
   */
  var makeRemoteWire = function (localVizNode, remoteVizNode, elements) {
    var newWire;
    NetSimWire.create(testShard, localVizNode.getCorrespondingEntityID(), remoteVizNode.getCorrespondingEntityID(), function (e, w) {
      newWire = w;
    });
    assert(newWire !== undefined, "Failed to create a remote wire.");
    return new NetSimVizSimulationWire(newWire, getVizNodeByEntityID_.bind(elements));
  };

  var getVizNodeByEntityID_ = function (_type, id) {
    return this.filter(function(element){
      return element instanceof NetSimVizNode &&
          element.getCorrespondingEntityID &&
          element.getCorrespondingEntityID() === id;
    })[0];
  };

  describe("broadcast mode", function () {

    beforeEach(function () {
      NetSimTestUtils.initializeGlobalsToDefaultValues();
      NetSimGlobals.getLevelConfig().broadcastMode = true;

      testShard = fakeShard();

      alphaNode = makeRemoteClient('alpha');
      betaNode = makeRemoteClient('beta');
      deltaNode = makeRemoteClient('delta');
      gammaNode = makeRemoteClient('gamma');
      router = makeRemoteRouter();
      var elements = [alphaNode, betaNode, deltaNode, gammaNode, router];

      alphaWire = makeRemoteWire(alphaNode, router, elements);
      betaWire = makeRemoteWire(betaNode, router, elements);
      deltaWire = makeRemoteWire(deltaNode, router, elements);
      gammaWire = makeRemoteWire(gammaNode, router, elements);
      elements = elements.concat([alphaWire, betaWire, deltaWire, gammaWire]);

      var netsim = new NetSim();
      netSimVis = new NetSimVisualization(makeSVGElement(), netsim.runLoop_);

      netSimVis.setShard(testShard);
      netSimVis.elements_ = elements;
      netSimVis.localNode = alphaNode;
      netSimVis.updateBroadcastModeWires_();
    });

    it("hides the original wires", function () {
      assert.equal(alphaWire.getRoot().css('display'), 'none');
      assert.equal(betaWire.getRoot().css('display'), 'none');
      assert.equal(deltaWire.getRoot().css('display'), 'none');
      assert.equal(gammaWire.getRoot().css('display'), 'none');
    });

    it("creates fake wires", function () {
      // We expect:
      //   4 nodes
      //   4 real but hidden wires
      //   (4-1)! = 6 "fake" wires
      //   1 router
      // For a total of 15 elements
      assert.equal(15, netSimVis.elements_.length);
    });

    it("pulls ALL elements to the foreground", function () {
      netSimVis.pullElementsToForeground();
      var i;
      for (i=0; i < netSimVis.elements_.length; i++) {
        assert.isTrue(netSimVis.elements_[i].isForeground);
      }
    });

  });

  /**
    * Creates the following test networks with the capitalized N as the
    * vizNode:
    *
    * 1) n -> N = r = n
    *    (two nodes attached to a router, with a third node trying to
    *    connect to one of them)
    *
    * Could (probably should) also create networks that look like this:
    *
    * 1) n -> N = n
    *    (two nodes attached to each other, with a third node trying to
    *    connect to one of them)
    * 2) n -> N <- n
    *    (two nodes trying to connect to a third node)
    */
  describe("router network with peripheral connection", function () {

    beforeEach(function () {
      NetSimTestUtils.initializeGlobalsToDefaultValues();
      testShard = fakeShard();

      alphaNode = makeRemoteClient('alpha');
      betaNode = makeRemoteClient('beta');
      deltaNode = makeRemoteClient('delta');
      router = makeRemoteRouter();
      var elements = [alphaNode, betaNode, deltaNode, router];

      alphaWire = makeRemoteWire(alphaNode, router, elements);
      betaWire = makeRemoteWire(betaNode, router, elements);
      deltaWire = makeRemoteWire(deltaNode, alphaNode, elements);
      elements = elements.concat([alphaWire, betaWire, deltaWire]);

      var netsim = new NetSim();
      netSimVis = new NetSimVisualization(makeSVGElement(), netsim.runLoop_);
      netSimVis.elements_ = elements;
      netSimVis.localNode = alphaNode;
    });

    it("correctly retrieves all attached wires", function () {
      var alphaWires = netSimVis.getWiresAttachedToNode(alphaNode);
      assert.sameMembers(alphaWires, [alphaWire, deltaWire]);

      var routerWires = netSimVis.getWiresAttachedToNode(router);
      assert.sameMembers(routerWires, [alphaWire, betaWire]);
    });

    it("correctly retrieves all locally attached wires", function () {
      var alphaWires = netSimVis.getLocalWiresAttachedToNode(alphaNode);
      assert.sameMembers(alphaWires, [alphaWire]);

      var routerWires = netSimVis.getLocalWiresAttachedToNode(router);
      assert.sameMembers(routerWires, []);
    });

    it("correctly retrieves all reciprocated wires", function () {
      var alphaWires = netSimVis.getReciprocatedWiresAttachedToNode(alphaNode);
      assert.sameMembers(alphaWires, [alphaWire]);

      var betaWires = netSimVis.getReciprocatedWiresAttachedToNode(betaNode);
      assert.sameMembers(betaWires, [betaWire]);

      var deltaWires = netSimVis.getReciprocatedWiresAttachedToNode(deltaNode);
      assert.sameMembers(deltaWires, []);

      var routerWires = netSimVis.getReciprocatedWiresAttachedToNode(router);
      assert.sameMembers(routerWires, [alphaWire, betaWire]);
    });

    it("pulls the correct elements to the foreground", function () {
      netSimVis.pullElementsToForeground();

      // Foreground elements
      assert.isTrue(alphaNode.isForeground);
      assert.isTrue(betaNode.isForeground);
      assert.isTrue(router.isForeground);
      assert.isTrue(alphaWire.isForeground);
      assert.isTrue(betaWire.isForeground);

      // background elements
      assert.isFalse(deltaNode.isForeground);
      assert.isFalse(deltaWire.isForeground);
    });

    describe ("DNS Mode", function () {

      it ("updates all viznodes when DNS mode changes", function () {
        netSimVis.setDnsMode(DnsMode.AUTOMATIC);
        assert.equal(DnsMode.AUTOMATIC, alphaNode.dnsMode_);
        assert.equal(DnsMode.AUTOMATIC, betaNode.dnsMode_);
        assert.equal(DnsMode.AUTOMATIC, deltaNode.dnsMode_);

        netSimVis.setDnsMode(DnsMode.MANUAL);
        assert.equal(DnsMode.MANUAL, alphaNode.dnsMode_);
        assert.equal(DnsMode.MANUAL, betaNode.dnsMode_);
        assert.equal(DnsMode.MANUAL, deltaNode.dnsMode_);
      });

      it ("creates new viznodes with the current DNS mode", function () {
        netSimVis.setDnsMode(DnsMode.AUTOMATIC);
        var newNode = makeRemoteClient('gamma');

        // Trigger visualization update, synchronous in tests.
        testShard.nodeTable.refresh(function (_, data) {
          netSimVis.onNodeTableChange_(data);
        });

        // Check that newly created node has correct DNS mode.
        var gammaNode = netSimVis.getElementByEntityID(NetSimVizSimulationNode,
            newNode.getCorrespondingEntityID());
        assert.equal(DnsMode.AUTOMATIC, gammaNode.dnsMode_);
      });

    });

    describe ("Encodings", function () {
      var DECIMAL_ONLY = [EncodingType.DECIMAL];
      var BINARY_AND_ASCII = [EncodingType.BINARY, EncodingType.ASCII];

      it ("updates all vizwires when encodings change", function () {
        netSimVis.setEncodings(DECIMAL_ONLY);
        assert.sameMembers(DECIMAL_ONLY, alphaWire.encodings_);
        assert.sameMembers(DECIMAL_ONLY, betaWire.encodings_);
        assert.sameMembers(DECIMAL_ONLY, deltaWire.encodings_);

        netSimVis.setEncodings(BINARY_AND_ASCII);
        assert.sameMembers(BINARY_AND_ASCII, alphaWire.encodings_);
        assert.sameMembers(BINARY_AND_ASCII, betaWire.encodings_);
        assert.sameMembers(BINARY_AND_ASCII, deltaWire.encodings_);
      });

      it ("creates new vizwires with the current encodings", function () {
        netSimVis.setEncodings(DECIMAL_ONLY);

        // Confirm that delta has no reciprocal wires.
        var oldWires = netSimVis.getReciprocatedWiresAttachedToNode(deltaNode);
        assert.equal(0, oldWires.length);

        // Connect delta to the router
        makeRemoteWire(deltaNode, router, [deltaNode, router]);

        // Trigger visualization update, synchronous in tests.
        testShard.wireTable.refresh(function (_, data) {
          netSimVis.onWireTableChange_(data);
        });

        // Check that newly created wire has the encodings we originally set.
        var newWires = netSimVis.getReciprocatedWiresAttachedToNode(deltaNode);
        assert.equal(1, newWires.length);
        assert.sameMembers(DECIMAL_ONLY, newWires[0].encodings_);
      });

    });

  });

});
