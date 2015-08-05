'use strict';
/* global describe */
/* global beforeEach */
/* global it */
/* global $ */

var testUtils = require('../util/testUtils');
testUtils.setupLocale('netsim');
var assert = testUtils.assert;
var assertEqual = testUtils.assertEqual;
var netsimTestUtils = require('../util/netsimTestUtils');
var fakeShard = netsimTestUtils.fakeShard;
var assertTableSize = netsimTestUtils.assertTableSize;

var NetSimGlobals = require('@cdo/apps/netsim/netsimGlobals');
var NetSimLocalClientNode = require('@cdo/apps/netsim/NetSimLocalClientNode');
var NetSimWire = require('@cdo/apps/netsim/NetSimWire');
var NetSimVizElement = require('@cdo/apps/netsim/NetSimVizElement');
var NetSimVizNode = require('@cdo/apps/netsim/NetSimVizNode');
var NetSimVizWire = require('@cdo/apps/netsim/NetSimVizWire');
var NetSimVizSimulationNode = require('@cdo/apps/netsim/NetSimVizSimulationNode');
var NetSimVizSimulationWire = require('@cdo/apps/netsim/NetSimVizSimulationWire');

describe("NetSimVizSimulationWire", function () {
  var vizWire, vizLocalNode, vizRemoteNode,
      simWire, localNode, remoteNode, shard;

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
   * Synchronous wire creation on shard for test
   * @param {number} localNodeID
   * @param {number} remoteNodeID
   * @returns {NetSimWire}
   */
  var makeRemoteWire = function (localNodeID, remoteNodeID) {
    var newWire;
    NetSimWire.create(shard, localNodeID, remoteNodeID, function (e, w) {
      newWire = w;
    });
    assert(newWire !== undefined, "Failed to create a remote wire.");
    return newWire;
  };

  var getVizNodeByEntityID = function (_, id) {
    if (vizLocalNode && vizLocalNode.getCorrespondingEntityID() === id) {
      return vizLocalNode;
    } else if (vizRemoteNode && vizRemoteNode.getCorrespondingEntityID() === id) {
      return vizRemoteNode;
    }
    return undefined;
  };

  beforeEach(function () {
    netsimTestUtils.initializeGlobalsToDefaultValues();
    shard = fakeShard();
  });

  describe("defaults", function () {
    beforeEach(function () {
      localNode = makeRemoteClient('Antony');
      remoteNode = makeRemoteClient('Cleopatra');
      simWire = makeRemoteWire(localNode.entityID, remoteNode.entityID);
      vizLocalNode = new NetSimVizSimulationNode(localNode);
      vizRemoteNode = new NetSimVizSimulationNode(remoteNode);
      vizWire = new NetSimVizSimulationWire(simWire, getVizNodeByEntityID);
    });

    it ("is a VizElement", function () {
      assert(vizWire instanceof NetSimVizElement);
    });

    it ("is a VizWire", function () {
      assert(vizWire instanceof NetSimVizWire);
    });

    it ("has default properties", function () {
      assertEqual(0, vizWire.textPosX_);
      assertEqual(0, vizWire.textPosY_);
      assertEqual([], vizWire.encodings_);
      assertEqual(simWire.entityID, vizWire.getCorrespondingEntityID());
      assert(vizLocalNode === vizWire.localVizNode);
      assert(vizRemoteNode === vizWire.remoteVizNode);
    });

    it ("sets addresses on its endpoints", function () {
      assertEqual(undefined, vizLocalNode.address_);
      assertEqual(undefined, vizRemoteNode.address_);
      simWire.localAddress = 'boo';
      simWire.remoteAddress = 'hiss';
      vizWire.configureFrom(simWire);
      assertEqual('boo', vizLocalNode.address_);
      assertEqual('hiss', vizRemoteNode.address_);
    });

    it ("is hidden in broadcast mode", function () {
      NetSimGlobals.getLevelConfig().broadcastMode = true;
      vizWire.configureFrom(simWire);
      assertEqual('none', vizWire.getRoot().css('display'));
    });
  });

});
