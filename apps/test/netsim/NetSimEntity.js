var testUtils = require('../util/testUtils');
var assertEqual = testUtils.assertEqual;
var assertThrows = testUtils.assertThrows;

var NetSimEntity = testUtils.requireWithGlobalsCheckBuildFolder('netsim/NetSimEntity');

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
});
