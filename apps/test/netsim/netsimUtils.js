var testUtils = require('../util/testUtils');
var assertEqual = testUtils.assertEqual;

var netsimUtils = testUtils.requireWithGlobalsCheckBuildFolder('netsim/netsimUtils');

describe("netsimUtils", function () {

  describe("serializeNumber", function () {
    var serializeNumber = netsimUtils.serializeNumber;

    it("turns Infinity into a string", function () {
      assertEqual('Infinity', serializeNumber(Infinity));
    });

    it("turns -Infinity into a string", function () {
      assertEqual('-Infinity', serializeNumber(-Infinity));
    });

    it("turns NaN into a string", function () {
      assertEqual('NaN', serializeNumber(NaN));
    });

    it ("turns undefined into a string", function () {
      assertEqual('undefined', serializeNumber(undefined));
    });

    it("leaves other values alone", function () {
      assertEqual(42, serializeNumber(42));
      assertEqual(Math.PI, serializeNumber(Math.PI));
      assertEqual(null, serializeNumber(null));
    });
  });

  describe("deserializeNumber", function () {
    var deserializeNumber = netsimUtils.deserializeNumber;

    it("turns 'Infinity' into Infinity", function () {
      assertEqual(Infinity, deserializeNumber('Infinity'));
    });

    it("turns '-Infinity' into -Infinity", function () {
      assertEqual(-Infinity, deserializeNumber('-Infinity'));
    });

    it("turns 'NaN' into NaN", function () {
      assertEqual(NaN, deserializeNumber('NaN'));
    });

    it("turns 'undefined' into undefined", function () {
      assertEqual(undefined, deserializeNumber('undefined'));
    });

    it("leaves other values alone", function () {
      assertEqual(42, deserializeNumber(42));
      assertEqual(Math.PI, deserializeNumber(Math.PI));
      assertEqual(null, deserializeNumber(null));
    });
  });

  describe("number serialize-deserialize round trip", function () {
    var serializeNumber = netsimUtils.serializeNumber;
    var deserializeNumber = netsimUtils.deserializeNumber;
    var roundTripTest = function (val) {
      var resultValue = deserializeNumber(JSON.parse(JSON.stringify(serializeNumber(val))));
      assertEqual(val, resultValue);
    };

    it ("preserves Infinities", function () {
      roundTripTest(Infinity);
      roundTripTest(-Infinity);
    });

    it ("preserves NaN", function () {
      roundTripTest(NaN);
    });

    it ("preserves numbers", function () {
      roundTripTest(42);
      roundTripTest(Math.PI);
    });

    it ("preserves empty values", function () {
      roundTripTest(null);
      roundTripTest(undefined);
    });
  });

});
