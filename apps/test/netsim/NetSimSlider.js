var testUtils = require('../util/testUtils');
var assertEqual = testUtils.assertEqual;

var NetSimSlider = testUtils.requireWithGlobalsCheckBuildFolder('netsim/NetSimSlider');

describe("NetSimSlider", function () {
  var slider;

  var roundTrip = function (val) {
    return slider.sliderPositionToValue(slider.valueToSliderPosition(val));
  };

  describe("with default configuration", function () {
    beforeEach(function () {
      slider = new NetSimSlider(null, {});
    });

    it ("value round-trip is identity within slider range", function () {
      // Default range is 0-100
      assertEqual(0, roundTrip(0));
      assertEqual(1, roundTrip(1));
      assertEqual(42, roundTrip(42));
      assertEqual(99, roundTrip(99));
      assertEqual(100, roundTrip(100));
    });

    it ("clamps values to default range", function () {
      // Default range is 0-100
      assertEqual(0, roundTrip(-1));
      assertEqual(0, roundTrip(-100));
      assertEqual(0, roundTrip(-Infinity));

      assertEqual(100, roundTrip(101));
      assertEqual(100, roundTrip(500));
      assertEqual(100, roundTrip(Infinity));
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

    it ("value round-trip is identity within slider range", function () {
      // Default range is 0-100
      assertEqual(0, roundTrip(0));
      assertEqual(1, roundTrip(1));
      assertEqual(42, roundTrip(42));
      assertEqual(99, roundTrip(99));
      assertEqual(100, roundTrip(100));
    });

    it ("clamps values to infinities outside of range", function () {
      // Default range is 0-100
      assertEqual(-Infinity, roundTrip(-1));
      assertEqual(-Infinity, roundTrip(-100));
      assertEqual(-Infinity, roundTrip(-Infinity));

      assertEqual(Infinity, roundTrip(101));
      assertEqual(Infinity, roundTrip(500));
      assertEqual(Infinity, roundTrip(Infinity));
    });
  });
});
