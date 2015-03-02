'use strict';
/* global describe */
/* global beforeEach */
/* global it */

var testUtils = require('../util/testUtils');
var assert = testUtils.assert;
var assertEqual = testUtils.assertEqual;
var assertOwnProperty = testUtils.assertOwnProperty;
var netsimTestUtils = require('../util/netsimTestUtils');
var fakeShard = netsimTestUtils.fakeShard;
var assertTableSize = netsimTestUtils.assertTableSize;

var NetSimLogger = testUtils.requireWithGlobalsCheckBuildFolder('netsim/NetSimLogger');
var NetSimRouterNode = testUtils.requireWithGlobalsCheckBuildFolder('netsim/NetSimRouterNode');
var NetSimWire = testUtils.requireWithGlobalsCheckBuildFolder('netsim/NetSimWire');

describe("NetSimRouterNode", function () {
  var testShard;

  beforeEach(function () {
    NetSimLogger.getSingleton().setVerbosity(NetSimLogger.LogLevel.NONE);

    testShard = fakeShard();
  });

  describe("static method get", function () {
    var err, result, routerID;

    beforeEach(function () {
      err = undefined;
      result = undefined;
      routerID = 0;
    });

    it ("returns an Error object when router cannot be found", function () {
      NetSimRouterNode.get(routerID, testShard, function (_err, _result) {
        err = _err;
        result = _result;
      });

      assertEqual(null, result);
      assert(err instanceof Error, "Returned an error object");
      assertEqual('Not Found', err.message);
    });

    it ("returns null for error and a NetSimRouterNode when router is found", function () {
      NetSimRouterNode.create(testShard, function (_err, _router) {
        routerID = _router.entityID;
      });

      NetSimRouterNode.get(routerID, testShard, function(_err, _result) {
        err = _err;
        result = _result;
      });

      assertEqual(null, err);
      assert(result instanceof NetSimRouterNode);
      assertEqual(routerID, result.entityID);
    });
  });

  describe("getConnections", function () {
    var router;

    beforeEach(function () {
      NetSimRouterNode.create(testShard, function (err, newRouter) {
        router = newRouter;
      });
      assert(router !== undefined, "Made a router");
    });

    it ("returns an empty array when no wires are present", function () {
      var wires;
      router.getConnections(function (err, foundWires) {
        wires = foundWires;
      });
      assert(wires !== undefined, "Set wires");
      assertOwnProperty(wires, 'length');
      assertEqual(wires.length, 0);
    });

    it ("returns wires that have a remote end attached to the router", function () {
      NetSimWire.create(testShard, 0, router.entityID, function () {});

      var wires;
      router.getConnections(function (err, foundWires) {
        wires = foundWires;
      });
      assertEqual(wires.length, 1);
    });

    it ("returns NetSimWire objects", function () {
      NetSimWire.create(testShard, 0, router.entityID, function () {});

      var wires;
      router.getConnections(function (err, foundWires) {
        wires = foundWires;
      });
      assert(wires[0] instanceof NetSimWire, "Got a NetSimWire back");
    });

    it ("skips wires that aren't connected to the router", function () {
      NetSimWire.create(testShard, 0, router.entityID, function () {});
      NetSimWire.create(testShard, 0, router.entityID + 1, function () {});

      var wires;
      router.getConnections(function (err, foundWires) {
        wires = foundWires;
      });
      // Only get the one wire back.
      assertEqual(wires.length, 1);
    });
  });

  describe("acceptConnection", function () {
    var connectionLimit = 6;
    var router;

    beforeEach(function () {
      NetSimRouterNode.create(testShard, function (e, r) {
        router = r;
      });
    });

    it ("accepts connection if total connections are at or below limit", function () {
      for (var wireID = router.entityID + 1;
           wireID < router.entityID + connectionLimit + 1;
           wireID++) {
        NetSimWire.create(testShard, wireID, router.entityID, function () {});
      }
      assertTableSize(testShard, 'wireTable', connectionLimit);

      var accepted;
      router.acceptConnection(null, function (err, isAccepted) {
        accepted = isAccepted;
      });

      assertEqual(true, accepted);
    });

    it ("rejects connection if total connections are beyond limit", function () {
      for (var wireID = router.entityID + 1;
           wireID < router.entityID + connectionLimit + 2;
           wireID++) {
        NetSimWire.create(testShard, wireID, router.entityID, function () {});
      }
      assertTableSize(testShard, 'wireTable', connectionLimit + 1);

      var accepted;
      router.acceptConnection(null, function (err, isAccepted) {
        accepted = isAccepted;
      });

      assertEqual(false, accepted);
    });
  });

});
