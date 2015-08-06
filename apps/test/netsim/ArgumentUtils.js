var testUtils = require('../util/testUtils');
var assert = testUtils.assert;
var assertEqual = testUtils.assertEqual;
var assertThrows = testUtils.assertThrows;

var ArgumentUtils = require('@cdo/apps/netsim/ArgumentUtils');

describe ("ArgumentUtils", function () {

  describe ("validateRequired", function () {
    it ("throws TypeError if argument is undefined", function () {
      assertThrows(TypeError, function () {
        ArgumentUtils.validateRequired(undefined, 'any old argument');
      });
    });

    it ("by default allows anything but undefined through", function () {
      ArgumentUtils.validateRequired(null, 'null');
      ArgumentUtils.validateRequired(NaN, 'NaN');
      ArgumentUtils.validateRequired(Infinity, 'Infinity');
      ArgumentUtils.validateRequired('string', 'string');
      ArgumentUtils.validateRequired(true, 'boolean true');
      ArgumentUtils.validateRequired(false, 'boolean false');
      ArgumentUtils.validateRequired({}, 'object');
      ArgumentUtils.validateRequired(setTimeout, 'function');
    });

    it ("throws TypeError if validator method doesn't return TRUE", function () {
      var validator = function (x) { return x < 3; };
      ArgumentUtils.validateRequired(2, 'just right', validator);
      assertThrows(TypeError, function () {
        ArgumentUtils.validateRequired(3, 'too high!', validator);
      });
    });
  });

  describe ("extendOptionsObject", function () {

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

    it ("retains members of original options object", function () {
      var originalOptions = { a: 1, b: 2, c: 3 };
      var options = ArgumentUtils.extendOptionsObject(originalOptions);
      for (var key in originalOptions) {
        assert(options.hasOwnProperty(key));
        assertEqual(originalOptions[key], options[key]);
      }
    });

    it ("adds get method to returned object, not original object", function () {
      var originalOptions = { a: 1, b: 2, c: 3 };
      var options = ArgumentUtils.extendOptionsObject(originalOptions);

      assert(options.hasOwnProperty('get'));
      assert(typeof options.get === 'function');
      assert(!originalOptions.hasOwnProperty('get'));
    });

    it ("returns an object even when passed undefined", function () {
      var options = ArgumentUtils.extendOptionsObject(undefined);
      assert(typeof options === 'object');
      assert(typeof options.get === 'function');
    });

    it ("throws Error if extending would overwrite existing 'get' property", function () {
      assertThrows(Error, function () {
        var originalOptions = { get: 1 };
        var _ = ArgumentUtils.extendOptionsObject(originalOptions);
      });
    });

    describe ('get()', function () {
      var originalOptions, options;

      beforeEach (function () {
        originalOptions = { a: 1, b: 2, c: 3 };
        options = ArgumentUtils.extendOptionsObject(originalOptions);
      });

      it ("in its simplest form passes through options", function () {
        assertEqual(1, options.get('a'));
        assertEqual(2, options.get('b'));
        assertEqual(3, options.get('c'));
      });

      it ("returns undefined for missing options by default", function () {
        assertEqual(undefined, options.get('d'));
      });

      it ("throws TypeError if validator method doesn't return TRUE", function () {
        var validator = function (x) { return x < 3; };
        assertEqual(1, options.get('a', validator));
        assertEqual(2, options.get('b', validator));
        assertThrows(TypeError, function () {
          options.get('c', validator);
        });
        assertEqual(undefined, options.get('d', validator));
      });

      it ("returns real value if found, even if default is provided", function () {
        var defaultValue = 15;
        assertEqual(1, options.get('a', undefined, defaultValue));
      });

      it ("returns default value if key not in original object", function () {
        var defaultValue = 15;
        assertEqual(defaultValue, options.get('d', undefined, defaultValue));
      });

      it ("returns default value if original object was undefined", function () {
        var defaultValue = 15;
        var opts = ArgumentUtils.extendOptionsObject(undefined);
        assertEqual(15, opts.get('anything', undefined, defaultValue));
      });

      it ("does not validate default value", function () {
        var validator = function (x) { return x < 3; };
        var defaultValue = 15;
        assertEqual(15, options.get('d', validator, defaultValue));
      });

    });

  });

  describe ("isPositiveNoninfiniteNumber", function () {
    var isValid = ArgumentUtils.isPositiveNoninfiniteNumber;

    it ("accepts zero, but not less", function () {
      assert(isValid(0));
      assert(!isValid(-1));
    });

    it ("rejects infinities", function () {
      assert(!isValid(Infinity));
      assert(!isValid(-Infinity));
    });

    it ("rejects null", function () {
      assert(!isValid(null));
    });

    it ("rejects NaN", function () {
      assert(!isValid(NaN));
    });

    it ("rejects undefined", function () {
      assert(!isValid(undefined));
    });

    it ("rejects strings", function () {
      assert(!isValid('string'));
      assert(!isValid('150'));
    });

    it ("rejects booleans", function () {
      assert(!isValid(true));
      assert(!isValid(false));
    });

    it ("rejects objects", function () {
      assert(!isValid({}));
    });

    it ("rejects functions", function () {
      assert(!isValid(function () {}));
    });
  });

  describe ("isBoolean", function () {
    var isValid = ArgumentUtils.isBoolean;

    it ("accepts booleans", function () {
      assert(isValid(true));
      assert(isValid(false));
    });

    it ("rejects numbers", function () {
      assert(!isValid(-1));
      assert(!isValid(0));
      assert(!isValid(1));
    });

    it ("rejects infinities", function () {
      assert(!isValid(Infinity));
      assert(!isValid(-Infinity));
    });

    it ("rejects null", function () {
      assert(!isValid(null));
    });

    it ("rejects NaN", function () {
      assert(!isValid(NaN));
    });

    it ("rejects undefined", function () {
      assert(!isValid(undefined));
    });

    it ("rejects strings", function () {
      assert(!isValid('string'));
      assert(!isValid('false'));
    });

    it ("rejects objects", function () {
      assert(!isValid({}));
    });

    it ("rejects functions", function () {
      assert(!isValid(function () {}));
    });
  });

  describe ("isString", function () {
    var isValid = ArgumentUtils.isString;

    it ("accepts strings", function () {
      assert(isValid(''));
      assert(isValid('string'));
    });

    it ("rejects numbers", function () {
      assert(!isValid(-1));
      assert(!isValid(0));
      assert(!isValid(1));
    });

    it ("rejects infinities", function () {
      assert(!isValid(Infinity));
      assert(!isValid(-Infinity));
    });

    it ("rejects null", function () {
      assert(!isValid(null));
    });

    it ("rejects NaN", function () {
      assert(!isValid(NaN));
    });

    it ("rejects undefined", function () {
      assert(!isValid(undefined));
    });

    it ("rejects booleans", function () {
      assert(!isValid(true));
      assert(!isValid(false));
    });

    it ("rejects objects", function () {
      assert(!isValid({}));
    });

    it ("rejects functions", function () {
      assert(!isValid(function () {}));
    });
  });

});
