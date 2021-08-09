import {assert, expect} from '../../util/deprecatedChai';
var NetSimTestUtils = require('../../util/netsimTestUtils');
var NetSimUtils = require('@cdo/apps/netsim/NetSimUtils');

describe('NetSimUtils', function() {
  beforeEach(function() {
    NetSimTestUtils.initializeGlobalsToDefaultValues();
  });

  describe('serializeNumber', function() {
    var serializeNumber = NetSimUtils.serializeNumber;

    it('turns Infinity into a string', function() {
      assert.equal('Infinity', serializeNumber(Infinity));
    });

    it('turns -Infinity into a string', function() {
      assert.equal('-Infinity', serializeNumber(-Infinity));
    });

    it('turns NaN into a string', function() {
      assert.equal('NaN', serializeNumber(NaN));
    });

    it('turns undefined into a string', function() {
      assert.equal('undefined', serializeNumber(undefined));
    });

    it('leaves other values alone', function() {
      assert.equal(42, serializeNumber(42));
      assert.equal(Math.PI, serializeNumber(Math.PI));
      assert.equal(null, serializeNumber(null));
    });
  });

  describe('deserializeNumber', function() {
    var deserializeNumber = NetSimUtils.deserializeNumber;

    it("turns 'Infinity' into Infinity", function() {
      assert.equal(Infinity, deserializeNumber('Infinity'));
    });

    it("turns '-Infinity' into -Infinity", function() {
      assert.equal(-Infinity, deserializeNumber('-Infinity'));
    });

    it("turns 'NaN' into NaN", function() {
      var result = deserializeNumber('NaN');
      assert(isNaN(result));
      assert(result !== result); // Unique to NaN
    });

    it("turns 'undefined' into undefined", function() {
      assert.equal(undefined, deserializeNumber('undefined'));
    });

    it('leaves other values alone', function() {
      assert.equal(42, deserializeNumber(42));
      assert.equal(Math.PI, deserializeNumber(Math.PI));
      assert.equal(null, deserializeNumber(null));
    });
  });

  describe('number serialize-deserialize round trip', function() {
    var serializeNumber = NetSimUtils.serializeNumber;
    var deserializeNumber = NetSimUtils.deserializeNumber;
    var roundTripTest = function(val) {
      var resultValue = deserializeNumber(
        JSON.parse(JSON.stringify(serializeNumber(val)))
      );
      assert.equal(val, resultValue);
    };

    it('preserves Infinities', function() {
      roundTripTest(Infinity);
      roundTripTest(-Infinity);
    });

    it('preserves NaN', function() {
      var originalValue = NaN;
      var resultValue = deserializeNumber(
        JSON.parse(JSON.stringify(serializeNumber(originalValue)))
      );
      assert(isNaN(resultValue));
      assert(originalValue !== resultValue); // Unique to NaN
    });

    it('preserves numbers', function() {
      roundTripTest(42);
      roundTripTest(Math.PI);
    });

    it('preserves empty values', function() {
      roundTripTest(null);
      roundTripTest(undefined);
    });
  });

  describe('scrubHeaderSpecForBackwardsCompatibility', function() {
    var scrubHeaderSpecForBackwardsCompatibility =
      NetSimUtils.scrubHeaderSpecForBackwardsCompatibility;

    it('is a no-op for empty array', function() {
      assert.deepEqual([], scrubHeaderSpecForBackwardsCompatibility([]));
    });

    it('is a no-op for new format', function() {
      assert.deepEqual(
        ['toAddress'],
        scrubHeaderSpecForBackwardsCompatibility(['toAddress'])
      );

      assert.deepEqual(
        ['toAddress', 'fromAddress'],
        scrubHeaderSpecForBackwardsCompatibility(['toAddress', 'fromAddress'])
      );

      assert.deepEqual(
        ['toAddress', 'fromAddress', 'packetCount', 'packetIndex'],
        scrubHeaderSpecForBackwardsCompatibility([
          'toAddress',
          'fromAddress',
          'packetCount',
          'packetIndex'
        ])
      );
    });

    it('converts old format to new format', function() {
      assert.deepEqual(
        ['toAddress'],
        scrubHeaderSpecForBackwardsCompatibility([{key: 'toAddress', bits: 4}])
      );

      assert.deepEqual(
        ['toAddress', 'fromAddress'],
        scrubHeaderSpecForBackwardsCompatibility([
          {key: 'toAddress', bits: 4},
          {key: 'fromAddress', bits: 4}
        ])
      );

      assert.deepEqual(
        ['toAddress', 'fromAddress', 'packetCount', 'packetIndex'],
        scrubHeaderSpecForBackwardsCompatibility([
          {key: 'toAddress', bits: 4},
          {key: 'fromAddress', bits: 4},
          {key: 'packetCount', bits: 4},
          {key: 'packetIndex', bits: 4}
        ])
      );
    });
  });

  describe('getUniqueLevelKeyFromLocation', function() {
    const getUniqueLevelKeyFromLocation =
      NetSimUtils.getUniqueLevelKeyFromLocation;

    /**
     * Given a full URL, generates an anchor element which implements the
     * HTMLHyperlinkElementUtils interface, which happens to be an
     * exact subset of the Location interface - so we can use it to test our
     * method that will normally take window.location.
     *
     * @param {string} url
     * @return {HTMLHyperlinkElementUtils}
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Location
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils
     * @see http://stackoverflow.com/questions/3213531/creating-a-new-location-object-in-javascript
     */
    function urlToLocation(url) {
      let anchor = document.createElement('a');
      anchor.href = url;
      return anchor;
    }

    function urlToKey(url) {
      return getUniqueLevelKeyFromLocation(urlToLocation(url));
    }

    it('Omits protocol, origin and port from key', function() {
      expect(urlToKey('http://code.org:3000/key')).to.equal('key');
      expect(urlToKey('https://studio.code.org/key')).to.equal('key');
    });

    it('Omits search and hash from key', function() {
      expect(urlToKey('https://code.org/key?foo=bar&baz=false')).to.equal(
        'key'
      );
      expect(urlToKey('https://code.org/key#anchor')).to.equal('key');
    });

    it('Replaces non-word characters with dashes', function() {
      expect(urlToKey('https://studio.code.org/one/thing/at/a/time')).to.equal(
        'one-thing-at-a-time'
      );
      expect(urlToKey('https://code.org/What%20s%20That')).to.equal(
        'What-20s-20That'
      );
    });

    it('ignores trailing slash in the URL', function() {
      expect('s-csp1-2019-lessons-3-levels-2')
        .to.equal(
          urlToKey('https://studio.code.org/s/csp1-2019/lessons/3/levels/2')
        )
        .to.equal(
          urlToKey('https://studio.code.org/s/csp1-2019/lessons/3/levels/2/')
        );
    });
  });
});
