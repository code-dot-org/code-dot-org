var testUtils = require('../util/testUtils');
var assert = testUtils.assert;

var NetSimEntity = testUtils.requireWithGlobalsCheckBuildFolder('netsim/NetSimEntity');
var _ = testUtils.requireWithGlobalsCheckBuildFolder('utils').getLodash();

var assertEqual = function (left, right) {
  assert(_.isEqual(left, right),
      JSON.stringify(left) + ' equals ' + JSON.stringify(right));
};

var assertThrows = function (exceptionType, fn) {
  var x;
  try {
    fn();
  } catch (e) {
    x = e;
  }
  assert(x !== undefined, "Didn't throw!");
  assert(x.constructor === exceptionType, "Threw " + x.constructor.name +
      ", expected " + exceptionType.name + "; " +
      JSON.stringify(x));
};

describe("NetSimEntity", function () {
  var apiTable, netsimTable, callback, notified;

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
      NetSimEntity.create(NetSimEntity, undefined, function () {});
    });
  });
});
