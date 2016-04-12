'use strict';
/* global describe, beforeEach, it */

var testUtils = require('../util/testUtils');
var NetSimTestUtils = require('../util/netsimTestUtils');
var NetSimEntity = require('@cdo/apps/netsim/NetSimEntity');
var NetSimClientNode = require('@cdo/apps/netsim/NetSimClientNode');

var assert = testUtils.assert;
var assertTableSize = NetSimTestUtils.assertTableSize;
var fakeShard = NetSimTestUtils.fakeShard;

testUtils.setupLocale('netsim');

describe("NetSimEntity", function () {
  it("default entityID is undefined", function () {
    var entity = new NetSimEntity(undefined, undefined);
    assert.isUndefined(entity.entityID);
  });

  it("doesn't implement getTable", function () {
    var entity = new NetSimEntity(undefined, undefined);
    assert.throws(function () {
      entity.getTable();
    }, Error);
  });

  it("buildRow method produces empty object", function () {
    var entity = new NetSimEntity(undefined, undefined);
    assert.deepEqual(entity.buildRow(), {});
  });

  it("disallows static creation on base type", function () {
    assert.throws(function () {
      NetSimEntity.create(NetSimEntity, undefined, function () {});
    }, Error);
  });

  it("disallows static fetch of base type", function () {
    assert.throws(function () {
      NetSimEntity.get(NetSimEntity, 1, undefined, function () {});
    }, Error);
  });

  describe("static create()", function () {
    var testShard;

    beforeEach(function () {
      testShard = fakeShard();
    });

    it("creates and returns an entity fo the correct type", function () {
      assertTableSize(testShard, 'nodeTable', 0);

      var entity;
      NetSimEntity.create(NetSimClientNode, testShard, function (err, newNode) {
        entity = newNode;
      });
      assert.isDefined(entity);
      assert.instanceOf(entity, NetSimClientNode);
      assertTableSize(testShard, 'nodeTable', 1);

    });
  });

  describe("static get()", function () {
    var testShard;

    beforeEach(function () {
      testShard = fakeShard();
    });

    it("returns null if entity is not found", function () {
      var entity;
      NetSimEntity.get(NetSimClientNode, 15, testShard, function (err, foundEntity) {
        entity = foundEntity;
      });
      assert.isNull(entity, "Should return null when entity not found, returned " + entity);
    });

    it("returns entity of correct type, if found", function () {
      var clientNodeID;
      NetSimEntity.create(NetSimClientNode, testShard, function (err, newNode) {
        clientNodeID = newNode.entityID;
      });
      assert.isDefined(clientNodeID, "Expected a client node ID");

      var entity;
      NetSimEntity.get(NetSimClientNode, clientNodeID, testShard, function (err, foundEntity) {
        entity = foundEntity;
      });
      assert.instanceOf(entity, NetSimClientNode, "Expect to create correct entity type");
      assert.equal(entity.entityID, clientNodeID);
    });
  });

  describe("static destroyEntities()", function () {
    var testShard;

    beforeEach(function () {
      testShard = fakeShard();
    });

    it("returns immediate success for empty message list", function () {
      var success = false;
      NetSimEntity.destroyEntities([], function (err) {
        success = (err === null);
      });
      assert(success, "Called callback with null error");
    });

    it("deletes all entities passed to it", function () {
      NetSimEntity.create(NetSimClientNode, testShard, function () {});
      NetSimEntity.create(NetSimClientNode, testShard, function () {});
      NetSimEntity.create(NetSimClientNode, testShard, function () {});
      assertTableSize(testShard, 'nodeTable', 3);

      testShard.nodeTable.refresh();
      var nodes = testShard.nodeTable.readAll().map(function (row) {
        return new NetSimClientNode(testShard, row);
      });
      assert.equal(nodes.length, 3);
      assert.instanceOf(nodes[0], NetSimClientNode);

      NetSimEntity.destroyEntities(nodes, function () {});
      assertTableSize(testShard, 'nodeTable', 0);
    });
  });
});
