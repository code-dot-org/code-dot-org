var testUtils = require('../util/testUtils');
var assert = testUtils.assert;
var assertEqual = testUtils.assertEqual;
var assertOwnProperty = testUtils.assertOwnProperty;
var netsimTestUtils = require('../util/netsimTestUtils');
var fakeShard = netsimTestUtils.fakeShard;
var assertTableSize = netsimTestUtils.assertTableSize;

var NetSimWire = testUtils.requireWithGlobalsCheckBuildFolder('netsim/NetSimWire');

describe("NetSimWire", function () {
  var testShard, wireTable;

  beforeEach(function () {
    testShard = fakeShard();
    wireTable = testShard.wireTable;
  });

  it ("uses the wire table", function () {
    var wire = new NetSimWire(testShard);
    assert(wire.getTable_() === testShard.wireTable);
  });

  describe("default row structure", function () {
    var row;

    beforeEach(function () {
      var wire = new NetSimWire(testShard);
      row = wire.buildRow_();
    });

    it ("localNodeID (default undefined)", function () {
      assertOwnProperty(row, 'localNodeID');
      assertEqual(row.localNodeID, undefined);
    });

    it ("remoteNodeID (default undefined)", function () {
      assertOwnProperty(row, 'remoteNodeID');
      assertEqual(row.remoteNodeID, undefined);
    });

    it ("localAddress (default undefined)", function () {
      assertOwnProperty(row, 'localAddress');
      assertEqual(row.localAddress, undefined);
    });

    it ("remoteAddress (default undefined)", function () {
      assertOwnProperty(row, 'remoteAddress');
      assertEqual(row.remoteAddress, undefined);
    });

    it ("localHostname (default undefined)", function () {
      assertOwnProperty(row, 'localHostname');
      assertEqual(row.localHostname, undefined);
    });

    it ("remoteHostname (default undefined)", function () {
      assertOwnProperty(row, 'remoteHostname');
      assertEqual(row.remoteHostname, undefined);
    });
  });

  describe("static method create", function () {
    it ("adds an entry to the wire table", function () {
      assertTableSize(testShard, 'wireTable', 0);

      NetSimWire.create(testShard, 0, 0, function () {});

      assertTableSize(testShard, 'wireTable', 1);
    });

    it ("immediately initializes entry with endpoints", function () {
      NetSimWire.create(testShard, 1, 2, function () {});

      wireTable.readAll(function (err, rows) {
        assertEqual(rows[0].localNodeID, 1);
        assertEqual(rows[0].remoteNodeID, 2);
      });
    });

    it ("Returns a NetSimWire to its callback", function () {
      NetSimWire.create(testShard, 0, 0, function (err, result) {
        assert(result instanceof NetSimWire, "Result is a NetSimWire");
      });
    });
  });

  it ("can be instatiated from remote row", function () {
    var testRow;

    // Create a wire row in remote table
    wireTable.create({
      localNodeID: 1,
      remoteNodeID: 2,
      localAddress: 3,
      remoteAddress: 4,
      localHostname: 'me',
      remoteHostname: 'you'
    }, function (err, row) {
      testRow = row;
    });
    assert(testRow !== undefined, "Failed to create test row");

    // Instantiate wire
    var wire = new NetSimWire(testShard, testRow);
    assertEqual(wire.localNodeID, 1);
    assertEqual(wire.remoteNodeID, 2);
    assertEqual(wire.localAddress, 3);
    assertEqual(wire.remoteAddress, 4);
    assertEqual(wire.localHostname, 'me');
    assertEqual(wire.remoteHostname, 'you');
  });

  it ("can be removed from the remote table with destroy()", function () {
    var testRow;

    // Create a wire row in remote table
    wireTable.create({}, function (err, row) {
      testRow = row;
    });
    assert(testRow !== undefined, "Failed to create test row");

    // Call destroy()
    var wire = new NetSimWire(testShard, testRow);
    wire.destroy();

    // Verify that wire is gone from the remote table.
    assertTableSize(testShard, 'wireTable', 0);
  });

});
