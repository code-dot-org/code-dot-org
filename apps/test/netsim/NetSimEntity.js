'use strict';
/* global describe */
/* global beforeEach */
/* global it */

var testUtils = require('../util/testUtils');
var assert = testUtils.assert;
var assertEqual = testUtils.assertEqual;
var assertThrows = testUtils.assertThrows;
var netsimTestUtils = require('../util/netsimTestUtils');
var fakeShard = netsimTestUtils.fakeShard;
var assertTableSize = netsimTestUtils.assertTableSize;

var NetSimEntity = testUtils.requireWithGlobalsCheckBuildFolder('netsim/NetSimEntity');
var NetSimClientNode = testUtils.requireWithGlobalsCheckBuildFolder('netsim/NetSimClientNode');

describe("NetSimEntity", function () {
  it ("default entityID is undefined", function () {
    var entity = new NetSimEntity(undefined, undefined);
    assertEqual(entity.entityID, undefined);
  });

  it ("doesn't implement getTable_", function () {
    var entity = new NetSimEntity(undefined, undefined);
    assertThrows(Error, function () {
      entity.getTable_();
    });
  });

  it ("buildRow_ method produces empty object", function () {
    var entity = new NetSimEntity(undefined, undefined);
    assertEqual(entity.buildRow_(), {});
  });

  it ("disallows static creation on base type", function () {
    assertThrows(Error, function () {
      NetSimEntity.create(NetSimEntity, undefined, function () {});
    });
  });

  it ("disallows static fetch of base type", function () {
    assertThrows(Error, function () {
      NetSimEntity.get(NetSimEntity, 1, undefined, function () {});
    });
  });

  describe ("static create()", function () {
    var testShard;

    beforeEach(function () {
      testShard = fakeShard();
    });

    it ("creates and returns an entity fo the correct type", function () {
      assertTableSize(testShard, 'nodeTable', 0);

      var entity;
      NetSimEntity.create(NetSimClientNode, testShard, function (err, newNode) {
        entity = newNode;
      });
      assert(entity !== undefined);
      assert(entity instanceof NetSimClientNode);
      assertTableSize(testShard, 'nodeTable', 1);

    });
  });

  describe ("static get()", function () {
    var testShard;

    beforeEach(function () {
      testShard = fakeShard();
    });

    it ("returns null if entity is not found", function () {
      var entity;
      NetSimEntity.get(NetSimClientNode, 15, testShard, function (err, foundEntity) {
        entity = foundEntity;
      });
      assert(null === entity, "Should return null when entity not found, returned " + entity);
    });

    it ("returns entity of correct type, if found", function () {
      var clientNodeID;
      NetSimEntity.create(NetSimClientNode, testShard, function (err, newNode) {
        clientNodeID = newNode.entityID;
      });
      assert(clientNodeID !== undefined, "Expected a client node ID");

      var entity;
      NetSimEntity.get(NetSimClientNode, clientNodeID, testShard, function (err, foundEntity) {
        entity = foundEntity;
      });
      assert(entity instanceof NetSimClientNode, "Expect to create correct entity type");
      assertEqual(entity.entityID, clientNodeID);
    });
  });
});
