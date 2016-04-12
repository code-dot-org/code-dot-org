'use strict';
/* global describe, beforeEach, it */

var assert = require('../util/testUtils').assert;
var ArgumentUtils = require('@cdo/apps/netsim/ArgumentUtils');

describe("ArgumentUtils", function () {

  describe("validateRequired", function () {
    it("throws TypeError if argument is undefined", function () {
      assert.throws(function () {
        ArgumentUtils.validateRequired(undefined, 'any old argument');
      }, TypeError);
    });

    it("by default allows anything but undefined through", function () {
      ArgumentUtils.validateRequired(null, 'null');
      ArgumentUtils.validateRequired(NaN, 'NaN');
      ArgumentUtils.validateRequired(Infinity, 'Infinity');
      ArgumentUtils.validateRequired('string', 'string');
      ArgumentUtils.validateRequired(true, 'boolean true');
      ArgumentUtils.validateRequired(false, 'boolean false');
      ArgumentUtils.validateRequired({}, 'object');
      ArgumentUtils.validateRequired(setTimeout, 'function');
    });

    it("throws TypeError if validator method doesn't return TRUE", function () {
      var validator = function (x) { return x < 3; };
      ArgumentUtils.validateRequired(2, 'just right', validator);
      assert.throws(function () {
        ArgumentUtils.validateRequired(3, 'too high!', validator);
      }, TypeError);
    });
  });

  describe("extendOptionsObject", function () {

    it("is valid to pass empty object", function () {
      ArgumentUtils.extendOptionsObject({});
    });

    it("is valid to pass undefined", function () {
      ArgumentUtils.extendOptionsObject(undefined);
    });

    it("throws TypeError if passed null", function () {
      assert.throws(function () {
        ArgumentUtils.extendOptionsObject(null);
      }, TypeError);
    });

    it("throws TypeError if passed non-object", function () {
      assert.throws(function () {
        ArgumentUtils.extendOptionsObject("string");
      }, TypeError);

      assert.throws(function () {
        ArgumentUtils.extendOptionsObject(15); // number
      }, TypeError);

      assert.throws(function () {
        ArgumentUtils.extendOptionsObject(true); // boolean
      }, TypeError);

      assert.throws(function () {
        ArgumentUtils.extendOptionsObject(NaN); // Not-a-number
      }, TypeError);
    });

    it("retains members of original options object", function () {
      var originalOptions = { a: 1, b: 2, c: 3 };
      var options = ArgumentUtils.extendOptionsObject(originalOptions);
      for (var key in originalOptions) {
        assert(options.hasOwnProperty(key));
        assert.equal(options[key], originalOptions[key]);
      }
    });

    it("adds get method to returned object, not original object", function () {
      var originalOptions = { a: 1, b: 2, c: 3 };
      var options = ArgumentUtils.extendOptionsObject(originalOptions);

      assert.property(options, 'get');
      assert.equal(typeof options.get, 'function');
      assert.notProperty(originalOptions, 'get');
    });

    it("returns an object even when passed undefined", function () {
      var options = ArgumentUtils.extendOptionsObject(undefined);
      assert.equal(typeof options, 'object');
      assert.equal(typeof options.get, 'function');
    });

    it("throws Error if extending would overwrite existing 'get' property", function () {
      assert.throws(function () {
        var originalOptions = { get: 1 };
        ArgumentUtils.extendOptionsObject(originalOptions);
      }, Error);
    });

    describe('get()', function () {
      var originalOptions, options;

      beforeEach(function () {
        originalOptions = { a: 1, b: 2, c: 3 };
        options = ArgumentUtils.extendOptionsObject(originalOptions);
      });

      it("in its simplest form passes through options", function () {
        assert.equal(options.get('a'), 1);
        assert.equal(options.get('b'), 2);
        assert.equal(options.get('c'), 3);
      });

      it("returns undefined for missing options by default", function () {
        assert.equal(options.get('d'), undefined);
      });

      it("throws TypeError if validator method doesn't return TRUE", function () {
        var validator = function (x) { return x < 3; };
        assert.equal(options.get('a', validator), 1);
        assert.equal(options.get('b', validator), 2);
        assert.throws(function () {
          options.get('c', validator);
        }, TypeError);
        assert.equal(options.get('d', validator), undefined);
      });

      it("returns real value if found, even if default is provided", function () {
        var defaultValue = 15;
        assert.equal(options.get('a', undefined, defaultValue), 1);
      });

      it("returns default value if key not in original object", function () {
        var defaultValue = 15;
        assert.equal(options.get('d', undefined, defaultValue), defaultValue);
      });

      it("returns default value if original object was undefined", function () {
        var defaultValue = 15;
        var opts = ArgumentUtils.extendOptionsObject(undefined);
        assert.equal(opts.get('anything', undefined, defaultValue), defaultValue);
      });

      it("does not validate default value", function () {
        var validator = function (x) { return x < 3; };
        var defaultValue = 15;
        assert.equal(options.get('d', validator, defaultValue), defaultValue);
      });

    });

  });

  describe("isPositiveNoninfiniteNumber", function () {
    var isValid = ArgumentUtils.isPositiveNoninfiniteNumber;

    it("accepts zero, but not less", function () {
      assert.isTrue(isValid(0));
      assert.isFalse(isValid(-1));
    });

    it("rejects infinities", function () {
      assert.isFalse(isValid(Infinity));
      assert.isFalse(isValid(-Infinity));
    });

    it("rejects null", function () {
      assert.isFalse(isValid(null));
    });

    it("rejects NaN", function () {
      assert.isFalse(isValid(NaN));
    });

    it("rejects undefined", function () {
      assert.isFalse(isValid(undefined));
    });

    it("rejects strings", function () {
      assert.isFalse(isValid('string'));
      assert.isFalse(isValid('150'));
    });

    it("rejects booleans", function () {
      assert.isFalse(isValid(true));
      assert.isFalse(isValid(false));
    });

    it("rejects objects", function () {
      assert.isFalse(isValid({}));
    });

    it("rejects functions", function () {
      assert.isFalse(isValid(function () {}));
    });
  });

  describe("isBoolean", function () {
    var isValid = ArgumentUtils.isBoolean;

    it("accepts booleans", function () {
      assert.isTrue(isValid(true));
      assert.isTrue(isValid(false));
    });

    it("rejects numbers", function () {
      assert.isFalse(isValid(-1));
      assert.isFalse(isValid(0));
      assert.isFalse(isValid(1));
    });

    it("rejects infinities", function () {
      assert.isFalse(isValid(Infinity));
      assert.isFalse(isValid(-Infinity));
    });

    it("rejects null", function () {
      assert.isFalse(isValid(null));
    });

    it("rejects NaN", function () {
      assert.isFalse(isValid(NaN));
    });

    it("rejects undefined", function () {
      assert.isFalse(isValid(undefined));
    });

    it("rejects strings", function () {
      assert.isFalse(isValid('string'));
      assert.isFalse(isValid('false'));
    });

    it("rejects objects", function () {
      assert.isFalse(isValid({}));
    });

    it("rejects functions", function () {
      assert.isFalse(isValid(function () {}));
    });
  });

  describe("isString", function () {
    var isValid = ArgumentUtils.isString;

    it("accepts strings", function () {
      assert.isTrue(isValid(''));
      assert.isTrue(isValid('string'));
    });

    it("rejects numbers", function () {
      assert.isFalse(isValid(-1));
      assert.isFalse(isValid(0));
      assert.isFalse(isValid(1));
    });

    it("rejects infinities", function () {
      assert.isFalse(isValid(Infinity));
      assert.isFalse(isValid(-Infinity));
    });

    it("rejects null", function () {
      assert.isFalse(isValid(null));
    });

    it("rejects NaN", function () {
      assert.isFalse(isValid(NaN));
    });

    it("rejects undefined", function () {
      assert.isFalse(isValid(undefined));
    });

    it("rejects booleans", function () {
      assert.isFalse(isValid(true));
      assert.isFalse(isValid(false));
    });

    it("rejects objects", function () {
      assert.isFalse(isValid({}));
    });

    it("rejects functions", function () {
      assert.isFalse(isValid(function () {}));
    });
  });

});
