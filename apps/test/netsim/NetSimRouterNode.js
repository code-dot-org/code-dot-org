'use strict';
/* global describe */
/* global beforeEach */
/* global it */

var testUtils = require('../util/testUtils');
testUtils.setupLocale('netsim');
var assert = testUtils.assert;
var assertEqual = testUtils.assertEqual;
var assertOwnProperty = testUtils.assertOwnProperty;
var assertThrows = testUtils.assertThrows;
var assertWithinRange = testUtils.assertWithinRange;
var netsimTestUtils = require('../util/netsimTestUtils');
var fakeShard = netsimTestUtils.fakeShard;
var assertTableSize = netsimTestUtils.assertTableSize;
var _ = require('lodash');

var NetSimLogger = require('@cdo/apps/netsim/NetSimLogger');
var NetSimRouterNode = require('@cdo/apps/netsim/NetSimRouterNode');
var NetSimLocalClientNode = require('@cdo/apps/netsim/NetSimLocalClientNode');
var NetSimLogEntry = require('@cdo/apps/netsim/NetSimLogEntry');
var NetSimWire = require('@cdo/apps/netsim/NetSimWire');
var Packet = require('@cdo/apps/netsim/Packet');
var NetSimMessage = require('@cdo/apps/netsim/NetSimMessage');
var netsimConstants = require('@cdo/apps/netsim/netsimConstants');
var dataConverters = require('@cdo/apps/netsim/dataConverters');

var addressStringToBinary = dataConverters.addressStringToBinary;
var asciiToBinary = dataConverters.asciiToBinary;
var DnsMode = netsimConstants.DnsMode;
var BITS_PER_BYTE = netsimConstants.BITS_PER_BYTE;
var netsimGlobals = require('@cdo/apps/netsim/netsimGlobals');

describe("NetSimRouterNode", function () {
  var testShard;

  beforeEach(function () {
    NetSimLogger.getSingleton().setVerbosity(NetSimLogger.LogLevel.NONE);
    netsimTestUtils.initializeGlobalsToDefaultValues();
    netsimGlobals.getLevelConfig().broadcastMode = false;

    testShard = fakeShard();
  });

  it("has expected row structure and default values", function () {
    var router = new NetSimRouterNode(testShard);
    var row = router.buildRow();

    assertOwnProperty(row, 'creationTime');
    assertWithinRange(row.creationTime, Date.now(), 10);

    assertOwnProperty(row, 'dnsMode');
    assertEqual(row.dnsMode, DnsMode.NONE);

    assertOwnProperty(row, 'dnsNodeID');
    assertEqual(row.dnsNodeID, undefined);

    assertOwnProperty(row, 'bandwidth');
    assertEqual(row.bandwidth, 'Infinity');

    assertOwnProperty(row, 'memory');
    assertEqual(row.memory, 'Infinity');
  });

  describe("constructing from a table row", function () {
    var router;
    var makeRouter = function (row) {
      return new NetSimRouterNode(testShard, row);
    };

    it ("creationTime", function () {
      router = makeRouter({ creationTime: 42 });
      assertWithinRange(router.creationTime, 42, 10);
    });

    it ("dnsMode", function () {
      router = makeRouter({ dnsMode: DnsMode.AUTOMATIC });
      assertEqual(DnsMode.AUTOMATIC, router.dnsMode);
    });

    it ("dnsNodeID", function () {
      router = makeRouter({ dnsNodeID: 42 });
      assertEqual(42, router.dnsNodeID);
    });

    it ("bandwidth", function () {
      router = makeRouter({ bandwidth: 1024 });
      assertEqual(1024, router.bandwidth);

      // Special case: Bandwidth should be able to serialize in Infinity
      // from the string 'Infinity' in the database.
      router = makeRouter({ bandwidth: 'Infinity' });
      assertEqual(Infinity, router.bandwidth);
    });

    it ("memory", function () {
      router = makeRouter({ memory: 1024 });
      assertEqual(1024, router.memory);

      // Special case: Memory should be able to serialize in Infinity
      // from the string 'Infinity' in the database.
      router = makeRouter({ memory: 'Infinity' });
      assertEqual(Infinity, router.memory);
    });
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

  describe("address assignment rules", function () {
    var router, wire1, wire2, wire3;

    function makeWire(nodeIDOffset) {
      var newWire;
      NetSimWire.create(testShard, router.entityID + nodeIDOffset,
          router.entityID, function (e, w) {
        newWire = w;
      });
      return newWire;
    }

    beforeEach(function () {
      NetSimRouterNode.create(testShard, function (e, r) {
        router = r;
      });

      wire1 = makeWire(1);
      wire2 = makeWire(2);
      wire3 = makeWire(3);

      assertTableSize(testShard, 'wireTable', 3);
    });

    describe("requesting three addresses in simple four-bit format", function () {
      beforeEach(function () {
        netsimGlobals.setRandomSeed('address assignment test');
        netsimGlobals.getLevelConfig().addressFormat = '4';
        router.requestAddress(wire1, 'client1', function () {});
        router.requestAddress(wire2, 'client2', function () {});
        router.requestAddress(wire3, 'client3', function () {});
      });

      it ("assigns passed local hostname to respective wire", function () {
        assertEqual('client1', wire1.localHostname);
        assertEqual('client2', wire2.localHostname);
        assertEqual('client3', wire3.localHostname);
      });

      it ("assigns single-number addresses when using single-number address format", function () {
        assertEqual('11', wire1.localAddress);
        assertEqual('1', wire2.localAddress);
        assertEqual('3', wire3.localAddress);
      });

      it ("assigns own hostname as remote hostname on all wires", function () {
        assertEqual(router.getHostname(), wire1.remoteHostname);
        assertEqual(router.getHostname(), wire2.remoteHostname);
        assertEqual(router.getHostname(), wire3.remoteHostname);
      });

      it ("assigns own address (zero) as remote address on all wires", function () {
        assertEqual('0', router.getAddress());
        assertEqual(router.getAddress(), wire1.remoteAddress);
        assertEqual(router.getAddress(), wire2.remoteAddress);
        assertEqual(router.getAddress(), wire3.remoteAddress);
      });
    });

    describe("requesting three addresses in two-part format", function () {
      beforeEach(function () {
        netsimGlobals.setRandomSeed('another assignment test');
        netsimGlobals.getLevelConfig().addressFormat = '4.4';
        router.requestAddress(wire1, 'client1', function () {});
        router.requestAddress(wire2, 'client2', function () {});
        router.requestAddress(wire3, 'client3', function () {});
      });

      it ("assigns two-part addresses where first part is router number", function () {
        assertEqual(router.entityID + '.2', wire1.localAddress);
        assertEqual(router.entityID + '.6', wire2.localAddress);
        assertEqual(router.entityID + '.7', wire3.localAddress);
      });

      it ("assigns own two-part address (router#.0) as remote address on all wires", function () {
        assertEqual(router.entityID + '.0', router.getAddress());
        assertEqual(router.getAddress(), wire1.remoteAddress);
        assertEqual(router.getAddress(), wire2.remoteAddress);
        assertEqual(router.getAddress(), wire3.remoteAddress);
      });
    });

    describe("requesting three addresses in four-part format", function () {
      beforeEach(function () {
        netsimGlobals.setRandomSeed('a third assignment test');
        netsimGlobals.getLevelConfig().addressFormat = '8.8.8.8';
        router.requestAddress(wire1, 'client1', function () {});
        router.requestAddress(wire2, 'client2', function () {});
        router.requestAddress(wire3, 'client3', function () {});
      });

      it ("uses zeros for all except last two parts", function () {
        // You get higher random addresses here, because of the larger
        // addressable space.
        assertEqual('0.0.' + router.entityID + '.20', wire1.localAddress);
        assertEqual('0.0.' + router.entityID + '.210', wire2.localAddress);
        assertEqual('0.0.' + router.entityID + '.133', wire3.localAddress);
      });

      it ("assigns own four-part address (0.0.router#.0) as remote address", function () {
        assertEqual('0.0.' + router.entityID + '.0', router.getAddress());
        assertEqual(router.getAddress(), wire1.remoteAddress);
        assertEqual(router.getAddress(), wire2.remoteAddress);
        assertEqual(router.getAddress(), wire3.remoteAddress);
      });
    });

    describe("keeping multipart addresses within addressable space", function () {
      function makeRouter() {
        var newRouter;
        NetSimRouterNode.create(testShard, function (e, r) {
          newRouter = r;
        });
        return newRouter;
      }

      it ("leaves router number unchanged for one-part addresses", function () {
        // Four possible router addresses
        netsimGlobals.getLevelConfig().addressFormat = '4';

        var newRouter;
        for (var i = 0; i < 128; i++) {
          newRouter = makeRouter();
          assertEqual(router.entityID, router.getRouterNumber());
        }
      });

      it ("Constrains router number to addressable space", function () {
        // Four possible router addresses
        netsimGlobals.getLevelConfig().addressFormat = '2.8';

        // Initial node starts at entityID 1
        assertEqual(1, router.entityID);
        assertEqual(1, router.getRouterNumber());

        var r2 = makeRouter();
        assertEqual(2, r2.entityID);
        assertEqual(2, r2.getRouterNumber());

        var r3 = makeRouter();
        assertEqual(3, r3.entityID);
        assertEqual(3, r3.getRouterNumber());

        // At 4 (our assignable space) router number wraps to zero
        var r4 = makeRouter();
        assertEqual(4, r4.entityID);
        assertEqual(0, r4.getRouterNumber());

        // Collisions are possible
        var r5 = makeRouter();
        assertEqual(5, r5.entityID);
        assertEqual(1, r5.getRouterNumber());
      });

      it ("Wraps router names/IDs to match the router number", function () {
        // Four possible router addresses
        netsimGlobals.getLevelConfig().addressFormat = '2.8';

        // Initial node starts at entityID 1
        assertEqual(1, router.entityID);
        assertEqual("Router 1", router.getDisplayName());
        assertEqual("1.0", router.getAddress());

        var r2 = makeRouter();
        assertEqual(2, r2.entityID);
        assertEqual("Router 2", r2.getDisplayName());
        assertEqual("2.0", r2.getAddress());

        var r3 = makeRouter();
        assertEqual(3, r3.entityID);
        assertEqual("Router 3", r3.getDisplayName());
        assertEqual("3.0", r3.getAddress());

        // At 4 (our assignable space) router number and address wrap to zero
        var r4 = makeRouter();
        assertEqual(4, r4.entityID);
        assertEqual("Router 0", r4.getDisplayName());
        assertEqual("0.0", r4.getAddress());

        // Collisions are possible
        var r5 = makeRouter();
        assertEqual(5, r5.entityID);
        assertEqual("Router 1", r5.getDisplayName());
        assertEqual("1.0", r5.getAddress());
      });
    });

    describe("random address assignment order", function () {
      var wire4, wire5, wire6, wire7, wire8, wire9, wire10, wire11, wire12,
          wire13, wire14, wire15;

      beforeEach(function () {
        // We need a lot more wires for these tests
        wire4 = makeWire(4);
        wire5 = makeWire(5);
        wire6 = makeWire(6);
        wire7 = makeWire(7);
        wire8 = makeWire(8);
        wire9 = makeWire(9);
        wire10 = makeWire(10);
        wire11 = makeWire(11);
        wire12 = makeWire(12);
        wire13 = makeWire(13);
        wire14 = makeWire(14);
        wire15 = makeWire(15);
      });

      it ("assigns every address in addressable space", function () {
        netsimGlobals.setRandomSeed('Coverage!');
        netsimGlobals.getLevelConfig().addressFormat = '4';
        // Addressable space is 0-15
        // 0 is reserved for the router
        // 15 is reserved for the auto-DNS
        router.requestAddress(wire1, 'client1', function () {});
        assertEqual('1', wire1.localAddress);
        
        router.requestAddress(wire2, 'client2', function () {});
        assertEqual('2', wire2.localAddress);
        
        router.requestAddress(wire3, 'client3', function () {});
        assertEqual('3', wire3.localAddress);

        router.requestAddress(wire4, 'client4', function () {});
        assertEqual('5', wire4.localAddress);

        router.requestAddress(wire5, 'client5', function () {});
        assertEqual('12', wire5.localAddress);

        router.requestAddress(wire6, 'client6', function () {});
        assertEqual('11', wire6.localAddress);

        router.requestAddress(wire7, 'client7', function () {});
        assertEqual('14', wire7.localAddress);

        router.requestAddress(wire8, 'client8', function () {});
        assertEqual('13', wire8.localAddress);

        router.requestAddress(wire9, 'client9', function () {});
        assertEqual('7', wire9.localAddress);

        router.requestAddress(wire10, 'client10', function () {});
        assertEqual('6', wire10.localAddress);

        router.requestAddress(wire11, 'client11', function () {});
        assertEqual('4', wire11.localAddress);

        router.requestAddress(wire12, 'client12', function () {});
        assertEqual('8', wire12.localAddress);

        router.requestAddress(wire13, 'client13', function () {});
        assertEqual('10', wire13.localAddress);

        router.requestAddress(wire14, 'client14', function () {});
        assertEqual('9', wire14.localAddress);

        // At this point we've exhausted the address space,
        // so the address is left "undefined"
        // Might want a different behavior in the future for this,
        // but low router capacity limits mean this won't happen in
        // production, for now.
        router.requestAddress(wire15, 'client15', function () {});
        assertEqual(undefined, wire15.localAddress);
      });

      it ("can assign addresses in a different order", function () {
        netsimGlobals.setRandomSeed('Variety');
        netsimGlobals.getLevelConfig().addressFormat = '4';

        router.requestAddress(wire1, 'client1', function () {});
        assertEqual('4', wire1.localAddress);

        router.requestAddress(wire2, 'client2', function () {});
        assertEqual('10', wire2.localAddress);

        router.requestAddress(wire3, 'client3', function () {});
        assertEqual('2', wire3.localAddress);

        router.requestAddress(wire4, 'client4', function () {});
        assertEqual('1', wire4.localAddress);

        router.requestAddress(wire5, 'client5', function () {});
        assertEqual('3', wire5.localAddress);

        router.requestAddress(wire6, 'client6', function () {});
        assertEqual('9', wire6.localAddress);

        router.requestAddress(wire7, 'client7', function () {});
        assertEqual('11', wire7.localAddress);

        router.requestAddress(wire8, 'client8', function () {});
        assertEqual('6', wire8.localAddress);

        router.requestAddress(wire9, 'client9', function () {});
        assertEqual('13', wire9.localAddress);

        router.requestAddress(wire10, 'client10', function () {});
        assertEqual('14', wire10.localAddress);

        router.requestAddress(wire11, 'client11', function () {});
        assertEqual('12', wire11.localAddress);

        router.requestAddress(wire12, 'client12', function () {});
        assertEqual('5', wire12.localAddress);

        router.requestAddress(wire13, 'client13', function () {});
        assertEqual('8', wire13.localAddress);

        router.requestAddress(wire14, 'client14', function () {});
        assertEqual('7', wire14.localAddress);
      });

      it ("shrinks addressable space according to address format", function () {
        netsimGlobals.setRandomSeed('Variety');
        netsimGlobals.getLevelConfig().addressFormat = '2';

        // Two-bit addresses, so four options, and "00" is used by the router.

        router.requestAddress(wire1, 'client1', function () { });
        assertEqual('1', wire1.localAddress);

        router.requestAddress(wire2, 'client2', function () { });
        assertEqual('3', wire2.localAddress);

        router.requestAddress(wire3, 'client3', function () { });
        assertEqual('2', wire3.localAddress);

        // No more room!
        router.requestAddress(wire4, 'client4', function () {});
        assertEqual(undefined, wire4.localAddress);
      });

      it ("grows addressable space according to address format", function () {
        netsimGlobals.setRandomSeed('Variety');
        netsimGlobals.getLevelConfig().addressFormat = '8';

        // 8-bit addresses, so they go up to 255
        // We won't try to show every case.

        router.requestAddress(wire1, 'client1', function () { });
        assertEqual('69', wire1.localAddress);

        router.requestAddress(wire2, 'client2', function () { });
        assertEqual('173', wire2.localAddress);

        router.requestAddress(wire3, 'client3', function () { });
        assertEqual('29', wire3.localAddress);
      });
    });

  });

  describe("message routing rules", function () {
    var packetHeaderSpec, router, localClient, remoteA, encoder;

    var getRows = function (shard, table) {
      var rows;
      shard[table].readAll(function (err, result) {
        rows = result;
      });
      return rows;
    };

    var assertFirstMessageHeader = function (headerType, expectedValue) {
      var messages = getRows(testShard, 'messageTable');
      if (messages.length === 0) {
        throw new Error("No rows in message table, unable to check first message.");
      }

      var headerValue;
      if (Packet.isAddressField(headerType)) {
        headerValue = encoder.getHeaderAsAddressString(headerType, messages[0].payload);
      } else {
        headerValue = encoder.getHeaderAsInt(headerType, messages[0].payload);
      }

      assert(_.isEqual(headerValue, expectedValue), "Expected first message " +
      headerType + " header to be " + expectedValue + ", but got " +
      headerValue);
    };

    var assertFirstMessageAsciiBody = function (expectedValue) {
      var messages = getRows(testShard, 'messageTable');
      if (messages.length === 0) {
        throw new Error("No rows in message table, unable to check first message.");
      }

      var bodyAscii = encoder.getBodyAsAscii(messages[0].payload, BITS_PER_BYTE);

      assert(_.isEqual(bodyAscii, expectedValue), "Expected first message " +
      "body to be '" + expectedValue + "', but got '" + bodyAscii + "'");
    };

    var assertFirstMessageProperty = function (propertyName, expectedValue) {
      var messages = getRows(testShard, 'messageTable');
      if (messages.length === 0) {
        throw new Error("No rows in message table, unable to check first message.");
      }

      assert(_.isEqual(messages[0][propertyName], expectedValue),
          "Expected first message." + propertyName + " to be " +
          expectedValue + ", but got " + messages[0][propertyName]);
    };

    beforeEach(function () {
      // Spec reversed in test vs production to show that it's flexible
      packetHeaderSpec = [
        Packet.HeaderType.FROM_ADDRESS,
        Packet.HeaderType.TO_ADDRESS
      ];
      netsimGlobals.getLevelConfig().addressFormat = '4';
      netsimGlobals.getLevelConfig().packetCountBitWidth = 0;
      netsimGlobals.getLevelConfig().routerExpectsPacketHeader = packetHeaderSpec;
      encoder = new Packet.Encoder('4', 0, packetHeaderSpec);

      // Make router
      NetSimRouterNode.create(testShard, function (e, r) {
        router = r;
      });

      // Make clients
      NetSimLocalClientNode.create(testShard, "localClient", function (e, n) {
        localClient = n;
      });

      NetSimLocalClientNode.create(testShard, "remoteA", function (e, n) {
        remoteA = n;
      });

      // Tell router to simulate for local node
      router.initializeSimulation(localClient.entityID);

      // Manually connect nodes
      var wire;
      NetSimWire.create(testShard, localClient.entityID, router.entityID, function(e, w) {
        wire = w;
      });
      wire.localHostname = localClient.getHostname();
      wire.localAddress = '1';
      wire.remoteAddress = '0';
      wire.update();
      localClient.myWire = wire;

      NetSimWire.create(testShard, remoteA.entityID, router.entityID, function (e, w) {
        wire = w;
      });
      wire.localHostname = remoteA.getHostname();
      wire.localAddress = '2';
      wire.remoteAddress = '0';
      wire.update();
      remoteA.myWire = wire;

      var addressTable = router.getAddressTable();
      assertEqual(addressTable.length, 2);
      assertEqual(addressTable[0].isLocal, true);
      localClient.address = addressTable[0].address;
      remoteA.address = addressTable[1].address;

      // Make sure router initial time is zero
      router.tick({time: 0});
    });

    it ("ignores messages sent to itself from other clients", function () {
      var from = remoteA.entityID;
      var to = router.entityID;
      NetSimMessage.send(testShard, from, to, from, 'garbage', function () {});
      assertTableSize(testShard, 'logTable', 0);
      assertFirstMessageProperty('fromNodeID', from);
      assertFirstMessageProperty('toNodeID', to);
    });

    it ("ignores messages sent to others", function () {
      var from = localClient.entityID;
      var to = remoteA.entityID;
      NetSimMessage.send(testShard, from, to, from, 'garbage', function () {});
      assertTableSize(testShard, 'messageTable', 1);
      assertTableSize(testShard, 'logTable', 0);
      assertFirstMessageProperty('fromNodeID', from);
      assertFirstMessageProperty('toNodeID', to);
    });

    it ("does not forward malformed packets", function () {
      var from = localClient.entityID;
      var to = router.entityID;
      // Here, the payload gets 'cleaned' down to empty string, then treated
      // as zero when parsing the toAddress.
      NetSimMessage.send(testShard, from, to, from, 'garbage', function () {});

      // Router must tick to process messages; 1000ms is sufficient time for
      // a short packet.
      router.tick({time: 1000});

      assertTableSize(testShard, 'messageTable', 0);
      assertTableSize(testShard, 'logTable', 1);
    });

    it ("does not forward packets with no match in the local network", function () {
      var fromNodeID = localClient.entityID;
      var toNodeID = router.entityID;

      var payload = encoder.concatenateBinary({
        toAddress: '1111',
        fromAddress: '1111'
      }, 'messageBody');

      NetSimMessage.send(testShard, fromNodeID, toNodeID, fromNodeID, payload,
          function () {});

      // Router must tick to process messages; 1000ms is sufficient time for
      // a short packet.
      router.tick({time: 1000});

      assertTableSize(testShard, 'messageTable', 0);
      assertTableSize(testShard, 'logTable', 1);
    });

    it ("forwards packets when the toAddress is found in the network", function () {
      var fromNodeID = localClient.entityID;
      var toNodeID = router.entityID;
      var fromAddress = localClient.address;
      var toAddress = remoteA.address;

      var payload = encoder.concatenateBinary({
        toAddress: addressStringToBinary(toAddress, netsimGlobals.getLevelConfig().addressFormat),
        fromAddress: addressStringToBinary(fromAddress, netsimGlobals.getLevelConfig().addressFormat)
      }, 'messageBody');

      NetSimMessage.send(testShard, fromNodeID, toNodeID,fromNodeID, payload,
          function () {});

      // Router must tick to process messages; 1000ms is sufficient time for
      // a short packet.
      router.tick({time: 1000});

      assertTableSize(testShard, 'messageTable', 1);
      assertTableSize(testShard, 'logTable', 1);

      // Verify that message from/to node IDs are correct
      assertFirstMessageProperty('fromNodeID', router.entityID);
      assertFirstMessageProperty('toNodeID', remoteA.entityID);
    });


    describe ("broadcast mode", function () {
      var remoteB;

      beforeEach(function () {
        // Put level in broadcast mode
        netsimGlobals.getLevelConfig().broadcastMode = true;

        NetSimLocalClientNode.create(testShard, "remoteB", function (e, n) {
          remoteB = n;
        });

        // Manually connect nodes
        var wire;
        NetSimWire.create(testShard, remoteB.entityID, router.entityID, function (e, w) {
          wire = w;
        });
        wire.localHostname = remoteB.getHostname();
        remoteB.myWire = wire;
        wire.update();
      });

      it ("forwards all messages it receives to every connected node", function () {
        localClient.sendMessage("00001111", function () {});

        // Router must tick to process messages; 1000ms is sufficient time for
        // a short packet.
        router.tick({time: 1000});

        // Router should log having picked up one message
        assertTableSize(testShard, 'logTable', 1);

        // Message forwarded in triplicate: Back to local, and out to both remotes
        assertTableSize(testShard, 'messageTable', 3);
        assertFirstMessageProperty('fromNodeID', router.entityID);
      });
    });

    describe("Router bandwidth limits", function () {
      var fromNodeID, toNodeID, fromAddress, toAddress;

      var sendMessageOfSize = function (messageSizeBits) {
        var payload = encoder.concatenateBinary({
          toAddress: addressStringToBinary(toAddress, netsimGlobals.getLevelConfig().addressFormat),
          fromAddress: addressStringToBinary(fromAddress, netsimGlobals.getLevelConfig().addressFormat)
        }, '0'.repeat(messageSizeBits - 8));

        NetSimMessage.send(testShard, fromNodeID, toNodeID, fromNodeID, payload,
            function () {});
      };

      beforeEach(function () {
        fromNodeID = localClient.entityID;
        toNodeID = router.entityID;
        fromAddress = localClient.address;
        toAddress = remoteA.address;

        // Establish time baseline of zero
        router.tick({time: 0});
        assertTableSize(testShard, 'logTable', 0);
      });

      it ("requires variable time to forward packets based on bandwidth", function () {
        router.bandwidth = 1000; // 1 bit / ms

        // Router detects message immediately, but does not send it until
        // enough time has passed to send the message based on bandwidth
        sendMessageOfSize(1008);

        // Message still has not been sent at 1007ms
        router.tick({time: 1007});
        assertTableSize(testShard, 'logTable', 0);

        // At 1000bps, it should take 1008ms to send 1008 bits
        router.tick({time: 1008});
        assertTableSize(testShard, 'logTable', 1);
      });

      it ("respects bandwidth setting", function () {
        // 0.1 bit / ms, so 10ms / bit
        router.bandwidth = 100;

        // This message should be sent at t=200
        sendMessageOfSize(20);

        // Message is sent at t=200
        router.tick({time: 199});
        assertTableSize(testShard, 'logTable', 0);
        router.tick({time: 200});
        assertTableSize(testShard, 'logTable', 1);
      });

      it ("routes packet on first tick if bandwidth is infinite", function () {
        router.bandwidth = Infinity;

        // Message is detected immediately, though that's not obvious here.
        sendMessageOfSize(1008);

        // At infinite bandwidth, router forwards message even though zero
        // time has passed.
        router.tick({time: 0});
        assertTableSize(testShard, 'logTable', 1);
      });

      it ("routes 'batches' of packets when multiple packets fit in the bandwidth", function () {
        router.bandwidth = 1000; // 1 bit / ms

        // Router should schedule these all as soon as they show up, for
        // 40, 80 and 120 ms respectively (due to the 0.1 bit per ms rate)
        sendMessageOfSize(40);
        sendMessageOfSize(40);
        sendMessageOfSize(40);

        // On this tick, two messages should get forwarded because enough
        // time has passed for them both to be sent given our current bandwidth.
        router.tick({time: 80});
        assertTableSize(testShard, 'logTable', 2);

        // On this final tick, the third message should be sent
        router.tick({time: 120});
        assertTableSize(testShard, 'logTable', 3);
      });

      // This test and the one below it are an interesting case. It may seem
      // silly to test skipping the tick to 80, or having it happen at 40, but
      // this is exactly what could happen with a very low framerate and/or a
      // very high bandwidth.
      //
      // We use pessimistic estimates so that when we are batching messages we
      // are looking at "the very latest this message would be finished
      // sending" and we can grab all the messages we are SURE are done.
      // Here, we're modeling an expected error; the second message could be
      // done at t=80, but it also might not be, so we don't send it yet.
      // We only have enough information to be sure it will be done by t=110.
      //
      // In the next test case, sending the first message at t=40 introduces
      // information that reduces our pessimistic estimate for the second
      // message to t=80. You might argue that same information exists in
      // this first test case, and it does - but it wouldn't if the first
      // message was being simulated by a remote client.
      it ("is pessimistic when scheduling new packets", function () {
        router.bandwidth = 1000; // 1 bit / ms

        // Router 'starts sending' this message now, expected to finish
        // at t=40
        sendMessageOfSize(40);

        // At t=30, we do schedule another message
        // You might think this one is scheduled for t=80, but because
        // we can't see partial progress from other clients we assume the
        // worst and schedule it for t=110 (30 + 40 + 40)
        router.tick({time: 30});
        sendMessageOfSize(40);

        // Jumping to t=80, we see that only one message is sent.  If we'd
        // been using optimistic scheduling, we would have sent both.})
        router.tick({time: 80});
        assertTableSize(testShard, 'logTable', 1);

        // At this point the simulation considers rescheduling the next message.
        // Its new pessimistic estimate is t=120 (80{now} + 40{size}) but
        // we go with the previous estimate of t=110 since it was better.

        // At t=110, the second message is sent
        router.tick({time: 109});
        assertTableSize(testShard, 'logTable', 1);
        router.tick({time: 110});
        assertTableSize(testShard, 'logTable', 2);
      });

      it ("normally corrects pessimistic estimates with rescheduling", function () {
        router.bandwidth = 1000; // 1 bit / ms

        // Router 'starts sending' this message now, expected to finish
        // at t=40
        sendMessageOfSize(40);

        // Again, at t=30, we schedule another message
        // We schedule pessimistically, for t=110
        router.tick({time: 30});
        sendMessageOfSize(40);

        // Unlike the last test, we tick at exactly t=40 and send the first
        // message right on schedule.
        router.tick({time: 39});
        assertTableSize(testShard, 'logTable', 0);
        router.tick({time: 40});
        assertTableSize(testShard, 'logTable', 1);

        // This triggers a reschedule for the previous message;
        // its new pessimistic estimate says that it can be sent at t=80,
        // which is better than the previous t=110 estimate.

        // At t=80, the second message is sent
        router.tick({time: 79});
        assertTableSize(testShard, 'logTable', 1);
        router.tick({time: 80});
        assertTableSize(testShard, 'logTable', 2);
      });

      it ("adjusts routing schedule when router bandwidth changes", function () {
        router.bandwidth = 1000; // 1 bit / ms

        // Five 100-bit messages, scheduled for t=100-500 respectively.
        sendMessageOfSize(100);
        sendMessageOfSize(100);
        sendMessageOfSize(100);
        sendMessageOfSize(100);
        sendMessageOfSize(100);

        // First message processed at t=100
        router.tick({time: 99});
        assertTableSize(testShard, 'logTable', 0);
        router.tick({time: 100});
        assertTableSize(testShard, 'logTable', 1);

        // Advance halfway through processing the second message
        router.tick({time: 150});
        assertTableSize(testShard, 'logTable', 1);

        // Increase the router bandwidth
        router.setBandwidth(10000); // 10 bits / ms

        // This triggers a reschedule; since NOW is 150 and each message now
        // takes 10 ms to process, the new schedule is:
        // 2: 160
        // 3: 170
        // 4: 180
        // 5: 190

        // Message 2 processed at t=160
        router.tick({time: 159});
        assertTableSize(testShard, 'logTable', 1);
        router.tick({time: 160});
        assertTableSize(testShard, 'logTable', 2);

        // Message 3 processed at t=170
        router.tick({time: 169});
        assertTableSize(testShard, 'logTable', 2);
        router.tick({time: 170});
        assertTableSize(testShard, 'logTable', 3);

        // Increase the bandwidth again
        router.setBandwidth(100000); // 100 bits / ms

        // New schedule (NOW=170, 1ms per message)
        // 4: 171
        // 5: 172

        // Message 4 processed at t=171
        router.tick({time: 170.9});
        assertTableSize(testShard, 'logTable', 3);
        router.tick({time: 171.0});
        assertTableSize(testShard, 'logTable', 4);

        // Message 5 processed at t=172
        router.tick({time: 171.9});
        assertTableSize(testShard, 'logTable', 4);
        router.tick({time: 172.0});
        assertTableSize(testShard, 'logTable', 5);
      });

      it ("drops packets after ten minutes in the router queue", function () {
        router.bandwidth = 1000; // 1 bit / ms
        var tenMinutesInMillis = 600000;

        // Send a message that will take ten minutes + 1 millisecond to process.
        sendMessageOfSize(tenMinutesInMillis + 1);
        assertTableSize(testShard, 'messageTable', 1);
        assertTableSize(testShard, 'logTable', 0);

        // At almost ten minutes, the message should still be present
        router.tick({time: tenMinutesInMillis - 1});
        assertTableSize(testShard, 'messageTable', 1);
        assertTableSize(testShard, 'logTable', 0);

        // At exactly ten minutes, the message should expire and be removed
        // and no related logging occurs
        router.tick({time: tenMinutesInMillis});
        assertTableSize(testShard, 'messageTable', 0);
        assertTableSize(testShard, 'logTable', 0);

        // Thus, just after ten minutes, no message is routed.
        router.tick({time: tenMinutesInMillis + 1});
        assertTableSize(testShard, 'messageTable', 0);
        assertTableSize(testShard, 'logTable', 0);
      });

      it ("smaller packets can expire if backed up behind large ones", function () {
        router.bandwidth = 1000; // 1 bit / ms
        var oneMinuteInMillis = 60000;

        // This message should take nine minutes to process, so it will be sent.
        sendMessageOfSize(9 * oneMinuteInMillis);
        // This one only takes two minutes to process, but because it's behind
        // the nine-minute one it will expire
        sendMessageOfSize(2 * oneMinuteInMillis);
        // This one is tiny and should take a fraction of a second, but it will
        // also expire since it's after the first two.
        sendMessageOfSize(16);

        // Initially, all three messages are in the queue
        assertTableSize(testShard, 'messageTable', 3);
        assertTableSize(testShard, 'logTable', 0);

        // At almost ten minutes the first message has been forwarded, and
        // the other two are still enqueued.
        router.tick({time: 10 * oneMinuteInMillis - 1});
        assertTableSize(testShard, 'messageTable', 3);
        assertTableSize(testShard, 'logTable', 1);

        // At exactly ten minutes, messages two and three are expired and deleted.
        router.tick({time: 10 * oneMinuteInMillis});
        assertTableSize(testShard, 'messageTable', 1);
        assertTableSize(testShard, 'logTable', 1);
      });

      it ("removing expired packets allows packets further down the queue to be processed sooner", function () {
        router.bandwidth = 1000; // 1 bit / ms
        var oneMinuteInMillis = 60000;

        // These messages will both expire, since before processing of the
        // first one completes they will both be over 10 minutes old.
        sendMessageOfSize(12 * oneMinuteInMillis);
        sendMessageOfSize(3 * oneMinuteInMillis);
        assertTableSize(testShard, 'messageTable', 2);
        assertTableSize(testShard, 'logTable', 0);

        // Advance to 9 minutes.  Nothing has happened yet.
        router.tick({time: 9 * oneMinuteInMillis});
        assertTableSize(testShard, 'messageTable', 2);
        assertTableSize(testShard, 'logTable', 0);

        // Here we add a 1-minute message.  Since the others still exist,
        // and we use pessimistic scheduling, this one is initially scheduled
        // to finish at (9 + 12 + 3 + 1) = 25 minutes, meaning it would expire
        // as well.
        sendMessageOfSize(oneMinuteInMillis);
        assertTableSize(testShard, 'messageTable', 3);
        assertTableSize(testShard, 'logTable', 0);

        // At 10 minutes, the first two messages expire.
        router.tick({time: 10 * oneMinuteInMillis});
        assertTableSize(testShard, 'messageTable', 1);
        assertTableSize(testShard, 'logTable', 0);
        router.tick({time: 10 * oneMinuteInMillis + 1});

        // This SHOULD allow the third message to complete at 11 minutes
        // instead of at 25.
        router.tick({time: 11 * oneMinuteInMillis - 1});
        assertTableSize(testShard, 'messageTable', 1);
        assertTableSize(testShard, 'logTable', 0);

        router.tick({time: 11 * oneMinuteInMillis});
        assertTableSize(testShard, 'messageTable', 1);
        assertTableSize(testShard, 'logTable', 1);
      });
    });

    describe("Router memory limits", function () {
      var sendMessageOfSize = function (messageSizeBits) {
        var payload = encoder.concatenateBinary({
          toAddress: addressStringToBinary(remoteA.address, netsimGlobals.getLevelConfig().addressFormat),
          fromAddress: addressStringToBinary(localClient.address, netsimGlobals.getLevelConfig().addressFormat)
        }, '0'.repeat(messageSizeBits - 8));

        NetSimMessage.send(testShard, localClient.entityID, router.entityID,
            localClient.entityID, payload, function () {});
      };

      var assertRouterQueueSize = function (expectedQueueSizeBits) {
        var queueSize = getRows(testShard, 'messageTable').filter(function (m) {
          return m.toNodeID === router.entityID;
        }).map(function (m) {
          return m.payload.length;
        }).reduce(function (p, c) {
          return p + c;
        }, 0);
        assert(expectedQueueSizeBits === queueSize, "Expected router queue to " +
            "contain " + expectedQueueSizeBits + " bits, but it contained " +
            queueSize + " bits");
      };

      var assertHowManyDropped = function (expectedDropCount) {
        var droppedPackets = getRows(testShard, 'logTable').map(function (l) {
          return l.status === NetSimLogEntry.LogStatus.DROPPED ? 1 : 0;
        }).reduce(function (p, c) {
          return p + c;
        }, 0);
        assert(droppedPackets === expectedDropCount, "Expected that " +
            expectedDropCount + " packets would be dropped, " +
            "but logs only report " + droppedPackets + "dropped packets");
      };

      beforeEach(function () {
        // Establish time baseline of zero
        router.tick({time: 0});
        router.bandwidth = Infinity;
        router.memory = 64 * 8; // 64 bytes
        assertTableSize(testShard, 'logTable', 0);
      });

      it ("allows messages that fit in router memory", function () {
        // Exact fit is okay
        // Log table is empty because routing is not complete
        sendMessageOfSize(64 * 8);
        assertTableSize(testShard, 'messageTable', 1);
        assertRouterQueueSize(64 * 8);
        assertHowManyDropped(0);
      });

      it ("rejects messages that exceed router memory", function () {
        // Over by one bit gets dropped!
        // Adds a log entry with a "dropped" status, or some such.
        sendMessageOfSize(64 * 8 + 1);
        assertTableSize(testShard, 'messageTable', 0);
        assertRouterQueueSize(0);
        assertHowManyDropped(1);
      });

      it ("rejects messages when they would put queue over its limit", function () {
        // Three messages: 62 bytes, 2 bytes, 4 bytes
        sendMessageOfSize(62 * 8);
        sendMessageOfSize(2 * 8);
        sendMessageOfSize(4 * 8);

        // The second message should JUST fit, the third message should drop
        assertTableSize(testShard, 'messageTable', 2);
        assertRouterQueueSize(64 * 8);
        assertHowManyDropped(1);
      });

      it ("accepts messages queued beyond memory limit if clearing packets ahead" +
          "of them allows them to fit in memory", function () {
        // Three messages: 4 bytes, 64 bytes, 2 bytes
        sendMessageOfSize(4 * 8);
        sendMessageOfSize(62 * 8);
        sendMessageOfSize(2 * 8);

        // The second message should drop, but the third message should fit
        // because the second message was dropped.
        assertTableSize(testShard, 'messageTable', 2);
        assertRouterQueueSize(6 * 8);
        assertHowManyDropped(1);
      });

      it ("can drop multiple packets queued beyond memory limit", function () {
        sendMessageOfSize(63 * 8);
        sendMessageOfSize(2 * 8);
        sendMessageOfSize(4 * 8);
        sendMessageOfSize(8 * 8);
        sendMessageOfSize(16 * 8);

        // Only the first message should stay, all the others should drop
        assertTableSize(testShard, 'messageTable', 1);
        assertRouterQueueSize(63 * 8);
        assertHowManyDropped(4);
      });

      it ("drops packets when memory capacity is reduced below queue size", function () {
        sendMessageOfSize(16 * 8);
        sendMessageOfSize(16 * 8);
        sendMessageOfSize(16 * 8);

        // All three should fit in our 64-byte memory
        assertTableSize(testShard, 'messageTable', 3);
        assertRouterQueueSize(48 * 8);
        assertHowManyDropped(0);

        // Cut router memory in half, to 32 bytes.
        router.setMemory(32 * 8);

        // This should kick the third message out of memory (but the second
        // should just barely fit.
        assertTableSize(testShard, 'messageTable', 2);
        assertRouterQueueSize(32 * 8);
        assertHowManyDropped(1);
      });

      it ("can drop multiple packets when memory capacity is reduced below" +
          " queue size", function () {
        sendMessageOfSize(20 * 8);
        sendMessageOfSize(20 * 8);
        sendMessageOfSize(8 * 8);

        // All three should fit in our 64-byte memory
        assertTableSize(testShard, 'messageTable', 3);
        assertRouterQueueSize(48 * 8);
        assertHowManyDropped(0);

        // Cut router memory to 32 bytes.
        router.setMemory(16 * 8);

        // This should kick the first and second messages out of memory, but
        // the third message should fit.
        assertTableSize(testShard, 'messageTable', 1);
        assertRouterQueueSize(8 * 8);
        assertHowManyDropped(2);
      });

      it ("getMemoryInUse() reports correct memory usage", function () {
        router.setMemory(Infinity);
        assertRouterQueueSize(0);
        assertEqual(0, router.getMemoryInUse());

        sendMessageOfSize(64 * 8);
        assertRouterQueueSize(64 * 8);
        assertEqual(64 * 8, router.getMemoryInUse());

        sendMessageOfSize(8);
        sendMessageOfSize(8);
        sendMessageOfSize(8);
        sendMessageOfSize(8);
        sendMessageOfSize(8);
        sendMessageOfSize(8);
        assertRouterQueueSize(70 * 8);
        assertEqual(70 * 8, router.getMemoryInUse());

        router.setMemory(32 * 8);
        assertHowManyDropped(1);
        assertRouterQueueSize(6 * 8);
        assertEqual(6 * 8, router.getMemoryInUse());
      });

    });

    describe("Auto-DNS behavior", function () {
      // Reserved auto-dns address, for now.
      var autoDnsAddress = '15';

      var sendToAutoDns = function (fromNode, asciiPayload) {
        var payload = encoder.concatenateBinary({
          toAddress: addressStringToBinary(autoDnsAddress, netsimGlobals.getLevelConfig().addressFormat),
          fromAddress: addressStringToBinary(fromNode.address, netsimGlobals.getLevelConfig().addressFormat)
        },  asciiToBinary(asciiPayload, BITS_PER_BYTE));
        NetSimMessage.send(testShard, fromNode.entityID, router.entityID,
            fromNode.entityID, payload, function () {});
      };

      beforeEach(function () {
        router.setDnsMode(DnsMode.AUTOMATIC);
        router.tick({time: 0});
      });

      it ("can round-trip to auto-DNS service and back",function () {
        sendToAutoDns(localClient, '');

        // No routing has occurred yet; our original message is still in the table.
        assertTableSize(testShard, 'logTable', 0);
        assertTableSize(testShard, 'messageTable', 1);
        assertFirstMessageProperty('fromNodeID', localClient.entityID);
        assertFirstMessageProperty('toNodeID', router.entityID);
        assertFirstMessageProperty('simulatedBy', localClient.entityID);
        assertFirstMessageHeader(Packet.HeaderType.TO_ADDRESS, autoDnsAddress);
        assertFirstMessageHeader(Packet.HeaderType.FROM_ADDRESS, localClient.address);

        // On first tick (at infinite bandwidth) message should be routed to
        // auto-DNS service.
        router.tick({time: 1});
        // That message should look like this:
        //   fromNodeID   : router.entityID
        //   toNodeID     : router.entityID
        //   simulatedBy  : localClient.entityID
        //   TO_ADDRESS   : autoDnsAddress
        //   FROM_ADDRESS : localClient.address
        // But on the same tick, the auto-DNS immediately picks up that message
        // and generates a response:
        assertTableSize(testShard, 'logTable', 1);
        assertTableSize(testShard, 'messageTable', 1);
        assertFirstMessageProperty('fromNodeID', router.entityID);
        assertFirstMessageProperty('toNodeID', router.entityID);
        assertFirstMessageProperty('simulatedBy', localClient.entityID);
        assertFirstMessageHeader(Packet.HeaderType.TO_ADDRESS, localClient.address);
        assertFirstMessageHeader(Packet.HeaderType.FROM_ADDRESS, autoDnsAddress);

        // On second tick, router forwards DNS response back to client
        router.tick({time: 2});
        assertTableSize(testShard, 'logTable', 2);
        assertTableSize(testShard, 'messageTable', 1);
        assertFirstMessageProperty('fromNodeID', router.entityID);
        assertFirstMessageProperty('toNodeID', localClient.entityID);
        assertFirstMessageProperty('simulatedBy', localClient.entityID);
        assertFirstMessageHeader(Packet.HeaderType.TO_ADDRESS, localClient.address);
        assertFirstMessageHeader(Packet.HeaderType.FROM_ADDRESS, autoDnsAddress);
      });

      it ("ignores auto-DNS messages from remote clients", function () {
        sendToAutoDns(remoteA, '');

        // No routing has occurred yet; our original message is still in the table.
        assertTableSize(testShard, 'logTable', 0);
        assertTableSize(testShard, 'messageTable', 1);
        var originalMessages = getRows(testShard, 'messageTable');

        router.tick({time: 1});

        // Still, no routing has occurred
        assertTableSize(testShard, 'logTable', 0);
        assertTableSize(testShard, 'messageTable', 1);
        assertEqual(originalMessages, getRows(testShard, 'messageTable'));

        router.tick({time: 2});

        // Nothing happens when remote node is not being simulated
        assertTableSize(testShard, 'logTable', 0);
        assertTableSize(testShard, 'messageTable', 1);
        assertEqual(originalMessages, getRows(testShard, 'messageTable'));
      });

      it ("produces a usage message for any badly-formed request", function () {
        sendToAutoDns(localClient, 'Would you tea for stay like to?');

        // Allow time for the response to be generated and routed.
        router.tick({time: 1});
        router.tick({time: 2});

        assertTableSize(testShard, 'messageTable', 1);
        assertFirstMessageAsciiBody("Automatic DNS Node" +
            "\nUsage: GET hostname [hostname [hostname ...]]");
      });

      it ("responds with NOT_FOUND when it can't find the requested hostname", function () {
        sendToAutoDns(localClient, 'GET wagner14');

        // Allow time for the response to be generated and routed.
        router.tick({time: 1});
        router.tick({time: 2});

        assertTableSize(testShard, 'messageTable', 1);
        assertFirstMessageAsciiBody("wagner14:NOT_FOUND");
      });

      it ("responds to well-formed requests with a matching number of responses", function () {
        sendToAutoDns(localClient, 'GET bert ernie');

        // Allow time for the response to be generated and routed.
        router.tick({time: 1});
        router.tick({time: 2});

        assertTableSize(testShard, 'messageTable', 1);
        assertFirstMessageAsciiBody("bert:NOT_FOUND ernie:NOT_FOUND");
      });

      it ("knows its own hostname and address", function () {
        sendToAutoDns(localClient, 'GET dns');

        // Allow time for the response to be generated and routed.
        router.tick({time: 1});
        router.tick({time: 2});

        assertTableSize(testShard, 'messageTable', 1);
        assertFirstMessageAsciiBody("dns:15");
      });

      it ("knows the router hostname and address", function () {
        sendToAutoDns(localClient, 'GET ' + router.getHostname());

        // Allow time for the response to be generated and routed.
        router.tick({time: 1});
        router.tick({time: 2});

        assertTableSize(testShard, 'messageTable', 1);
        assertFirstMessageAsciiBody(router.getHostname() + ':0');
      });

      it ("can look up the client addresses by hostname", function () {
        sendToAutoDns(localClient, 'GET ' +
            localClient.getHostname() + ' ' +
            remoteA.getHostname());

        // Allow time for the response to be generated and routed.
        router.tick({time: 1});
        router.tick({time: 2});

        assertTableSize(testShard, 'messageTable', 1);
        assertFirstMessageAsciiBody(
            localClient.getHostname() + ':' + localClient.address + ' ' +
            remoteA.getHostname() + ':' + remoteA.address);
      });
    });
  });

  describe("routing to other routers", function () {
    var addressFormat, packetHeaderSpec, encoder, routerA, routerB,
        clientA, clientB;

    var getRows = function (shard, table) {
      var rows;
      shard[table].readAll(function (err, result) {
        rows = result;
      });
      return rows;
    };

    var assertFirstMessageAsciiBody = function (expectedValue) {
      var messages = getRows(testShard, 'messageTable');
      if (messages.length === 0) {
        throw new Error("No rows in message table, unable to check first message.");
      }

      var bodyAscii = encoder.getBodyAsAscii(messages[0].payload, BITS_PER_BYTE);

      assert(_.isEqual(bodyAscii, expectedValue), "Expected first message " +
      "body to be '" + expectedValue + "', but got '" + bodyAscii + "'");
    };

    var assertFirstMessageProperty = function (propertyName, expectedValue) {
      var messages = getRows(testShard, 'messageTable');
      if (messages.length === 0) {
        throw new Error("No rows in message table, unable to check first message.");
      }

      assert(_.isEqual(messages[0][propertyName], expectedValue),
          "Expected first message." + propertyName + " to be " +
          expectedValue + ", but got " + messages[0][propertyName]);
    };

    var getLatestLogRow = function () {
      var logs = getRows(testShard, 'logTable');
      if (logs.length === 0) {
        throw new Error("No rows in log table, unbale to retrieve latest message.");
      }

      return logs[logs.length - 1];
    };

    beforeEach(function () {
      // Spec reversed in test vs production to show that it's flexible
      addressFormat = '4.4';
      packetHeaderSpec = [
        Packet.HeaderType.FROM_ADDRESS,
        Packet.HeaderType.TO_ADDRESS
      ];
      netsimGlobals.getLevelConfig().addressFormat = addressFormat;
      netsimGlobals.getLevelConfig().routerExpectsPacketHeader = packetHeaderSpec;
      netsimGlobals.getLevelConfig().connectedRouters = true;
      encoder = new Packet.Encoder(addressFormat, 0, packetHeaderSpec);

      // Make routers
      NetSimRouterNode.create(testShard, function (e, r) {
        routerA = r;
      });

      NetSimRouterNode.create(testShard, function (e, r) {
        routerB = r;
      });

      // Make clients
      NetSimLocalClientNode.create(testShard, "clientA", function (e, n) {
        clientA = n;
      });

      NetSimLocalClientNode.create(testShard, "clientB", function (e, n) {
        clientB = n;
      });

      clientA.initializeSimulation(null, null);
      clientB.initializeSimulation(null, null);

      clientA.connectToRouter(routerA);
      clientB.connectToRouter(routerB);

      // Make sure router initial time is zero
      routerA.tick({time: 0});
      routerB.tick({time: 0});
    });

    it ("inter-router message is dropped when 'connectedRouters' are disabled",
        function () {
      netsimGlobals.getLevelConfig().connectedRouters = false;

      var packetBinary = encoder.concatenateBinary(
          encoder.makeBinaryHeaders({
            toAddress: clientB.getAddress(),
            fromAddress: clientA.getAddress()
          }),
          dataConverters.asciiToBinary('wop'));
      clientA.sendMessage(packetBinary, function () {});

      // t=0; nothing has happened yet
      assertTableSize(testShard, 'logTable', 0);
      assertTableSize(testShard, 'messageTable', 1);
      assertFirstMessageProperty('fromNodeID', clientA.entityID);
      assertFirstMessageProperty('toNodeID', routerA.entityID);

      // t=1; router A picks up message, drops it because it won't route
      //   out of local subnet
      clientA.tick({time: 1000});
      assertTableSize(testShard, 'logTable', 1);
      var logRow = getLatestLogRow();
      assertEqual(routerA.entityID, logRow.nodeID);
      assertEqual(NetSimLogEntry.LogStatus.DROPPED, logRow.status);
      assertEqual(packetBinary, logRow.binary);
      assertTableSize(testShard, 'messageTable', 0);
    });

    it ("can send a message to another router", function () {
      var logRow;

      // This test reads better with slower routing.
      // It lets you see each step, when with Infinite bandwidth you get
      // several things happening on one tick, depending on how simulating
      // routers are registered with each client.
      routerA.setBandwidth(50); // Requires 1 second for routing
      routerB.setBandwidth(25); // Requires 2 seconds for routing, buts starts
                                // on first tick

      var packetBinary = encoder.concatenateBinary(
          encoder.makeBinaryHeaders({
            toAddress: routerB.getAddress(),
            fromAddress: clientA.getAddress()
          }),
          dataConverters.asciiToBinary('flop'));
      clientA.sendMessage(packetBinary, function () {});

      // t=0; nothing has happened yet
      assertTableSize(testShard, 'logTable', 0);
      assertTableSize(testShard, 'messageTable', 1);
      assertFirstMessageProperty('fromNodeID', clientA.entityID);
      assertFirstMessageProperty('toNodeID', routerA.entityID);

      // t=1; router A picks up message, forwards to router B
      clientA.tick({time: 1000});
      assertTableSize(testShard, 'logTable', 1);
      logRow = getLatestLogRow();
      assertEqual(routerA.entityID, logRow.nodeID);
      assertEqual(NetSimLogEntry.LogStatus.SUCCESS, logRow.status);
      assertEqual(packetBinary, logRow.binary);
      assertTableSize(testShard, 'messageTable', 1);
      assertFirstMessageProperty('fromNodeID', routerA.entityID);
      assertFirstMessageProperty('toNodeID', routerB.entityID);

      // t=2; router B picks up message, consumes it
      clientA.tick({time: 2000});
      assertTableSize(testShard, 'logTable', 2);
      logRow = getLatestLogRow();
      assertEqual(routerB.entityID, logRow.nodeID);
      assertEqual(NetSimLogEntry.LogStatus.SUCCESS, logRow.status);
      assertEqual(packetBinary, logRow.binary);
      assertTableSize(testShard, 'messageTable', 0);
    });

    it ("can send a message to client on another router", function () {
      var logRow;

      // This test reads better with slower routing.
      // It lets you see each step, when with Infinite bandwidth you get
      // several things happening on one tick, depending on how simulating
      // routers are registered with each client.
      routerA.setBandwidth(50); // Requires 1 second for routing
      routerB.setBandwidth(25); // Requires 2 seconds for routing, buts starts
                                // on first tick

      var packetBinary = encoder.concatenateBinary(
          encoder.makeBinaryHeaders({
            toAddress: clientB.getAddress(),
            fromAddress: clientA.getAddress()
          }),
          dataConverters.asciiToBinary('wop'));
      clientA.sendMessage(packetBinary, function () {});

      // t=0; nothing has happened yet
      assertTableSize(testShard, 'logTable', 0);
      assertTableSize(testShard, 'messageTable', 1);
      assertFirstMessageProperty('fromNodeID', clientA.entityID);
      assertFirstMessageProperty('toNodeID', routerA.entityID);

      // t=1; router A picks up message, forwards to router B
      clientA.tick({time: 1000});
      assertTableSize(testShard, 'logTable', 1);
      logRow = getLatestLogRow();
      assertEqual(routerA.entityID, logRow.nodeID);
      assertEqual(NetSimLogEntry.LogStatus.SUCCESS, logRow.status);
      assertEqual(packetBinary, logRow.binary);
      assertTableSize(testShard, 'messageTable', 1);
      assertFirstMessageProperty('fromNodeID', routerA.entityID);
      assertFirstMessageProperty('toNodeID', routerB.entityID);

      // t=2; router B picks up message, forwards to client B
      clientA.tick({time: 2000});
      assertTableSize(testShard, 'logTable', 2);
      logRow = getLatestLogRow();
      assertEqual(routerB.entityID, logRow.nodeID);
      assertEqual(NetSimLogEntry.LogStatus.SUCCESS, logRow.status);
      assertEqual(packetBinary, logRow.binary);
      assertTableSize(testShard, 'messageTable', 1);
      assertFirstMessageProperty('fromNodeID', routerB.entityID);
      assertFirstMessageProperty('toNodeID', clientB.entityID);
    });

    describe ("full-shard Auto-DNS", function () {

      var sendToAutoDnsA = function (fromNode, asciiPayload) {
        var payload = encoder.concatenateBinary({
          toAddress: addressStringToBinary(routerA.getAutoDnsAddress(),
              netsimGlobals.getLevelConfig().addressFormat),
          fromAddress: addressStringToBinary(fromNode.getAddress(),
              netsimGlobals.getLevelConfig().addressFormat)
        },  asciiToBinary(asciiPayload, BITS_PER_BYTE));
        fromNode.sendMessage(payload, function () {});
      };

      beforeEach(function () {
        routerA.setDnsMode(DnsMode.AUTOMATIC);
      });

      it ("cannot get addresses out of subnet when whole-shard routing is disabled", function () {
        netsimGlobals.getLevelConfig().connectedRouters = false;
        sendToAutoDnsA(clientA, 'GET ' + routerB.getHostname() + ' ' +
        clientB.getHostname());

        // Allow time for the response to be generated and routed.
        clientA.tick({time: 1});
        clientA.tick({time: 2});

        assertTableSize(testShard, 'messageTable', 1);
        assertFirstMessageAsciiBody(
            routerB.getHostname() + ':NOT_FOUND ' +
            clientB.getHostname() + ':NOT_FOUND');
      });

      it ("can get remote router hostname and address", function () {
        sendToAutoDnsA(clientA, 'GET ' + routerB.getHostname());

        // Allow time for the response to be generated and routed.
        clientA.tick({time: 1});
        clientA.tick({time: 2});

        assertTableSize(testShard, 'messageTable', 1);
        assertFirstMessageAsciiBody(
            routerB.getHostname() + ':' + routerB.getAddress());
      });


      it ("can look up remote client addresses by hostname", function () {
        sendToAutoDnsA(clientA, 'GET ' + clientB.getHostname());

        // Allow time for the response to be generated and routed.
        clientA.tick({time: 1});
        clientA.tick({time: 2});

        assertTableSize(testShard, 'messageTable', 1);
        assertFirstMessageAsciiBody(
            clientB.getHostname() + ':' + clientB.getAddress());
      });

      it ("can query another router's Auto-DNS", function () {
        // Client B should send a request to router A's auto-dns and
        // get a response
        sendToAutoDnsA(clientB, 'GET ' + clientA.getHostname());

        // Note: With unlimited router bandwidth, these operations sometimes
        //       collapse into a single tick depending on the order in which
        //       routers are ticked by the client.

        // 1. Initial message from client B to router B
        assertFirstMessageProperty('fromNodeID', clientB.entityID);
        assertFirstMessageProperty('toNodeID', routerB.entityID);

        // 2. Message forwarded from router B to router A
        clientB.tick({time: 1});
        assertFirstMessageProperty('fromNodeID', routerB.entityID);
        assertFirstMessageProperty('toNodeID', routerA.entityID);


        // 3. Message forwarded from router A to auto-DNS A
        // 4. Auto-DNS A generates response back to router A
        clientB.tick({time: 2});
        assertFirstMessageProperty('fromNodeID', routerA.entityID);
        assertFirstMessageProperty('toNodeID', routerA.entityID);
        assertFirstMessageAsciiBody(
            clientA.getHostname() + ':' + clientA.getAddress());

        // 5. Message forwarded from router A to router B
        // 6. And forwarded from router B to client B
        clientB.tick({time: 3});
        assertFirstMessageProperty('fromNodeID', routerB.entityID);
        assertFirstMessageProperty('toNodeID', clientB.entityID);
        assertFirstMessageAsciiBody(
            clientA.getHostname() + ':' + clientA.getAddress());
      });
    });
  });
});
