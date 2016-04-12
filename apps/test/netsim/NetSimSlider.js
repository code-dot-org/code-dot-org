'use strict';
/* global describe, beforeEach, it */

var assert = require('../util/testUtils').assert;
var NetSimSlider = require('@cdo/apps/netsim/NetSimSlider');

describe("NetSimSlider", function () {
  var slider;

  var roundTrip = function (val) {
    return slider.sliderPositionToValue(slider.valueToSliderPosition(val));
  };

  describe("with default configuration", function () {
    beforeEach(function () {
      slider = new NetSimSlider(null, {});
    });

    it("value round-trip is identity within slider range", function () {
      // Default range is 0-100
      assert.equal(0, roundTrip(0));
      assert.equal(1, roundTrip(1));
      assert.equal(42, roundTrip(42));
      assert.equal(99, roundTrip(99));
      assert.equal(100, roundTrip(100));
    });

    it("clamps values to default range", function () {
      // Default range is 0-100
      assert.equal(0, roundTrip(-1));
      assert.equal(0, roundTrip(-100));
      assert.equal(0, roundTrip(-Infinity));

      assert.equal(100, roundTrip(101));
      assert.equal(100, roundTrip(500));
      assert.equal(100, roundTrip(Infinity));
    });
  });

  describe("with negative step value", function () {
    beforeEach(function () {
      slider = new NetSimSlider(null, {
        min: 0,
        max: 100,
        step: -1
      });
    });

    it("value round-trip is identity within slider range", function () {
      // Range is 100-0
      assert.equal(100, roundTrip(100));
      assert.equal(99, roundTrip(99));
      assert.equal(42, roundTrip(42));
      assert.equal(1, roundTrip(1));
      assert.equal(0, roundTrip(0));
    });

    it("clamps values to default range", function () {
      // Range is 100-0
      assert.equal(100, roundTrip(101));
      assert.equal(100, roundTrip(500));
      assert.equal(100, roundTrip(Infinity));

      assert.equal(0, roundTrip(-1));
      assert.equal(0, roundTrip(-100));
      assert.equal(0, roundTrip(-Infinity));
    });
  });

  describe("with infinte bounds", function () {
    beforeEach(function () {
      slider = new NetSimSlider(null, {
        min: 0,
        max: 100,
        lowerBoundInfinite: true,
        upperBoundInfinite: true
      });
    });

    it("value round-trip is identity within slider range", function () {
      assert.equal(0, roundTrip(0));
      assert.equal(1, roundTrip(1));
      assert.equal(42, roundTrip(42));
      assert.equal(99, roundTrip(99));
      assert.equal(100, roundTrip(100));
    });

    it("clamps values to infinities outside of range", function () {
      assert.equal(-Infinity, roundTrip(-1));
      assert.equal(-Infinity, roundTrip(-100));
      assert.equal(-Infinity, roundTrip(-Infinity));

      assert.equal(Infinity, roundTrip(101));
      assert.equal(Infinity, roundTrip(500));
      assert.equal(Infinity, roundTrip(Infinity));
    });
  });

  describe("bad configurations", function () {
    it("throws when initialized with noninteger step values", function () {
      assert.throws(function () {
        slider = new NetSimSlider(null, { step: 0.1 });
      }, Error);

      assert.throws(function () {
        slider = new NetSimSlider(null, { step: 5.1 });
      }, Error);
    });

    it("throws when initialized with a zero step value", function () {
      assert.throws(function () {
        slider = new NetSimSlider(null, { step: 0 });
      }, Error);
    });
  });
});

describe("NetSimSlider.DecimalPrecisionSlider", function () {
  var slider;

  var roundTrip = function (val) {
    return slider.sliderPositionToValue(slider.valueToSliderPosition(val));
  };

  it("has default precision of 2 decimal places", function () {
    slider = new NetSimSlider.DecimalPrecisionSlider(null, { step: 0.1 });
    slider = new NetSimSlider.DecimalPrecisionSlider(null, { step: 0.01 });
    assert.throws(function () {
      slider = new NetSimSlider.DecimalPrecisionSlider(null, { step: 0.001 });
    }, Error);
  });

  it("can be constructed with greater precision", function () {
    slider = new NetSimSlider.DecimalPrecisionSlider(null, { precision: 3, step: 0.001 });
    assert.throws(function () {
      slider = new NetSimSlider.DecimalPrecisionSlider(null, { precision: 3, step: 0.0001 });
    }, Error);
  });

  it("value round-trip is identity within slider range", function () {
    slider = new NetSimSlider.DecimalPrecisionSlider(null, { min: 0.1, max: 1.0, step: 0.1 });

    assert.equal(0.1, roundTrip(0.1));
    assert.equal(0.2, roundTrip(0.2));
    assert.equal(0.4, roundTrip(0.4));
    assert.equal(0.9, roundTrip(0.9));
    assert.equal(1.0, roundTrip(1.0));
  });

  it("clamps values to default range", function () {
    slider = new NetSimSlider.DecimalPrecisionSlider(null, { min: 0.1, max: 1.0, step: 0.1 });

    assert.equal(0.1, roundTrip(0.09));
    assert.equal(0.1, roundTrip(0));
    assert.equal(0.1, roundTrip(-Infinity));

    assert.equal(1.0, roundTrip(1.01));
    assert.equal(1.0, roundTrip(5));
    assert.equal(1.0, roundTrip(Infinity));
  });
});

describe("NetSimSlider.LogarithmicSlider", function () {
  var LogarithmicSlider = NetSimSlider.LogarithmicSlider;
  var slider;

  var roundTrip = function (val) {
    return slider.sliderPositionToValue(slider.valueToSliderPosition(val));
  };

  describe("with default configuration", function () {
    beforeEach(function () {
      slider = new LogarithmicSlider(null, {});
    });

    it("value round-trip is identity for 2^x values within slider range", function () {
      // Default range is 1-100
      assert.equal(2, roundTrip(2));
      assert.equal(4, roundTrip(4));
      assert.equal(8, roundTrip(8));
      assert.equal(16, roundTrip(16));
      assert.equal(32, roundTrip(32));
      assert.equal(64, roundTrip(64));
    });

    it("value round-trip rounds down to nearest 2^x value", function () {
      // Default range is 1-100
      assert.equal(2, roundTrip(3));
      assert.equal(4, roundTrip(7));
      assert.equal(8, roundTrip(15));
      assert.equal(16, roundTrip(31));
      assert.equal(32, roundTrip(63));
      assert.equal(64, roundTrip(99));
    });

    it("value round-trip is identity for min and max values", function () {
      // Default range is 1-100
      assert.equal(1, roundTrip(1));
      assert.equal(100, roundTrip(100));
    });

    it("clamps values to default range", function () {
      // Default range is 1-100
      assert.equal(1, roundTrip(-1));
      assert.equal(1, roundTrip(-100));
      assert.equal(1, roundTrip(-Infinity));

      assert.equal(100, roundTrip(101));
      assert.equal(100, roundTrip(500));
      assert.equal(100, roundTrip(Infinity));
    });

    it("values are powers of two of the slider positions", function () {
      assert.equal(1, slider.sliderPositionToValue(0));
      assert.equal(2, slider.sliderPositionToValue(1));
      assert.equal(4, slider.sliderPositionToValue(2));
      assert.equal(8, slider.sliderPositionToValue(3));
      assert.equal(16, slider.sliderPositionToValue(4));
      assert.equal(32, slider.sliderPositionToValue(5));
      assert.equal(64, slider.sliderPositionToValue(6));
    });

    it("values are clamped at extreme slider positions", function () {
      assert.equal(1, slider.sliderPositionToValue(-1));
      assert.equal(100, slider.sliderPositionToValue(7));
    });
  });

  describe("with infinte bounds and exact min/max", function () {
    beforeEach(function () {
      // Configuration gives the slider the following positions:
      // NegInfinity-16-32-64-Infinity
      slider = new LogarithmicSlider(null, {
        min: 16,
        max: 64,
        lowerBoundInfinite: true,
        upperBoundInfinite: true
      });
    });

    it("value round-trip is identity for 2^x values within slider range", function () {
      assert.equal(32, roundTrip(32));
    });

    it("value round-trip rounds down to nearest 2^x value or miniumum", function () {
      assert.equal(16, roundTrip(31));
      assert.equal(32, roundTrip(63));
    });

    it("value round-trip is identity for exact min and max values", function () {
      // Default range is 1-100
      assert.equal(16, roundTrip(16));
      assert.equal(64, roundTrip(64));
    });

    it("clamps values to infinities outside of range", function () {
      assert.equal(-Infinity, roundTrip(15));
      assert.equal(-Infinity, roundTrip(-100));
      assert.equal(-Infinity, roundTrip(-Infinity));

      assert.equal(Infinity, roundTrip(65));
      assert.equal(Infinity, roundTrip(500));
      assert.equal(Infinity, roundTrip(Infinity));
    });
  });

  describe("with infinte bounds and offset min/max", function () {
    beforeEach(function () {
      // Configuration gives the slider the following positions:
      // NegInfinity-25-32-64-75-Infinity
      slider = new LogarithmicSlider(null, {
        min: 25,
        max: 75,
        lowerBoundInfinite: true,
        upperBoundInfinite: true
      });
    });

    it("value round-trip is identity for 2^x values within slider range", function () {
      assert.equal(32, roundTrip(32));
      assert.equal(64, roundTrip(64));
    });

    it("value round-trip rounds down to nearest 2^x value or miniumum", function () {
      assert.equal(25, roundTrip(31));
      assert.equal(32, roundTrip(63));
      assert.equal(64, roundTrip(74));
    });

    it("value round-trip is identity for exact min and max values", function () {
      // Default range is 1-100
      assert.equal(25, roundTrip(25));
      assert.equal(75, roundTrip(75));
    });

    it("clamps values to infinities outside of range", function () {
      assert.equal(-Infinity, roundTrip(24));
      assert.equal(-Infinity, roundTrip(-100));
      assert.equal(-Infinity, roundTrip(-Infinity));

      assert.equal(Infinity, roundTrip(76));
      assert.equal(Infinity, roundTrip(500));
      assert.equal(Infinity, roundTrip(Infinity));
    });
  });

  describe("with base-10", function () {
    beforeEach(function () {
      // Configuration gives the slider the following positions:
      // 8-10-100-1000-1024
      slider = new LogarithmicSlider(null, {
        logBase: 10,
        min: 8,
        max: 1024
      });
    });

    it("value round-trip is identity for 10^x values within slider range", function () {
      assert.equal(10, roundTrip(10));
      assert.equal(100, roundTrip(100));
      assert.equal(1000, roundTrip(1000));
    });

    it("value round-trip rounds down to nearest 10^x value or minimum", function () {
      assert.equal(8, roundTrip(9));
      assert.equal(10, roundTrip(99));
      assert.equal(100, roundTrip(999));
    });

    it("value round-trip is identity for min and max values", function () {
      assert.equal(8, roundTrip(8));
      assert.equal(1024, roundTrip(1024));
    });

    it("clamps values to range", function () {
      assert.equal(8, roundTrip(7));
      assert.equal(8, roundTrip(-100));
      assert.equal(8, roundTrip(-Infinity));

      assert.equal(1024, roundTrip(1025));
      assert.equal(1024, roundTrip(5000));
      assert.equal(1024, roundTrip(Infinity));
    });

    it("values are powers of ten of the slider positions", function () {
      assert.equal(10, slider.sliderPositionToValue(1));
      assert.equal(100, slider.sliderPositionToValue(2));
      assert.equal(1000, slider.sliderPositionToValue(3));
    });

    it("values are clamped at extreme slider positions", function () {
      assert.equal(8, slider.sliderPositionToValue(0));
      assert.equal(1024, slider.sliderPositionToValue(4));
    });
  });
});
