'use strict';
/* global describe, beforeEach, it */

var _ = require('lodash');
var testUtils = require('../util/testUtils');
var NetSimTestUtils = require('../util/netsimTestUtils');
var utils = require('@cdo/apps/utils');
var DataConverters = require('@cdo/apps/netsim/DataConverters');
var NetSimConstants = require('@cdo/apps/netsim/NetSimConstants');
var NetSimGlobals = require('@cdo/apps/netsim/NetSimGlobals');
var NetSimLocalClientNode = require('@cdo/apps/netsim/NetSimLocalClientNode');
var NetSimLogEntry = require('@cdo/apps/netsim/NetSimLogEntry');
var NetSimLogger = require('@cdo/apps/netsim/NetSimLogger');
var NetSimMessage = require('@cdo/apps/netsim/NetSimMessage');
var NetSimRouterNode = require('@cdo/apps/netsim/NetSimRouterNode');
var NetSimWire = require('@cdo/apps/netsim/NetSimWire');
var Packet = require('@cdo/apps/netsim/Packet');


var asciiToBinary = DataConverters.asciiToBinary;
var assert = testUtils.assert;
var assertOwnProperty = testUtils.assertOwnProperty;
var assertTableSize = NetSimTestUtils.assertTableSize;
var BITS_PER_BYTE = NetSimConstants.BITS_PER_BYTE;
var DnsMode = NetSimConstants.DnsMode;
var fakeShard = NetSimTestUtils.fakeShard;

testUtils.setupLocale('netsim');

describe("NetSimRouterNode", function () {
  var testShard, addressFormat, packetCountBitWidth, packetHeaderSpec, encoder;

  /**
   * Concise router creation for test
   * @param {RouterRow} [row]
   * @returns {NetSimRouterNode}
   */
  var makeLocalRouter = function (row) {
    return new NetSimRouterNode(testShard, row);
  };

  /**
   * Synchronous router creation on shard for test
   * @returns {NetSimRouterNode}
   */
  var makeRemoteRouter = function () {
    var newRouter;
    NetSimRouterNode.create(testShard, function (e, r) {
      newRouter = r;
    });
    assert.isDefined(newRouter, "Failed to create a remote router.");
    return newRouter;
  };

  /**
   * Synchronous client creation on shard for test
   * @param {string} displayName
   * @returns {NetSimLocalClientNode}
   */
  var makeRemoteClient = function (displayName) {
    var newClient;
    NetSimLocalClientNode.create(testShard, displayName, function (e, n) {
      newClient = n;
    });
    assert.isDefined(newClient, "Failed to create a remote client.");
    return newClient;
  };

  /**
   * Synchronous refresh for tests
   * @param {string} tableName
   * @returns {Array}
   */
  var getRows = function (tableName) {
    var rows;
    testShard[tableName].refresh(function () {
      rows = testShard[tableName].readAll();
    });
    return rows;
  };

  /**
   * Synchronous table size counting for tests
   * @param {string} tableName
   * @returns {number}
   */
  var countRows = function (tableName) {
    return getRows(tableName).length;
  };

  /**
   * Get the row most recently added to the specified table.
   * @param {string} tableName
   * @returns {Object}
   */
  var getLatestRow = function (tableName) {
    var rows = getRows(tableName);
    if (rows.length === 0) {
      throw new Error("Now rows in " + tableName + ", unable to retrieve latest row.");
    }
    return rows[rows.length - 1];
  };

  /**
   * Synchronously inspect a property on the first message in the table.
   * @param {string} propertyName
   * @returns {*}
   */
  var getFirstMessageProperty = function (propertyName) {
    var messageRows = getRows('messageTable');
    if (messageRows.length === 0) {
      throw new Error("No rows in message table, unable to check first message.");
    }

    return new NetSimMessage(testShard, messageRows[0])[propertyName];
  };

  /**
   * Assert if the given property on the first message does not match
   * the expected value.
   * @param {string} propertyName
   * @param {*} expectedValue
   */
  var assertFirstMessageProperty = function (propertyName, expectedValue) {
    var realValue = getFirstMessageProperty(propertyName);
    assert(_.isEqual(realValue, expectedValue),
        "Expected first message." + propertyName + " to be " +
        expectedValue + ", but got " + realValue);
  };

  /**
   * Retrieve the value of a certain header on the first message in the table.
   * Dependent on current message format & encoder settings.
   * @param {string} headerType
   * @returns {*}
   */
  var getFirstMessageHeader = function (headerType) {
    var payload = getFirstMessageProperty('payload');
    if (Packet.isAddressField(headerType)) {
      return encoder.getHeaderAsAddressString(headerType, payload);
    } else {
      return encoder.getHeaderAsInt(headerType, payload);
    }
  };

  /**
   * Assert if the given header on the first message does not match the
   * expected value.
   * @param {string} headerType
   * @param {*} expectedValue
   */
  var assertFirstMessageHeader = function (headerType, expectedValue) {
    var headerValue = getFirstMessageHeader(headerType);
    assert(_.isEqual(headerValue, expectedValue), "Expected first message " +
    headerType + " header to be " + expectedValue + ", but got " +
    headerValue);
  };

  /**
   * Retrieve the body of the first message in the table.  Dependent on the
   * current message format and encoder settings.
   * @returns {string}
   */
  var getFirstMessageAsciiBody = function () {
    var payload = getFirstMessageProperty('payload');
    return encoder.getBodyAsAscii(payload, BITS_PER_BYTE);
  };

  /**
   * Assert if the body of the first message does not match the expected value.
   * @param {string} expectedValue
   */
  var assertFirstMessageAsciiBody = function (expectedValue) {
    var bodyAscii = getFirstMessageAsciiBody();
    assert(_.isEqual(bodyAscii, expectedValue), "Expected first message " +
    "body to be '" + expectedValue + "', but got '" + bodyAscii + "'");
  };

  /**
   * Call tick() with an advanced time parameter on the argument until
   * no change is detected in the log table.
   * @param {NetSimRouterNode|NetSimLocalClientNode} tickable
   * @param {number} [startTime] default 1
   * @param {number} [timeStep] default 1
   * @returns {number} Next tick time after stabilized
   */
  var tickUntilLogsStabilize = function (tickable, startTime, timeStep) {
    var t = utils.valueOr(startTime, 1);
    timeStep = utils.valueOr(timeStep, 1);
    var lastLogCount;
    do {
      lastLogCount = countRows('logTable');
      tickable.tick({time: t});
      t += timeStep;
    } while (countRows('logTable') !== lastLogCount);
    return t;
  };

  /**
   * Build a fake message log that can be passed into
   * NetSimLocalClientNode.initializeSimulation as the sent or received log,
   * and can be used to sense whether a particular message would be passed
   * to the sent/received log UI components.
   * @returns {{log: Function, getLatest: Function}}
   */
  var makeFakeMessageLog = function () {
    var archive = [];
    return {
      log: function (payload) {
        archive.push(payload);
      },
      getLatest: function () {
        if (archive.length === 0) {
          throw new Error('Nothing has been logged.');
        }
        return archive[archive.length - 1];
      }
    };
  };

  /**
   * Set the test-global address format for routers and auto-DNS
   * @param {string} newFormat
   */
  var setAddressFormat = function (newFormat) {
    addressFormat = newFormat;
    NetSimGlobals.getLevelConfig().addressFormat = addressFormat;
    encoder = new Packet.Encoder(addressFormat, packetCountBitWidth,
        packetHeaderSpec);
  };

  beforeEach(function () {
    NetSimLogger.getSingleton().setVerbosity(NetSimLogger.LogLevel.NONE);
    NetSimTestUtils.initializeGlobalsToDefaultValues();

    // Create a useful default configuration
    addressFormat = '4';
    packetCountBitWidth = 4;
    packetHeaderSpec = [
      Packet.HeaderType.FROM_ADDRESS,
      Packet.HeaderType.TO_ADDRESS
    ];

    NetSimGlobals.getLevelConfig().addressFormat = addressFormat;
    NetSimGlobals.getLevelConfig().packetCountBitWidth = packetCountBitWidth;
    NetSimGlobals.getLevelConfig().routerExpectsPacketHeader = packetHeaderSpec;
    NetSimGlobals.getLevelConfig().broadcastMode = false;

    encoder = new Packet.Encoder(addressFormat, packetCountBitWidth,
        packetHeaderSpec);

    testShard = fakeShard();
  });

  it("has expected row structure and default values", function () {
    var router = new NetSimRouterNode(testShard);
    var row = router.buildRow();

    assertOwnProperty(row, 'routerNumber');
    assert.isUndefined(row.routerNumber);

    assertOwnProperty(row, 'creationTime');
    assert.closeTo(row.creationTime, Date.now(), 10);

    assertOwnProperty(row, 'dnsMode');
    assert.strictEqual(row.dnsMode, DnsMode.NONE);

    assertOwnProperty(row, 'dnsNodeID');
    assert.isUndefined(row.dnsNodeID);

    assertOwnProperty(row, 'bandwidth');
    assert.strictEqual(row.bandwidth, 'Infinity');

    assertOwnProperty(row, 'memory');
    assert.strictEqual(row.memory, 'Infinity');

    assertOwnProperty(row, 'randomDropChance');
    assert.strictEqual(row.randomDropChance, 0);
  });

  describe("constructing from a table row", function () {
    var routerFromRow;

    it("routerNumber", function () {
      routerFromRow = makeLocalRouter({ routerNumber: 42 });
      assert.equal(42, routerFromRow.routerNumber);
    });

    it("creationTime", function () {
      routerFromRow = makeLocalRouter({ creationTime: 42 });
      assert.closeTo(routerFromRow.creationTime, 42, 10);
    });

    it("dnsMode", function () {
      routerFromRow = makeLocalRouter({ dnsMode: DnsMode.AUTOMATIC });
      assert.equal(DnsMode.AUTOMATIC, routerFromRow.dnsMode);
    });

    it("dnsNodeID", function () {
      routerFromRow = makeLocalRouter({ dnsNodeID: 42 });
      assert.equal(42, routerFromRow.dnsNodeID);
    });

    it("bandwidth", function () {
      routerFromRow = makeLocalRouter({ bandwidth: 1024 });
      assert.equal(1024, routerFromRow.bandwidth);

      // Special case: Bandwidth should be able to serialize in Infinity
      // from the string 'Infinity' in the database.
      routerFromRow = makeLocalRouter({ bandwidth: 'Infinity' });
      assert.equal(Infinity, routerFromRow.bandwidth);
    });

    it("memory", function () {
      routerFromRow = makeLocalRouter({ memory: 1024 });
      assert.equal(1024, routerFromRow.memory);

      // Special case: Memory should be able to serialize in Infinity
      // from the string 'Infinity' in the database.
      routerFromRow = makeLocalRouter({ memory: 'Infinity' });
      assert.equal(Infinity, routerFromRow.memory);
    });

    it("randomDropChance", function () {
      routerFromRow = makeLocalRouter({ randomDropChance: 0.1 });
      assert.equal(0.1, routerFromRow.randomDropChance);
    });
  });

  describe("static method get", function () {
    var err, result, routerID;
    var routerA;

    beforeEach(function () {
      routerA = makeRemoteRouter();
      err = undefined;
      result = undefined;
      routerID = 0;
    });

    it("returns an Error object when router cannot be found", function () {
      NetSimRouterNode.get(routerID, testShard, function (_err, _result) {
        err = _err;
        result = _result;
      });

      assert.equal(null, result);
      assert(err instanceof Error, "Returned an error object");
      assert.equal('Not Found', err.message);
    });

    it("returns null for error and a NetSimRouterNode when router is found", function () {
      routerID = routerA.entityID;

      NetSimRouterNode.get(routerID, testShard, function(_err, _result) {
        err = _err;
        result = _result;
      });

      assert.equal(null, err);
      assert(result instanceof NetSimRouterNode);
      assert.equal(routerID, result.entityID);
    });
  });

  describe("getConnections", function () {
    var routerA;

    beforeEach(function () {
      routerA = makeRemoteRouter();
    });

    it("returns an empty array when no wires are present", function () {
      var wires = routerA.getConnections();
      assert.isArray(wires);
      assert.strictEqual(wires.length, 0);
    });

    it("returns wires that have a remote end attached to the router", function () {
      NetSimWire.create(testShard, {
            localNodeID: 0,
            remoteNodeID: routerA.entityID
          }, function () {});
      assert.equal(1, routerA.getConnections().length);
    });

    it("returns NetSimWire objects", function () {
      NetSimWire.create(testShard, {
            localNodeID: 0,
            remoteNodeID: routerA.entityID
          }, function () {});
      assert.instanceOf(routerA.getConnections()[0], NetSimWire, "Got a NetSimWire back");
    });

    it("skips wires that aren't connected to the router", function () {
      NetSimWire.create(testShard, {
            localNodeID: 0,
            remoteNodeID: routerA.entityID,
            localHostname: 'theRightOne'
          }, function () {});
      NetSimWire.create(testShard, {
            localNodeID: 0,
            remoteNodeID: routerA.entityID + 1,
            localHostname: 'theWrongOne'
          }, function () {});

      // Only get the one wire back.
      assert.equal(1, routerA.getConnections().length);
      assert.equal('theRightOne', routerA.getConnections()[0].localHostname);
    });
  });

  /**
   * Router maximum connections.
   * Hard-coded for now, could be level-driven later.
   * @type {number}
   * @const
   */
  var CONNECTION_LIMIT = 6;
  describe("acceptConnection", function () {
    var routerA;

    beforeEach(function () {
      routerA = makeRemoteRouter();
    });

    it("accepts connection if total connections are at or below limit", function () {
      for (var wireID = routerA.entityID + 1;
           wireID < routerA.entityID + CONNECTION_LIMIT + 1;
           wireID++) {
        NetSimWire.create(testShard, {
          localNodeID: wireID,
          remoteNodeID: routerA.entityID,
          localAddress: wireID.toString(10)
        }, function () {});
      }
      assertTableSize(testShard, 'wireTable', CONNECTION_LIMIT);

      var accepted;
      routerA.acceptConnection(null, function (err, isAccepted) {
        accepted = isAccepted;
      });

      assert.isTrue(accepted);
    });

    it("rejects connection if total connections are beyond limit", function () {
      for (var wireID = routerA.entityID + 1;
           wireID < routerA.entityID + CONNECTION_LIMIT + 2;
           wireID++) {
        NetSimWire.create(testShard, {
          localNodeID: wireID,
          remoteNodeID: routerA.entityID
        }, function () {});
      }
      assertTableSize(testShard, 'wireTable', CONNECTION_LIMIT + 1);

      var error, accepted;
      routerA.acceptConnection(null, function (err, isAccepted) {
        error = err;
        accepted = isAccepted;
      });

      assert.isFalse(accepted);
      assert.instanceOf(error, Error);
      assert.equal(error.message, 'Too many connections.');
    });

    it("rejects connection if an address collision exists", function () {
      var address = '14.4';

      NetSimWire.create(testShard, {
        localNodeID: 10,
        remoteNodeID: routerA.entityID,
        localAddress: address
      }, function () {});

      NetSimWire.create(testShard, {
        localNodeID: 11,
        remoteNodeID: routerA.entityID,
        localAddress: address
      }, function () {});

      var error, accepted;
      routerA.acceptConnection(null, function (err, isAccepted) {
        error = err;
        accepted = isAccepted;
      });
      assert.isFalse(accepted);
      assert.instanceOf(error, Error);
      assert.equal(error.message, 'Address collision detected.');
    });
  });

  it("numbers created routers in sequence, starting with 1", function () {
    var newRouter;
    for (var i = 0; i < 128; i++) {
      newRouter = makeRemoteRouter();
      assert.equal(i + 1, newRouter.getRouterNumber());
    }
  });

  it("numbers routers in sequence in spite of creating client nodes", function () {
    var newRouter, newClient;

    // Start with a client, since this is the typical scenario on a new shard.
    newClient = makeRemoteClient();
    assert.equal(1, newClient.entityID);

    // The new client probably adds a router.
    // The new router does not get entity ID 1, but it does get router ID 1.
    newRouter = makeRemoteRouter();
    assert.equal(1, newRouter.getRouterNumber());
    assert.equal(2, newRouter.entityID);

    // Make another router, make sure it's router #2
    newRouter = makeRemoteRouter();
    assert.equal(2, newRouter.getRouterNumber());

    // Make another client
    newClient = makeRemoteClient();
    assert.equal(4, newClient.entityID);

    // Make another router, make sure it's router #3
    newRouter = makeRemoteRouter();
    assert.equal(3, newRouter.getRouterNumber());
  });

  describe("address assignment rules", function () {
    var routerA;

    function makeWire(nodeIDOffset) {
      var newWire;
      NetSimWire.create(testShard, {
        localNodeID: routerA.entityID + nodeIDOffset,
        remoteNodeID: routerA.entityID
      }, function (e, w) {
        newWire = w;
      });
      return newWire;
    }

    beforeEach(function () {
      routerA = makeRemoteRouter();
    });

    describe("getting addresses", function () {
      var wire1, wire2, wire3;

      beforeEach(function () {
        NetSimGlobals.setRandomSeed('address assignment test');
        wire1 = makeWire(1);
        wire2 = makeWire(2);
        wire3 = makeWire(3);
        assertTableSize(testShard, 'wireTable', 3);
      });

      describe("in simple four-bit format", function () {
        beforeEach(function () {
          setAddressFormat('4');
        });

        it("creates single-number addresses when using single-number address format", function () {
          assert.equal('11', routerA.getRandomAvailableClientAddress());
          assert.equal('1', routerA.getRandomAvailableClientAddress());
          assert.equal('3', routerA.getRandomAvailableClientAddress());
        });

        it("sets own address as zero", function () {
          assert.equal('0', routerA.getAddress());
        });
      });

      describe("in two-part format", function () {
        beforeEach(function () {
          setAddressFormat('4.4');
        });

        it("creates two-part addresses where the first part is the router number", function () {
          assert.equal(routerA.entityID + '.11', routerA.getRandomAvailableClientAddress());
          assert.equal(routerA.entityID + '.1', routerA.getRandomAvailableClientAddress());
          assert.equal(routerA.entityID + '.3', routerA.getRandomAvailableClientAddress());
        });

        it("sets own address as router#.0", function () {
          assert.equal(routerA.entityID + '.0', routerA.getAddress());
        });
      });

      describe("in four-part format", function () {
        beforeEach(function () {
          setAddressFormat('8.8.8.8');
        });

        it("uses zeros for all except last two parts", function () {
          // You get higher random addresses here, because of the larger
          // addressable space.
          assert.equal('0.0.' + routerA.entityID + '.200', routerA.getRandomAvailableClientAddress());
          assert.equal('0.0.' + routerA.entityID + '.7', routerA.getRandomAvailableClientAddress());
          assert.equal('0.0.' + routerA.entityID + '.43', routerA.getRandomAvailableClientAddress());
        });

        it("sets own address as 0.0.router#.0", function () {
          assert.equal('0.0.' + routerA.entityID + '.0', routerA.getAddress());
        });
      });
    });

    describe("keeping multipart addresses within addressable space", function () {
      var routerB, routerC, routerD, routerE;

      beforeEach(function () {
        routerB = makeRemoteRouter();
        routerC = makeRemoteRouter();
        routerD = makeRemoteRouter();
        routerE = makeRemoteRouter();
      });

      it("leaves router number unchanged for one-part addresses", function () {
        setAddressFormat('4');

        var newRouter;
        for (var i = 0; i < 128; i++) {
          newRouter = makeRemoteRouter();
          assert.equal(newRouter.routerNumber, newRouter.getRouterNumber());
          assert.equal("0", newRouter.getAddress());
        }
      });

      it("Constrains router number to addressable space", function () {
        // Four possible router addresses
        setAddressFormat('2.8');

        // Initial node starts at routerNumber 1
        assert.equal(1, routerA.routerNumber);
        assert.equal(1, routerA.getRouterNumber());

        assert.equal(2, routerB.routerNumber);
        assert.equal(2, routerB.getRouterNumber());

        assert.equal(3, routerC.routerNumber);
        assert.equal(3, routerC.getRouterNumber());

        // At 4 (our assignable space) router number wraps to zero
        assert.equal(4, routerD.routerNumber);
        assert.equal(0, routerD.getRouterNumber());

        // Collisions are possible
        assert.equal(5, routerE.routerNumber);
        assert.equal(1, routerE.getRouterNumber());
      });

      it("Wraps router names/IDs to match the router number", function () {
        // Four possible router addresses
        setAddressFormat('2.8');

        // Initial node starts at routerNumber 1
        assert.equal(1, routerA.routerNumber);
        assert.equal("Router 1", routerA.getDisplayName());
        assert.equal("1.0", routerA.getAddress());

        assert.equal(2, routerB.routerNumber);
        assert.equal("Router 2", routerB.getDisplayName());
        assert.equal("2.0", routerB.getAddress());

        assert.equal(3, routerC.routerNumber);
        assert.equal("Router 3", routerC.getDisplayName());
        assert.equal("3.0", routerC.getAddress());

        // At 4 (our assignable space) router number and address wrap to zero
        assert.equal(4, routerD.routerNumber);
        assert.equal("Router 0", routerD.getDisplayName());
        assert.equal("0.0", routerD.getAddress());

        // Collisions are possible
        assert.equal(5, routerE.routerNumber);
        assert.equal("Router 1", routerE.getDisplayName());
        assert.equal("1.0", routerE.getAddress());
      });
    });

    describe("random address assignment order", function () {
      var router, clients;

      beforeEach(function () {
        router = makeRemoteRouter();
        router.maxClientConnections_ = Infinity;
        clients = [];
        for (var i = 0; i < 16; i++) {
          clients[i] = makeRemoteClient('client' + i);
        }
      });

      it("assigns every address in addressable space", function () {
        NetSimGlobals.setRandomSeed('Coverage!');
        setAddressFormat('4');
        // Addressable space is 0-15
        // 0 is reserved for the router
        // 15 is reserved for the auto-DNS
        for (var i = 0; i < 16; i++) {
          clients[i].connectToRouter(router);
        }
        assert.equal('1', clients[0].getAddress());
        assert.equal('2', clients[1].getAddress());
        assert.equal('3', clients[2].getAddress());
        assert.equal('5', clients[3].getAddress());
        assert.equal('12', clients[4].getAddress());
        assert.equal('11', clients[5].getAddress());
        assert.equal('14', clients[6].getAddress());
        assert.equal('13', clients[7].getAddress());
        assert.equal('7', clients[8].getAddress());
        assert.equal('6', clients[9].getAddress());
        assert.equal('4', clients[10].getAddress());
        assert.equal('8', clients[11].getAddress());
        assert.equal('10', clients[12].getAddress());
        assert.equal('9', clients[13].getAddress());

        // At this point we've exhausted the address space,
        // so the address is left "undefined"
        // Might want a different behavior in the future for this,
        // but low router capacity limits mean this won't happen in
        // production, for now.
        assert.equal(undefined, clients[14].getAddress());
      });

      it("can assign addresses in a different order", function () {
        NetSimGlobals.setRandomSeed('Variety');
        setAddressFormat('4');

        for (var i = 0; i < 16; i++) {
          clients[i].connectToRouter(router);
        }
        assert.equal('4', clients[0].getAddress());
        assert.equal('10', clients[1].getAddress());
        assert.equal('2', clients[2].getAddress());
        assert.equal('1', clients[3].getAddress());
        assert.equal('3', clients[4].getAddress());
        assert.equal('9', clients[5].getAddress());
        assert.equal('11', clients[6].getAddress());
        assert.equal('6', clients[7].getAddress());
        assert.equal('13', clients[8].getAddress());
        assert.equal('14', clients[9].getAddress());
        assert.equal('12', clients[10].getAddress());
        assert.equal('5', clients[11].getAddress());
        assert.equal('8', clients[12].getAddress());
        assert.equal('7', clients[13].getAddress());
      });

      it("shrinks addressable space according to address format", function () {
        NetSimGlobals.setRandomSeed('Variety');
        setAddressFormat('2');

        // Two-bit addresses, so four options, and "00" is used by the router.
        for (var i = 0; i < 4; i++) {
          clients[i].connectToRouter(router);
        }
        assert.equal('1', clients[0].getAddress());
        assert.equal('3', clients[1].getAddress());
        assert.equal('2', clients[2].getAddress());
        // No more room!
        assert.equal(undefined, clients[3].getAddress());
      });

      it("grows addressable space according to address format", function () {
        NetSimGlobals.setRandomSeed('Variety');
        setAddressFormat('8');

        // 8-bit addresses, so they go up to 255
        // We won't try to show every case.
        for (var i = 0; i < 4; i++) {
          clients[i].connectToRouter(router);
        }
        assert.equal('69', clients[0].getAddress());
        assert.equal('173', clients[1].getAddress());
        assert.equal('29', clients[2].getAddress());
      });
    });

  });

  it("still simulates/routes after connect-disconnect-connect cycle", function () {
    var routerA = makeRemoteRouter();
    var clientA = makeRemoteClient();

    NetSimGlobals.getLevelConfig().automaticReceive = true;
    var time = 1;
    var fakeReceivedLog = makeFakeMessageLog();

    clientA.initializeSimulation(null, fakeReceivedLog);

    var assertLoopbackWorks = function (forClient) {
      // Construct a message with a timestamp payload, to ensure calls to
      // this method don't conflict with one another.
      var headers = encoder.makeBinaryHeaders({ toAddress: forClient.getAddress()});
      var payload = encoder.concatenateBinary(headers, new Date().getTime().toString(2));
      forClient.sendMessage(payload, function () {});
      time = tickUntilLogsStabilize(forClient, time);
      assert.equal(payload, fakeReceivedLog.getLatest());
    };

    clientA.connectToRouter(routerA);
    assertLoopbackWorks(clientA);
    clientA.disconnectRemote();
    clientA.connectToRouter(routerA);
    assertLoopbackWorks(clientA);
    clientA.disconnectRemote();
    clientA.connectToRouter(routerA);
    assertLoopbackWorks(clientA);
  });

  describe("message routing rules", function () {
    var routerA, clientA, clientB;

    beforeEach(function () {
      routerA = makeRemoteRouter();
      clientA = makeRemoteClient();
      clientB = makeRemoteClient();

      // Manually connect nodes
      clientA.initializeSimulation(null, null);
      clientA.connectToRouter(routerA);
      routerA.stopSimulation();

      clientB.initializeSimulation(null, null);
      clientB.connectToRouter(routerA);
      routerA.stopSimulation();

      // Tell router to simulate for local node
      routerA.initializeSimulation(clientA.entityID);

      var addressTable = routerA.getAddressTable();
      assert.equal(addressTable.length, 2);
      assert.equal(addressTable[0].isLocal, true);

      // Make sure router initial time is zero
      routerA.tick({time: 0});
    });

    it("ignores messages sent to itself from other clients", function () {
      clientB.sendMessage('00000', function () {});
      routerA.tick({time: 1000});
      assertTableSize(testShard, 'logTable', 0);
      assertFirstMessageProperty('fromNodeID', clientB.entityID);
      assertFirstMessageProperty('toNodeID', routerA.entityID);
    });

    it("ignores messages sent to others", function () {
      var from = clientA.entityID;
      var to = clientB.entityID;
      NetSimMessage.send(
          testShard,
          {
            fromNodeID: from,
            toNodeID: to,
            simulatedBy: from,
            payload: '00000'
          },
          function () {});
      routerA.tick({time: 1000});
      assertTableSize(testShard, 'messageTable', 1);
      assertTableSize(testShard, 'logTable', 0);
      assertFirstMessageProperty('fromNodeID', from);
      assertFirstMessageProperty('toNodeID', to);
    });

    it("does not forward malformed packets", function () {
      // Here, the payload gets 'cleaned' down to empty string, then treated
      // as zero when parsing the toAddress.
      clientA.sendMessage('00000', function () {});
      routerA.tick({time: 1000});

      assertTableSize(testShard, 'messageTable', 0);
      assertTableSize(testShard, 'logTable', 1);
    });

    it("does not forward packets with no match in the local network", function () {
      var payload = encoder.concatenateBinary({
        toAddress: '1111',
        fromAddress: '1111'
      }, '101010101');
      clientA.sendMessage(payload, function () {});
      routerA.tick({time: 1000});

      assertTableSize(testShard, 'messageTable', 0);
      assertTableSize(testShard, 'logTable', 1);
    });

    it("forwards packets when the toAddress is found in the network", function () {
      var fromAddress = clientA.getAddress();
      var toAddress = clientB.getAddress();

      var headers = encoder.makeBinaryHeaders({
        toAddress: toAddress,
        fromAddress: fromAddress
      });
      var payload = encoder.concatenateBinary(headers, '101010101');
      clientA.sendMessage(payload, function () {});
      routerA.tick({time: 1000});

      assertTableSize(testShard, 'messageTable', 1);
      assertTableSize(testShard, 'logTable', 1);

      // Verify that message from/to node IDs are correct
      assertFirstMessageProperty('fromNodeID', routerA.entityID);
      assertFirstMessageProperty('toNodeID', clientB.entityID);
    });


    describe("broadcast mode", function () {
      var clientC;

      beforeEach(function () {
        clientC = makeRemoteClient();

        // Put level in broadcast mode
        NetSimGlobals.getLevelConfig().broadcastMode = true;

        // Stop simulation from earlier setup, hook up new client, restart
        // simulation
        routerA.stopSimulation();
        clientC.initializeSimulation(null, null);
        clientC.connectToRouter(routerA);
        routerA.stopSimulation();
        routerA.initializeSimulation(clientA.entityID);
      });

      it("forwards all messages it receives to every connected node", function () {
        clientA.sendMessage("00001111", function () {});
        routerA.tick({time: 1000});

        // Router should log having picked up one message
        assertTableSize(testShard, 'logTable', 1);

        // Message forwarded in triplicate: Back to local, and out to both remotes
        assertTableSize(testShard, 'messageTable', 3);
        assertFirstMessageProperty('fromNodeID', routerA.entityID);
      });
    });

    describe("Router bandwidth limits", function () {
      var fromNodeID, toNodeID, fromAddress, toAddress;

      var sendMessageOfSize = function (messageSizeBits) {
        var headers = encoder.makeBinaryHeaders({
          toAddress: toAddress,
          fromAddress: fromAddress
        });
        var payload = encoder.concatenateBinary(headers,
            '0'.repeat(messageSizeBits - encoder.getHeaderLength()));
        clientA.sendMessage(payload, function () {});
      };

      beforeEach(function () {
        fromNodeID = clientA.entityID;
        toNodeID = routerA.entityID;
        fromAddress = clientA.getAddress();
        toAddress = clientB.getAddress();

        // Establish time baseline of zero
        routerA.tick({time: 0});
        assertTableSize(testShard, 'logTable', 0);
      });

      it("requires variable time to forward packets based on bandwidth", function () {
        routerA.bandwidth = 1000; // 1 bit / ms

        // Router detects message immediately, but does not send it until
        // enough time has passed to send the message based on bandwidth
        sendMessageOfSize(1008);

        // Message still has not been sent at 1007ms
        routerA.tick({time: 1007});
        assertTableSize(testShard, 'logTable', 0);

        // At 1000bps, it should take 1008ms to send 1008 bits
        routerA.tick({time: 1008});
        assertTableSize(testShard, 'logTable', 1);
      });

      it("respects bandwidth setting", function () {
        // 0.1 bit / ms, so 10ms / bit
        routerA.bandwidth = 100;

        // This message should be sent at t=200
        sendMessageOfSize(20);

        // Message is sent at t=200
        routerA.tick({time: 199});
        assertTableSize(testShard, 'logTable', 0);
        routerA.tick({time: 200});
        assertTableSize(testShard, 'logTable', 1);
      });

      it("routes packet on first tick if bandwidth is infinite", function () {
        routerA.bandwidth = Infinity;

        // Message is detected immediately, though that's not obvious here.
        sendMessageOfSize(1008);

        // At infinite bandwidth, router forwards message even though zero
        // time has passed.
        routerA.tick({time: 0});
        assertTableSize(testShard, 'logTable', 1);
      });

      it("routes 'batches' of packets when multiple packets fit in the bandwidth", function () {
        routerA.bandwidth = 1000; // 1 bit / ms

        // Router should schedule these all as soon as they show up, for
        // 40, 80 and 120 ms respectively (due to the 0.1 bit per ms rate)
        sendMessageOfSize(40);
        sendMessageOfSize(40);
        sendMessageOfSize(40);

        // On this tick, two messages should get forwarded because enough
        // time has passed for them both to be sent given our current bandwidth.
        routerA.tick({time: 80});
        assertTableSize(testShard, 'logTable', 2);

        // On this final tick, the third message should be sent
        routerA.tick({time: 120});
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
      it("is pessimistic when scheduling new packets", function () {
        routerA.bandwidth = 1000; // 1 bit / ms

        // Router 'starts sending' this message now, expected to finish
        // at t=40
        sendMessageOfSize(40);

        // At t=30, we do schedule another message
        // You might think this one is scheduled for t=80, but because
        // we can't see partial progress from other clients we assume the
        // worst and schedule it for t=110 (30 + 40 + 40)
        routerA.tick({time: 30});
        sendMessageOfSize(40);

        // Jumping to t=80, we see that only one message is sent.  If we'd
        // been using optimistic scheduling, we would have sent both.})
        routerA.tick({time: 80});
        assertTableSize(testShard, 'logTable', 1);

        // At this point the simulation considers rescheduling the next message.
        // Its new pessimistic estimate is t=120 (80{now} + 40{size}) but
        // we go with the previous estimate of t=110 since it was better.

        // At t=110, the second message is sent
        routerA.tick({time: 109});
        assertTableSize(testShard, 'logTable', 1);
        routerA.tick({time: 110});
        assertTableSize(testShard, 'logTable', 2);
      });

      it("normally corrects pessimistic estimates with rescheduling", function () {
        routerA.bandwidth = 1000; // 1 bit / ms

        // Router 'starts sending' this message now, expected to finish
        // at t=40
        sendMessageOfSize(40);

        // Again, at t=30, we schedule another message
        // We schedule pessimistically, for t=110
        routerA.tick({time: 30});
        sendMessageOfSize(40);

        // Unlike the last test, we tick at exactly t=40 and send the first
        // message right on schedule.
        routerA.tick({time: 39});
        assertTableSize(testShard, 'logTable', 0);
        routerA.tick({time: 40});
        assertTableSize(testShard, 'logTable', 1);

        // This triggers a reschedule for the previous message;
        // its new pessimistic estimate says that it can be sent at t=80,
        // which is better than the previous t=110 estimate.

        // At t=80, the second message is sent
        routerA.tick({time: 79});
        assertTableSize(testShard, 'logTable', 1);
        routerA.tick({time: 80});
        assertTableSize(testShard, 'logTable', 2);
      });

      it("adjusts routing schedule when router bandwidth changes", function () {
        routerA.bandwidth = 1000; // 1 bit / ms

        // Five 100-bit messages, scheduled for t=100-500 respectively.
        sendMessageOfSize(100);
        sendMessageOfSize(100);
        sendMessageOfSize(100);
        sendMessageOfSize(100);
        sendMessageOfSize(100);

        // First message processed at t=100
        routerA.tick({time: 99});
        assertTableSize(testShard, 'logTable', 0);
        routerA.tick({time: 100});
        assertTableSize(testShard, 'logTable', 1);

        // Advance halfway through processing the second message
        routerA.tick({time: 150});
        assertTableSize(testShard, 'logTable', 1);

        // Increase the router bandwidth
        routerA.setBandwidth(10000); // 10 bits / ms

        // This triggers a reschedule; since NOW is 150 and each message now
        // takes 10 ms to process, the new schedule is:
        // 2: 160
        // 3: 170
        // 4: 180
        // 5: 190

        // Message 2 processed at t=160
        routerA.tick({time: 159});
        assertTableSize(testShard, 'logTable', 1);
        routerA.tick({time: 160});
        assertTableSize(testShard, 'logTable', 2);

        // Message 3 processed at t=170
        routerA.tick({time: 169});
        assertTableSize(testShard, 'logTable', 2);
        routerA.tick({time: 170});
        assertTableSize(testShard, 'logTable', 3);

        // Increase the bandwidth again
        routerA.setBandwidth(100000); // 100 bits / ms

        // New schedule (NOW=170, 1ms per message)
        // 4: 171
        // 5: 172

        // Message 4 processed at t=171
        routerA.tick({time: 170.9});
        assertTableSize(testShard, 'logTable', 3);
        routerA.tick({time: 171.0});
        assertTableSize(testShard, 'logTable', 4);

        // Message 5 processed at t=172
        routerA.tick({time: 171.9});
        assertTableSize(testShard, 'logTable', 4);
        routerA.tick({time: 172.0});
        assertTableSize(testShard, 'logTable', 5);
      });

      it("drops packets after ten minutes in the router queue", function () {
        routerA.bandwidth = 1; // 1 bit / second
        var tenMinutesInBits = 600;
        var tenMinutesInMillis = 600000;

        // Send a message that will take ten minutes + 1 second to process.
        sendMessageOfSize(tenMinutesInBits + 1);
        assertTableSize(testShard, 'messageTable', 1);
        assertTableSize(testShard, 'logTable', 0);

        // At almost ten minutes, the message should still be present
        routerA.tick({time: tenMinutesInMillis - 1});
        assertTableSize(testShard, 'messageTable', 1);
        assertTableSize(testShard, 'logTable', 0);

        // At exactly ten minutes, the message should expire and be removed
        // and no related logging occurs
        routerA.tick({time: tenMinutesInMillis});
        assertTableSize(testShard, 'messageTable', 0);
        assertTableSize(testShard, 'logTable', 0);

        // Thus, just after ten minutes, no message is routed.
        routerA.tick({time: tenMinutesInMillis + 1000});
        assertTableSize(testShard, 'messageTable', 0);
        assertTableSize(testShard, 'logTable', 0);
      });

      it("smaller packets can expire if backed up behind large ones", function () {
        routerA.bandwidth = 1; // 1 bit / second
        var oneMinuteInBits = 60;
        var oneMinuteInMillis = 60000;

        // This message should take nine minutes to process, so it will be sent.
        sendMessageOfSize(9 * oneMinuteInBits);
        // This one only takes two minutes to process, but because it's behind
        // the nine-minute one it will expire
        sendMessageOfSize(2 * oneMinuteInBits);
        // This one is tiny and should take sixteen seconds, but it will
        // also expire since it's after the first two.
        sendMessageOfSize(16);

        // Initially, all three messages are in the queue
        assertTableSize(testShard, 'messageTable', 3);
        assertTableSize(testShard, 'logTable', 0);

        // At almost ten minutes the first message has been forwarded, and
        // the other two are still enqueued.
        routerA.tick({time: 10 * oneMinuteInMillis - 1});
        assertTableSize(testShard, 'messageTable', 3);
        assertTableSize(testShard, 'logTable', 1);

        // At exactly ten minutes, messages two and three are expired and deleted.
        routerA.tick({time: 10 * oneMinuteInMillis});
        assertTableSize(testShard, 'messageTable', 1);
        assertTableSize(testShard, 'logTable', 1);
      });

      it("removing expired packets allows packets further down the queue to be processed sooner", function () {
        routerA.bandwidth = 1; // 1 bit / second
        var oneMinuteInBits = 60;
        var oneMinuteInMillis = 60000;

        // These messages will both expire, since before processing of the
        // first one completes they will both be over 10 minutes old.
        sendMessageOfSize(12 * oneMinuteInBits);
        sendMessageOfSize(3 * oneMinuteInBits);
        assertTableSize(testShard, 'messageTable', 2);
        assertTableSize(testShard, 'logTable', 0);

        // Advance to 9 minutes.  Nothing has happened yet.
        routerA.tick({time: 9 * oneMinuteInMillis});
        assertTableSize(testShard, 'messageTable', 2);
        assertTableSize(testShard, 'logTable', 0);

        // Here we add a 1-minute message.  Since the others still exist,
        // and we use pessimistic scheduling, this one is initially scheduled
        // to finish at (9 + 12 + 3 + 1) = 25 minutes, meaning it would expire
        // as well.
        sendMessageOfSize(oneMinuteInBits);
        assertTableSize(testShard, 'messageTable', 3);
        assertTableSize(testShard, 'logTable', 0);

        // At 10 minutes, the first two messages expire.
        routerA.tick({time: 10 * oneMinuteInMillis});
        assertTableSize(testShard, 'messageTable', 1);
        assertTableSize(testShard, 'logTable', 0);
        routerA.tick({time: 10 * oneMinuteInMillis + 1});

        // This SHOULD allow the third message to complete at 11 minutes
        // instead of at 25.
        routerA.tick({time: 11 * oneMinuteInMillis - 1});
        assertTableSize(testShard, 'messageTable', 1);
        assertTableSize(testShard, 'logTable', 0);

        routerA.tick({time: 11 * oneMinuteInMillis});
        assertTableSize(testShard, 'messageTable', 1);
        assertTableSize(testShard, 'logTable', 1);
      });
    });

    describe("Router memory limits", function () {
      var sendMessageOfSize = function (messageSizeBits) {
        var headers = encoder.makeBinaryHeaders({
          toAddress: clientB.getAddress(),
          fromAddress: clientA.getAddress()
        });
        var payload = encoder.concatenateBinary(headers,
            '0'.repeat(messageSizeBits - encoder.getHeaderLength()));

        clientA.sendMessage(payload, function () {});
      };

      var assertRouterQueueSize = function (expectedQueueSizeBits) {
        var queueSize = getRows('messageTable').filter(function (m) {
          return m.toNodeID === routerA.entityID;
        }).map(function (m) {
          return m.base64Payload.len;
        }).reduce(function (p, c) {
          return p + c;
        }, 0);
        assert(expectedQueueSizeBits === queueSize, "Expected router queue to " +
            "contain " + expectedQueueSizeBits + " bits, but it contained " +
            queueSize + " bits");
      };

      var assertHowManyDropped = function (expectedDropCount) {
        var droppedPackets = getRows('logTable').map(function (l) {
          return l.status === NetSimLogEntry.LogStatus.DROPPED ? 1 : 0;
        }).reduce(function (p, c) {
          return p + c;
        }, 0);
        assert(droppedPackets === expectedDropCount, "Expected that " +
            expectedDropCount + " packets would be dropped, " +
            "but logs only report " + droppedPackets + " dropped packets");
      };

      beforeEach(function () {
        // Establish time baseline of zero
        routerA.tick({time: 0});
        routerA.bandwidth = Infinity;
        routerA.memory = 64 * 8; // 64 bytes
        assertTableSize(testShard, 'logTable', 0);
      });

      it("allows messages that fit in router memory", function () {
        // Exact fit is okay
        // Log table is empty because routing is not complete
        sendMessageOfSize(64 * 8);
        assertTableSize(testShard, 'messageTable', 1);
        assertRouterQueueSize(64 * 8);
        assertHowManyDropped(0);
      });

      it("rejects messages that exceed router memory", function () {
        // Over by one bit gets dropped!
        // Adds a log entry with a "dropped" status, or some such.
        sendMessageOfSize(64 * 8 + 1);
        assertTableSize(testShard, 'messageTable', 0);
        assertRouterQueueSize(0);
        assertHowManyDropped(1);
      });

      it("rejects messages when they would put queue over its limit", function () {
        // Three messages: 62 bytes, 2 bytes, 4 bytes
        sendMessageOfSize(62 * 8);
        sendMessageOfSize(2 * 8);
        sendMessageOfSize(4 * 8);

        // The second message should JUST fit, the third message should drop
        assertTableSize(testShard, 'messageTable', 2);
        assertRouterQueueSize(64 * 8);
        assertHowManyDropped(1);
      });

      it("accepts messages queued beyond memory limit if clearing packets ahead" +
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

      it("can drop multiple packets queued beyond memory limit", function () {
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

      it("drops packets when memory capacity is reduced below queue size", function () {
        sendMessageOfSize(16 * 8);
        sendMessageOfSize(16 * 8);
        sendMessageOfSize(16 * 8);

        // All three should fit in our 64-byte memory
        assertTableSize(testShard, 'messageTable', 3);
        assertRouterQueueSize(48 * 8);
        assertHowManyDropped(0);

        // Cut router memory in half, to 32 bytes.
        routerA.setMemory(32 * 8);

        // This should kick the third message out of memory (but the second
        // should just barely fit.
        assertTableSize(testShard, 'messageTable', 2);
        assertRouterQueueSize(32 * 8);
        assertHowManyDropped(1);
      });

      it("can drop multiple packets when memory capacity is reduced below" +
          " queue size", function () {
        sendMessageOfSize(20 * 8);
        sendMessageOfSize(20 * 8);
        sendMessageOfSize(8 * 8);

        // All three should fit in our 64-byte memory
        assertTableSize(testShard, 'messageTable', 3);
        assertRouterQueueSize(48 * 8);
        assertHowManyDropped(0);

        // Cut router memory to 32 bytes.
        routerA.setMemory(16 * 8);

        // This should kick the first and second messages out of memory, but
        // the third message should fit.
        assertTableSize(testShard, 'messageTable', 1);
        assertRouterQueueSize(8 * 8);
        assertHowManyDropped(2);
      });

      it("getMemoryInUse() reports correct memory usage", function () {
        routerA.setMemory(Infinity);
        assertRouterQueueSize(0);
        assert.equal(0, routerA.getMemoryInUse());

        sendMessageOfSize(64 * 8);
        assertRouterQueueSize(64 * 8);
        assert.equal(64 * 8, routerA.getMemoryInUse());

        sendMessageOfSize(8);
        sendMessageOfSize(8);
        sendMessageOfSize(8);
        sendMessageOfSize(8);
        sendMessageOfSize(8);
        sendMessageOfSize(8);
        assertRouterQueueSize(70 * 8);
        assert.equal(70 * 8, routerA.getMemoryInUse());

        routerA.setMemory(32 * 8);
        assertHowManyDropped(1);
        assertRouterQueueSize(6 * 8);
        assert.equal(6 * 8, routerA.getMemoryInUse());
      });

    });

    describe("Random drop chance", function () {
      var sendMessageOfSize = function (messageSizeBits) {
        var headers = encoder.makeBinaryHeaders({
          toAddress: clientB.getAddress(),
          fromAddress: clientA.getAddress()
        });
        var payload = encoder.concatenateBinary(headers,
            '0'.repeat(messageSizeBits - encoder.getHeaderLength()));

        clientA.sendMessage(payload, function () {});
      };

      var sendXMessagesAndTickUntilStable = function (numToSend) {
        for (var i = 0; i < numToSend; i++) {
          sendMessageOfSize(8);
        }
        tickUntilLogsStabilize(routerA);
      };

      var assertHowManyDropped = function (expectedDropCount) {
        var droppedPackets = getRows('logTable').map(function (l) {
          return l.status === NetSimLogEntry.LogStatus.DROPPED ? 1 : 0;
        }).reduce(function (p, c) {
          return p + c;
        }, 0);
        assert(droppedPackets === expectedDropCount, "Expected that " +
            expectedDropCount + " packets would be dropped, " +
            "but logs only report " + droppedPackets + " dropped packets");
      };

      beforeEach(function () {
        // Establish time baseline of zero
        routerA.tick({time: 0});
        assertTableSize(testShard, 'logTable', 0);
        assert.equal(Infinity, routerA.bandwidth);
        assert.equal(Infinity, routerA.memory);
      });

      it("zero chance drops nothing", function () {
        routerA.randomDropChance = 0;
        sendXMessagesAndTickUntilStable(10);
        assertTableSize(testShard, 'messageTable', 10);
        assertHowManyDropped(0);
      });

      it("100% chance drops everything", function () {
        routerA.randomDropChance = 1;
        sendXMessagesAndTickUntilStable(10);
        assertTableSize(testShard, 'messageTable', 0);
        assertHowManyDropped(10);
      });

      it("50% drops about half", function () {
        NetSimGlobals.setRandomSeed('a');
        routerA.randomDropChance = 0.5;
        sendXMessagesAndTickUntilStable(20);
        assertHowManyDropped(9);
      });

      it("50% drops about half (example two)", function () {
        NetSimGlobals.setRandomSeed('b');
        routerA.randomDropChance = 0.5;
        sendXMessagesAndTickUntilStable(20);
        assertHowManyDropped(11);
      });

      it("10% drops a few", function () {
        NetSimGlobals.setRandomSeed('c');
        routerA.randomDropChance = 0.1;
        sendXMessagesAndTickUntilStable(30);
        assertHowManyDropped(2);
      });

      it("10% drops a few (example two)", function () {
        NetSimGlobals.setRandomSeed('d');
        routerA.randomDropChance = 0.1;
        sendXMessagesAndTickUntilStable(30);
        assertHowManyDropped(1);
      });
    });

    describe("Auto-DNS behavior", function () {
      var autoDnsAddress;

      var sendToAutoDns = function (fromNode, asciiPayload) {
        var headers = encoder.makeBinaryHeaders({
          toAddress: autoDnsAddress,
          fromAddress: fromNode.getAddress()
        });
        var payload = encoder.concatenateBinary(headers,
            asciiToBinary(asciiPayload, BITS_PER_BYTE));
        fromNode.sendMessage(payload, function () {});
      };

      beforeEach(function () {
        routerA.setDnsMode(DnsMode.AUTOMATIC);
        autoDnsAddress = routerA.getAutoDnsAddress();
        routerA.tick({time: 0});
      });

      it("can round-trip to auto-DNS service and back",function () {
        sendToAutoDns(clientA, '');

        // No routing has occurred yet; our original message is still in the table.
        assertTableSize(testShard, 'logTable', 0);
        assertTableSize(testShard, 'messageTable', 1);
        assertFirstMessageProperty('fromNodeID', clientA.entityID);
        assertFirstMessageProperty('toNodeID', routerA.entityID);
        assertFirstMessageProperty('simulatedBy', clientA.entityID);
        assertFirstMessageHeader(Packet.HeaderType.TO_ADDRESS, autoDnsAddress);
        assertFirstMessageHeader(Packet.HeaderType.FROM_ADDRESS, clientA.getAddress());

        // On first tick (at infinite bandwidth) message should be routed to
        // auto-DNS service.
        routerA.tick({time: 1});
        // That message should look like this:
        //   fromNodeID   : routerA.entityID
        //   toNodeID     : routerA.entityID
        //   simulatedBy  : clientA.entityID
        //   TO_ADDRESS   : autoDnsAddress
        //   FROM_ADDRESS : clientA.getAddress()
        // But on the same tick, the auto-DNS immediately picks up that message
        // and generates a response:
        assertTableSize(testShard, 'logTable', 1);
        assertTableSize(testShard, 'messageTable', 1);
        assertFirstMessageProperty('fromNodeID', routerA.entityID);
        assertFirstMessageProperty('toNodeID', routerA.entityID);
        assertFirstMessageProperty('simulatedBy', clientA.entityID);
        assertFirstMessageHeader(Packet.HeaderType.TO_ADDRESS, clientA.getAddress());
        assertFirstMessageHeader(Packet.HeaderType.FROM_ADDRESS, autoDnsAddress);

        // On second tick, router forwards DNS response back to client
        routerA.tick({time: 2});
        assertTableSize(testShard, 'logTable', 2);
        assertTableSize(testShard, 'messageTable', 1);
        assertFirstMessageProperty('fromNodeID', routerA.entityID);
        assertFirstMessageProperty('toNodeID', clientA.entityID);
        assertFirstMessageProperty('simulatedBy', clientA.entityID);
        assertFirstMessageHeader(Packet.HeaderType.TO_ADDRESS, clientA.getAddress());
        assertFirstMessageHeader(Packet.HeaderType.FROM_ADDRESS, autoDnsAddress);
      });

      it("ignores auto-DNS messages from remote clients", function () {
        sendToAutoDns(clientB, '');

        // No routing has occurred yet; our original message is still in the table.
        assertTableSize(testShard, 'logTable', 0);
        assertTableSize(testShard, 'messageTable', 1);
        var originalMessages = getRows('messageTable');

        routerA.tick({time: 1});

        // Still, no routing has occurred
        assertTableSize(testShard, 'logTable', 0);
        assertTableSize(testShard, 'messageTable', 1);
        assert.deepEqual(originalMessages, getRows('messageTable'));

        routerA.tick({time: 2});

        // Nothing happens when remote node is not being simulated
        assertTableSize(testShard, 'logTable', 0);
        assertTableSize(testShard, 'messageTable', 1);
        assert.deepEqual(originalMessages, getRows('messageTable'));
      });

      it("produces a usage message for any badly-formed request", function () {
        sendToAutoDns(clientA, 'Would you tea for stay like to?');
        tickUntilLogsStabilize(routerA);

        assertTableSize(testShard, 'messageTable', 1);
        assertFirstMessageAsciiBody("Automatic DNS Node" +
            "\nUsage: GET hostname [hostname [hostname ...]]");
      });

      it("responds with NOT_FOUND when it can't find the requested hostname", function () {
        sendToAutoDns(clientA, 'GET wagner14');
        tickUntilLogsStabilize(routerA);

        assertTableSize(testShard, 'messageTable', 1);
        assertFirstMessageAsciiBody("wagner14:NOT_FOUND");
      });

      it("responds to well-formed requests with a matching number of responses", function () {
        sendToAutoDns(clientA, 'GET bert ernie');
        tickUntilLogsStabilize(routerA);

        assertTableSize(testShard, 'messageTable', 1);
        assertFirstMessageAsciiBody("bert:NOT_FOUND ernie:NOT_FOUND");
      });

      it("knows its own hostname and address", function () {
        sendToAutoDns(clientA, 'GET dns');
        tickUntilLogsStabilize(routerA);

        assertTableSize(testShard, 'messageTable', 1);
        assertFirstMessageAsciiBody("dns:15");
      });

      it("knows the router hostname and address", function () {
        sendToAutoDns(clientA, 'GET ' + routerA.getHostname());
        tickUntilLogsStabilize(routerA);

        assertTableSize(testShard, 'messageTable', 1);
        assertFirstMessageAsciiBody(routerA.getHostname() + ':0');
      });

      it("can look up the client addresses by hostname", function () {
        sendToAutoDns(clientA, 'GET ' +
            clientA.getHostname() + ' ' +
            clientB.getHostname());
        tickUntilLogsStabilize(routerA);

        assertTableSize(testShard, 'messageTable', 1);
        assertFirstMessageAsciiBody(
            clientA.getHostname() + ':' + clientA.getAddress() + ' ' +
            clientB.getHostname() + ':' + clientB.getAddress());
      });
    });
  });

  describe("routing to other routers", function () {
    var routerA, routerB;
    var clientA, clientB;

    beforeEach(function () {
      routerA = makeRemoteRouter();
      routerB = makeRemoteRouter();
      clientA = makeRemoteClient();
      clientB = makeRemoteClient();

      setAddressFormat('4.4');
      NetSimGlobals.getLevelConfig().connectedRouters = true;

      clientA.initializeSimulation(null, null);
      clientB.initializeSimulation(null, null);

      clientA.connectToRouter(routerA);
      clientB.connectToRouter(routerB);

      // Make sure router initial time is zero
      routerA.tick({time: 0});
      routerB.tick({time: 0});
    });

    it("inter-router message is dropped when 'connectedRouters' are disabled",
        function () {
      NetSimGlobals.getLevelConfig().connectedRouters = false;

      var packetBinary = encoder.concatenateBinary(
          encoder.makeBinaryHeaders({
            toAddress: clientB.getAddress(),
            fromAddress: clientA.getAddress()
          }),
          DataConverters.asciiToBinary('wop'));
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
      var logRow = getLatestRow('logTable');
      var log = new NetSimLogEntry(testShard, logRow);
      assert.equal(routerA.entityID, logRow.nodeID);
      assert.equal(NetSimLogEntry.LogStatus.DROPPED, logRow.status);
      assert.equal(packetBinary, log.binary);
      assertTableSize(testShard, 'messageTable', 0);
    });

    it("can send a message to another router", function () {
      var logRow, log;

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
          DataConverters.asciiToBinary('flop'));
      clientA.sendMessage(packetBinary, function () {});

      // t=0; nothing has happened yet
      assertTableSize(testShard, 'logTable', 0);
      assertTableSize(testShard, 'messageTable', 1);
      assertFirstMessageProperty('fromNodeID', clientA.entityID);
      assertFirstMessageProperty('toNodeID', routerA.entityID);

      // t=1; router A picks up message, forwards to router B
      clientA.tick({time: 1000});
      assertTableSize(testShard, 'logTable', 1);
      logRow = getLatestRow('logTable');
      log = new NetSimLogEntry(testShard, logRow);
      assert.equal(routerA.entityID, logRow.nodeID);
      assert.equal(NetSimLogEntry.LogStatus.SUCCESS, logRow.status);
      assert.equal(packetBinary, log.binary);
      assertTableSize(testShard, 'messageTable', 1);
      assertFirstMessageProperty('fromNodeID', routerA.entityID);
      assertFirstMessageProperty('toNodeID', routerB.entityID);

      // t=2; router B picks up message, consumes it
      clientA.tick({time: 2000});
      assertTableSize(testShard, 'logTable', 2);
      logRow = getLatestRow('logTable');
      log = new NetSimLogEntry(testShard, logRow);
      assert.equal(routerB.entityID, logRow.nodeID);
      assert.equal(NetSimLogEntry.LogStatus.SUCCESS, logRow.status);
      assert.equal(packetBinary, log.binary);
      assertTableSize(testShard, 'messageTable', 0);
    });

    it("can send a message to client on another router", function () {
      var logRow, log;

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
          DataConverters.asciiToBinary('wop'));
      clientA.sendMessage(packetBinary, function () {});

      // t=0; nothing has happened yet
      assertTableSize(testShard, 'logTable', 0);
      assertTableSize(testShard, 'messageTable', 1);
      assertFirstMessageProperty('fromNodeID', clientA.entityID);
      assertFirstMessageProperty('toNodeID', routerA.entityID);

      // t=1; router A picks up message, forwards to router B
      clientA.tick({time: 1000});
      assertTableSize(testShard, 'logTable', 1);
      logRow = getLatestRow('logTable');
      log = new NetSimLogEntry(testShard, logRow);
      assert.equal(routerA.entityID, logRow.nodeID);
      assert.equal(NetSimLogEntry.LogStatus.SUCCESS, logRow.status);
      assert.equal(packetBinary, log.binary);
      assertTableSize(testShard, 'messageTable', 1);
      assertFirstMessageProperty('fromNodeID', routerA.entityID);
      assertFirstMessageProperty('toNodeID', routerB.entityID);

      // t=2; router B picks up message, forwards to client B
      clientA.tick({time: 2000});
      assertTableSize(testShard, 'logTable', 2);
      logRow = getLatestRow('logTable');
      log = new NetSimLogEntry(testShard, logRow);
      assert.equal(routerB.entityID, logRow.nodeID);
      assert.equal(NetSimLogEntry.LogStatus.SUCCESS, logRow.status);
      assert.equal(packetBinary, log.binary);
      assertTableSize(testShard, 'messageTable', 1);
      assertFirstMessageProperty('fromNodeID', routerB.entityID);
      assertFirstMessageProperty('toNodeID', clientB.entityID);
    });

    it("can make one extra hop", function () {
      var routerC = makeRemoteRouter();
      NetSimGlobals.getLevelConfig().minimumExtraHops = 1;
      NetSimGlobals.getLevelConfig().maximumExtraHops = 1;

      // This test reads better with slower routing.
      routerA.setBandwidth(50);
      routerB.setBandwidth(50);
      routerC.setBandwidth(25);

      var packetBinary = encoder.concatenateBinary(
          encoder.makeBinaryHeaders({
            toAddress: clientB.getAddress(),
            fromAddress: clientA.getAddress()
          }),
          DataConverters.asciiToBinary('wop'));
      clientA.sendMessage(packetBinary, function () {});

      // t=0; nothing has happened yet
      assertTableSize(testShard, 'logTable', 0);
      assertFirstMessageProperty('fromNodeID', clientA.entityID);
      assertFirstMessageProperty('toNodeID', routerA.entityID);
      assertFirstMessageProperty('extraHopsRemaining', 1);
      assertFirstMessageProperty('visitedNodeIDs', []);

      // t=1; router A picks up message, forwards to router B
      clientA.tick({time: 1000});
      assertTableSize(testShard, 'logTable', 1);
      assertFirstMessageProperty('fromNodeID', routerA.entityID);
      assertFirstMessageProperty('toNodeID', routerC.entityID);
      assertFirstMessageProperty('extraHopsRemaining', 0);
      assertFirstMessageProperty('visitedNodeIDs', [routerA.entityID]);

      // t=2; router C picks up message, forwards to router B
      clientA.tick({time: 2000});
      assertTableSize(testShard, 'logTable', 2);
      assertFirstMessageProperty('fromNodeID', routerC.entityID);
      assertFirstMessageProperty('toNodeID', routerB.entityID);
      assertFirstMessageProperty('extraHopsRemaining', 0);
      assertFirstMessageProperty('visitedNodeIDs', [routerA.entityID, routerC.entityID]);

      // t=3; router B picks up message, forwards to client B
      clientA.tick({time: 3000});
      assertTableSize(testShard, 'logTable', 3);
      assertFirstMessageProperty('fromNodeID', routerB.entityID);
      assertFirstMessageProperty('toNodeID', clientB.entityID);
      assertFirstMessageProperty('extraHopsRemaining', 0);
      assertFirstMessageProperty('visitedNodeIDs', [routerA.entityID, routerC.entityID, routerB.entityID]);
    });

    it("can make two extra hops", function () {
      NetSimGlobals.getLevelConfig().minimumExtraHops = 2;
      NetSimGlobals.getLevelConfig().maximumExtraHops = 2;
      NetSimGlobals.setRandomSeed('two-hops');

      // Introduce another router so there's space for two extra hops.
      var routerC = makeRemoteRouter();
      var routerD = makeRemoteRouter();

      // This test reads better with slower routing.
      routerA.setBandwidth(50);
      routerB.setBandwidth(50);
      routerC.setBandwidth(25);
      routerD.setBandwidth(25);

      var packetBinary = encoder.concatenateBinary(
          encoder.makeBinaryHeaders({
            toAddress: clientB.getAddress(),
            fromAddress: clientA.getAddress()
          }),
          DataConverters.asciiToBinary('wop'));
      clientA.sendMessage(packetBinary, function () {});

      // t=0; nothing has happened yet
      assertTableSize(testShard, 'logTable', 0);
      assertFirstMessageProperty('fromNodeID', clientA.entityID);
      assertFirstMessageProperty('toNodeID', routerA.entityID);
      assertFirstMessageProperty('extraHopsRemaining', 2);
      assertFirstMessageProperty('visitedNodeIDs', []);

      // t=1; router A picks up message, forwards to router B
      clientA.tick({time: 1000});
      assertTableSize(testShard, 'logTable', 1);
      assertFirstMessageProperty('fromNodeID', routerA.entityID);
      assertFirstMessageProperty('toNodeID', routerC.entityID);
      assertFirstMessageProperty('extraHopsRemaining', 1);
      assertFirstMessageProperty('visitedNodeIDs', [
        routerA.entityID]);

      // t=2; router C picks up message, forwards to router D
      clientA.tick({time: 2000});
      assertTableSize(testShard, 'logTable', 2);
      assertFirstMessageProperty('fromNodeID', routerC.entityID);
      assertFirstMessageProperty('toNodeID', routerD.entityID);
      assertFirstMessageProperty('extraHopsRemaining', 0);
      assertFirstMessageProperty('visitedNodeIDs', [
        routerA.entityID, routerC.entityID]);

      // t=3; router D picks up message, forwards to router B
      clientA.tick({time: 3000});
      assertTableSize(testShard, 'logTable', 3);
      assertFirstMessageProperty('fromNodeID', routerD.entityID);
      assertFirstMessageProperty('toNodeID', routerB.entityID);
      assertFirstMessageProperty('extraHopsRemaining', 0);
      assertFirstMessageProperty('visitedNodeIDs', [
        routerA.entityID, routerC.entityID, routerD.entityID]);

      // t=4; router B picks up message, forwards to client B
      clientA.tick({time: 4000});
      assertTableSize(testShard, 'logTable', 4);
      assertFirstMessageProperty('fromNodeID', routerB.entityID);
      assertFirstMessageProperty('toNodeID', clientB.entityID);
      assertFirstMessageProperty('extraHopsRemaining', 0);
      assertFirstMessageProperty('visitedNodeIDs', [
        routerA.entityID, routerC.entityID, routerD.entityID, routerB.entityID]);
    });


    describe("extra hop randomization", function () {
      var routerC, routerD, routerE, routerF;

      beforeEach(function () {
        routerC = makeRemoteRouter();
        routerD = makeRemoteRouter();
        routerE = makeRemoteRouter();
        routerF = makeRemoteRouter();
      });

      var sendFromAToB = function () {
        var packetBinary = encoder.concatenateBinary(
            encoder.makeBinaryHeaders({
              toAddress: clientB.getAddress(),
              fromAddress: clientA.getAddress()
            }),
            DataConverters.asciiToBinary('wop'));
        clientA.sendMessage(packetBinary, function () {});
        tickUntilLogsStabilize(clientA);
      };


      it("uses one order here", function () {
        NetSimGlobals.getLevelConfig().minimumExtraHops = 2;
        NetSimGlobals.getLevelConfig().maximumExtraHops = 2;
        NetSimGlobals.setRandomSeed('two-hops');
        sendFromAToB();
        assertFirstMessageProperty('visitedNodeIDs', [
          routerA.entityID,
          routerC.entityID,
          routerF.entityID,
          routerB.entityID
        ]);
      });

      it("uses a different order here", function () {
        NetSimGlobals.getLevelConfig().minimumExtraHops = 2;
        NetSimGlobals.getLevelConfig().maximumExtraHops = 2;
        NetSimGlobals.setRandomSeed('for something completely different');
        sendFromAToB();
        assertFirstMessageProperty('visitedNodeIDs', [
          routerA.entityID,
          routerE.entityID,
          routerC.entityID,
          routerB.entityID
        ]);
      });

      it("uses one number of hops here", function () {
        NetSimGlobals.getLevelConfig().minimumExtraHops = 0;
        NetSimGlobals.getLevelConfig().maximumExtraHops = 3;
        NetSimGlobals.setRandomSeed('some random seed');
        sendFromAToB();
        assertFirstMessageProperty('visitedNodeIDs', [
          routerA.entityID,
          routerD.entityID,
          routerF.entityID,
          routerC.entityID,
          routerB.entityID
        ]);
      });

      it("uses a different number of hops here", function () {
        NetSimGlobals.getLevelConfig().minimumExtraHops = 0;
        NetSimGlobals.getLevelConfig().maximumExtraHops = 3;
        NetSimGlobals.setRandomSeed('second random seed');
        sendFromAToB();
        assertFirstMessageProperty('visitedNodeIDs', [
          routerA.entityID,
          routerD.entityID,
          routerB.entityID
        ]);
      });
    });

    it("only makes one extra hop if two would require backtracking", function () {
      NetSimGlobals.getLevelConfig().minimumExtraHops = 2;
      NetSimGlobals.getLevelConfig().maximumExtraHops = 2;

      var routerC = makeRemoteRouter();

      // This test reads better with slower routing.
      routerA.setBandwidth(50);
      routerB.setBandwidth(50);
      routerC.setBandwidth(25);

      var packetBinary = encoder.concatenateBinary(
          encoder.makeBinaryHeaders({
            toAddress: clientB.getAddress(),
            fromAddress: clientA.getAddress()
          }),
          DataConverters.asciiToBinary('wop'));
      clientA.sendMessage(packetBinary, function () {});

      // t=0; nothing has happened yet
      assertTableSize(testShard, 'logTable', 0);
      assertFirstMessageProperty('fromNodeID', clientA.entityID);
      assertFirstMessageProperty('toNodeID', routerA.entityID);
      assertFirstMessageProperty('extraHopsRemaining', 2);
      assertFirstMessageProperty('visitedNodeIDs', []);

      // t=1; router A picks up message, forwards to router B
      clientA.tick({time: 1000});
      assertTableSize(testShard, 'logTable', 1);
      assertFirstMessageProperty('fromNodeID', routerA.entityID);
      assertFirstMessageProperty('toNodeID', routerC.entityID);
      assertFirstMessageProperty('extraHopsRemaining', 1);
      assertFirstMessageProperty('visitedNodeIDs', [routerA.entityID]);

      // t=2; router C picks up message, tries to forward to someone other
      // than router B but there are no unvisited options;
      // forwards to router B anyway.
      clientA.tick({time: 2000});
      assertTableSize(testShard, 'logTable', 2);
      assertFirstMessageProperty('fromNodeID', routerC.entityID);
      assertFirstMessageProperty('toNodeID', routerB.entityID);
      assertFirstMessageProperty('extraHopsRemaining', 0);
      assertFirstMessageProperty('visitedNodeIDs', [routerA.entityID, routerC.entityID]);

      // t=3; router B picks up message, forwards to client B
      clientA.tick({time: 3000});
      assertTableSize(testShard, 'logTable', 3);
      assertFirstMessageProperty('fromNodeID', routerB.entityID);
      assertFirstMessageProperty('toNodeID', clientB.entityID);
      assertFirstMessageProperty('extraHopsRemaining', 0);
      assertFirstMessageProperty('visitedNodeIDs', [routerA.entityID, routerC.entityID, routerB.entityID]);
    });

    describe("full-shard Auto-DNS", function () {

      var sendToAutoDnsA = function (fromNode, asciiPayload) {
        var headers = encoder.makeBinaryHeaders({
          toAddress: routerA.getAutoDnsAddress(),
          fromAddress: fromNode.getAddress()
        });
        var payload = encoder.concatenateBinary(headers,
            asciiToBinary(asciiPayload, BITS_PER_BYTE));
        fromNode.sendMessage(payload, function () {});
      };

      beforeEach(function () {
        routerA.setDnsMode(DnsMode.AUTOMATIC);
      });

      it("cannot get addresses out of subnet when whole-shard routing is disabled", function () {
        NetSimGlobals.getLevelConfig().connectedRouters = false;
        sendToAutoDnsA(clientA, 'GET ' + routerB.getHostname() + ' ' +
            clientB.getHostname());
        tickUntilLogsStabilize(clientA);

        assertTableSize(testShard, 'messageTable', 1);
        assertFirstMessageAsciiBody(
            routerB.getHostname() + ':NOT_FOUND ' +
            clientB.getHostname() + ':NOT_FOUND');
      });

      it("can get remote router hostname and address", function () {
        sendToAutoDnsA(clientA, 'GET ' + routerB.getHostname());
        tickUntilLogsStabilize(clientA);

        assertTableSize(testShard, 'messageTable', 1);
        assertFirstMessageAsciiBody(
            routerB.getHostname() + ':' + routerB.getAddress());
      });


      it("can look up remote client addresses by hostname", function () {
        sendToAutoDnsA(clientA, 'GET ' + clientB.getHostname());
        tickUntilLogsStabilize(clientA);

        assertTableSize(testShard, 'messageTable', 1);
        assertFirstMessageAsciiBody(
            clientB.getHostname() + ':' + clientB.getAddress());
      });

      it("can query another router's Auto-DNS", function () {
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
