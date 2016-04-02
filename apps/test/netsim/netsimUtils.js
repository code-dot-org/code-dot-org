'use strict';
/* global describe, beforeEach, it */

var assert = require('../util/testUtils').assert;
var NetSimTestUtils = require('../util/netsimTestUtils');
var NetSimUtils = require('@cdo/apps/netsim/NetSimUtils');

describe("NetSimUtils", function () {

  beforeEach(function () {
    NetSimTestUtils.initializeGlobalsToDefaultValues();
  });

  describe("serializeNumber", function () {
    var serializeNumber = NetSimUtils.serializeNumber;

    it("turns Infinity into a string", function () {
      assert.equal('Infinity', serializeNumber(Infinity));
    });

    it("turns -Infinity into a string", function () {
      assert.equal('-Infinity', serializeNumber(-Infinity));
    });

    it("turns NaN into a string", function () {
      assert.equal('NaN', serializeNumber(NaN));
    });

    it("turns undefined into a string", function () {
      assert.equal('undefined', serializeNumber(undefined));
    });

    it("leaves other values alone", function () {
      assert.equal(42, serializeNumber(42));
      assert.equal(Math.PI, serializeNumber(Math.PI));
      assert.equal(null, serializeNumber(null));
    });
  });

  describe("deserializeNumber", function () {
    var deserializeNumber = NetSimUtils.deserializeNumber;

    it("turns 'Infinity' into Infinity", function () {
      assert.equal(Infinity, deserializeNumber('Infinity'));
    });

    it("turns '-Infinity' into -Infinity", function () {
      assert.equal(-Infinity, deserializeNumber('-Infinity'));
    });

    it("turns 'NaN' into NaN", function () {
      var result = deserializeNumber('NaN');
      assert(isNaN(result));
      assert(result !== result); // Unique to NaN
    });

    it("turns 'undefined' into undefined", function () {
      assert.equal(undefined, deserializeNumber('undefined'));
    });

    it("leaves other values alone", function () {
      assert.equal(42, deserializeNumber(42));
      assert.equal(Math.PI, deserializeNumber(Math.PI));
      assert.equal(null, deserializeNumber(null));
    });
  });

  describe("number serialize-deserialize round trip", function () {
    var serializeNumber = NetSimUtils.serializeNumber;
    var deserializeNumber = NetSimUtils.deserializeNumber;
    var roundTripTest = function (val) {
      var resultValue = deserializeNumber(JSON.parse(JSON.stringify(serializeNumber(val))));
      assert.equal(val, resultValue);
    };

    it("preserves Infinities", function () {
      roundTripTest(Infinity);
      roundTripTest(-Infinity);
    });

    it("preserves NaN", function () {
      var originalValue = NaN;
      var resultValue = deserializeNumber(
          JSON.parse(JSON.stringify(serializeNumber(originalValue))));
      assert(isNaN(resultValue));
      assert(originalValue !== resultValue); // Unique to NaN
    });

    it("preserves numbers", function () {
      roundTripTest(42);
      roundTripTest(Math.PI);
    });

    it("preserves empty values", function () {
      roundTripTest(null);
      roundTripTest(undefined);
    });
  });

  describe("scrubHeaderSpecForBackwardsCompatibility", function () {
    var scrubHeaderSpecForBackwardsCompatibility = NetSimUtils.scrubHeaderSpecForBackwardsCompatibility;

    it("is a no-op for empty array", function () {
      assert.deepEqual([], scrubHeaderSpecForBackwardsCompatibility([]));
    });

    it("is a no-op for new format", function () {
      assert.deepEqual(['toAddress'],
          scrubHeaderSpecForBackwardsCompatibility(
              ['toAddress']));

      assert.deepEqual(['toAddress', 'fromAddress'],
          scrubHeaderSpecForBackwardsCompatibility(
              ['toAddress', 'fromAddress']));

      assert.deepEqual(['toAddress', 'fromAddress', 'packetCount', 'packetIndex'],
          scrubHeaderSpecForBackwardsCompatibility(
              ['toAddress', 'fromAddress', 'packetCount', 'packetIndex']));
    });

    it("converts old format to new format", function () {
      assert.deepEqual(['toAddress'],
          scrubHeaderSpecForBackwardsCompatibility(
              [
                {'key': 'toAddress', 'bits': 4}
              ]));

      assert.deepEqual(['toAddress', 'fromAddress'],
          scrubHeaderSpecForBackwardsCompatibility(
              [
                {'key': 'toAddress', 'bits': 4},
                {'key': 'fromAddress', 'bits': 4}
              ]));

      assert.deepEqual(['toAddress', 'fromAddress', 'packetCount', 'packetIndex'],
          scrubHeaderSpecForBackwardsCompatibility(
              [
                {'key': 'toAddress', 'bits': 4},
                {'key': 'fromAddress', 'bits': 4},
                {'key': 'packetCount', 'bits': 4},
                {'key': 'packetIndex', 'bits': 4}
              ]));
    });
  });

});
