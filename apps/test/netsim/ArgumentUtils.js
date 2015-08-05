var testUtils = require('../util/testUtils');
var assert = testUtils.assert;
var assertEqual = testUtils.assertEqual;
var assertThrows = testUtils.assertThrows;

var ArgumentUtils = require('@cdo/apps/netsim/ArgumentUtils');

describe("ArgumentUtils", function () {

  describe("extendOptionsObject", function () {

    it ("is valid to pass empty object", function () {
      var _ = ArgumentUtils.extendOptionsObject({});
    });

    it ("is valid to pass undefined", function () {
      var _ = ArgumentUtils.extendOptionsObject(undefined);
    });

    it ("throws TypeError if passed null", function () {
      assertThrows(TypeError, function () {
        var _ = ArgumentUtils.extendOptionsObject(null);
      });
    });

    it ("throws TypeError if passed non-object", function () {
      assertThrows(TypeError, function () {
        var _ = ArgumentUtils.extendOptionsObject("string");
      });

      assertThrows(TypeError, function () {
        var _ = ArgumentUtils.extendOptionsObject(15); // number
      });

      assertThrows(TypeError, function () {
        var _ = ArgumentUtils.extendOptionsObject(true); // boolean
      });

      assertThrows(TypeError, function () {
        var _ = ArgumentUtils.extendOptionsObject(NaN); // Not-a-number
      });
    });

  });

});
