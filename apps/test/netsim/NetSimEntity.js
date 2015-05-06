'use strict';
/* global describe */
/* global beforeEach */
/* global it */

var testUtils = require('../util/testUtils');
testUtils.setupLocale('netsim');
var assert = testUtils.assert;
var assertEqual = testUtils.assertEqual;
var assertThrows = testUtils.assertThrows;
var netsimTestUtils = require('../util/netsimTestUtils');
var fakeShard = netsimTestUtils.fakeShard;
var assertTableSize = netsimTestUtils.assertTableSize;

var NetSimEntity = require('@cdo/apps/netsim/NetSimEntity');
var NetSimClientNode = require('@cdo/apps/netsim/NetSimClientNode');

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

  describe("static destroyEntities()", function () {
    var testShard;

    beforeEach(function () {
      testShard = fakeShard();
    });

    it ("returns immediate success for empty message list", function () {
      var success = false;
      NetSimEntity.destroyEntities([], function (err) {
        success = (err === null);
      });
      assert(success, "Called callback with null error");
    });

    it ("deletes all entities passed to it", function () {
      NetSimEntity.create(NetSimClientNode, testShard, function () {});
      NetSimEntity.create(NetSimClientNode, testShard, function () {});
      NetSimEntity.create(NetSimClientNode, testShard, function () {});
      assertTableSize(testShard, 'nodeTable', 3);

      var nodes;
      testShard.nodeTable.readAll(function (err, rows) {
        nodes = rows.map(function (row) {
          return new NetSimClientNode(testShard, row);
        });
      });
      assertEqual(3, nodes.length);
      assert(nodes[0] instanceof NetSimClientNode);

      NetSimEntity.destroyEntities(nodes, function () {});
      assertTableSize(testShard, 'nodeTable', 0);
    });
  });
});
