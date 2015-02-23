var testUtils = require('../util/testUtils');
var assert = testUtils.assert;
var assertEqual = testUtils.assertEqual;
var assertThrows = testUtils.assertThrows;
var assertWithinRange = testUtils.assertWithinRange;
var assertOwnProperty = testUtils.assertOwnProperty;
var netsimTestUtils = require('../util/netsimTestUtils');
var fakeShard = netsimTestUtils.fakeShard;
var assertTableSize = netsimTestUtils.assertTableSize;

var PacketEncoder = testUtils.requireWithGlobalsCheckBuildFolder('netsim/PacketEncoder');

describe("PacketEncoder", function () {

  describe("format validation", function () {

    it ("throws on construction if any field is missing a key", function () {
      assertThrows(Error, function () {
        var format = new PacketEncoder([
          { bits: 8 },
          { key: 'fieldTwo', bits: 8 }
        ]);
      });
    });

    it ("throws on construction if any field is missing a length", function () {
      assertThrows(Error, function () {
        var format = new PacketEncoder([
          { key: 'fieldOne' },
          { key: 'fieldTwo', bits: 8 }
        ]);
      });
    });

    it ("throws on construction if keys are not unique", function () {
      assertThrows(Error, function () {
        var format = new PacketEncoder([
          { key: 'fieldOne', bits: 8 },
          { key: 'fieldOne', bits: 8 }
        ]);
      });
    });

    it ("throws on construction if Infinity field length used in middle of packet", function () {
      assertThrows(Error, function () {
        var format = new PacketEncoder([
          { key: 'infinityFirst', bits: Infinity },
          { key: 'fixedLater', bits: 8 }
        ]);
      });
    });

    it ("accepts Infinity length for final field", function () {
      var packet = '00000001 10101010 10101010 10101';

      var format = new PacketEncoder([
        { key: 'toAddress', bits: 8 },
        { key: 'payload', bits: Infinity }
      ]);

      assertEqual('101010101010101010101', format.getField('payload', packet));
    });
  });


  describe("constructing binary from data", function () {
    var shortFormat;

    beforeEach(function () {
      shortFormat = new PacketEncoder([
        { key: 'toAddress', bits: 4 },
        { key: 'payload', bits: 4 }
      ]);
    });

    it ("concatenates binary for keys in correct order", function () {
      var binary = shortFormat.createBinary({
        toAddress: '0001',
        payload: '0010'
      });

      assertEqual('00010010', binary);
    });

    it ("doesn't care what order keys exist in data object", function () {
      var binary = shortFormat.createBinary({
        payload: '0010',
        toAddress: '0001'
      });

      assertEqual('00010010', binary);
    });

    it ("left-pads short information in data, within field", function () {
      var binary = shortFormat.createBinary({
        toAddress: '101',
        payload: '10'
      });

      assertEqual('01010010', binary);
    });

    it ("right-truncates long information in data, within field", function () {
      var binary = shortFormat.createBinary({
        toAddress: '01011',
        payload: '0000'
      });

      assertEqual('01010000', binary);
    });

    it ("zero-fills missing fields in data", function () {
      var binary = shortFormat.createBinary({
        payload: '10'
      });

      assertEqual('00000010', binary);
    });

    it ("ignores extra fields in data", function () {
      var binary = shortFormat.createBinary({
        toAddress: '101',
        payload: '10',
        other: '1101'
      });

      assertEqual('01010010', binary);
    });

  });

  describe("retrieving fields from binary", function () {
    it ("deconstructs binary using a provided format", function () {
      var packet = '00000001 00000010';

      var format = new PacketEncoder([
        { key: 'toAddress', bits: 8 },
        { key: 'fromAddress', bits: 8 }
      ]);

      assertEqual('00000001', format.getField('toAddress', packet));
      assertEqual('00000010', format.getField('fromAddress', packet));

      var otherFormat = new PacketEncoder([
        { key: 'toAddress', bits: 4 },
        { key: 'fromAddress', bits: 4 }
      ]);

      assertEqual('0000', otherFormat.getField('toAddress', packet));
      assertEqual('0001', otherFormat.getField('fromAddress', packet));
    });

    it ("throws when getting a key that isn't in the spec", function () {
      var packet = '00000001 10101010 10101010 10101';

      var format = new PacketEncoder([
        { key: 'toAddress', bits: 8 },
        { key: 'payload', bits: 8 }
      ]);

      assertThrows(Error, function () {
        format.getField('fromAddress', packet);
      });
    });

    it ("returns zeroes when getting a key that is beyond the binary length", function () {
      var packet = '1111';

      var format = new PacketEncoder([
        { key: 'toAddress', bits: 4 },
        { key: 'payload', bits: 4 }
      ]);

      assertEqual('0000', format.getField('payload', packet));
    });

    it ("right-pads with zeroes when getting a key that overlaps the binary end", function () {
      var packet = '1111 11';

      var format = new PacketEncoder([
        { key: 'toAddress', bits: 4 },
        { key: 'payload', bits: 4 }
      ]);

      assertEqual('1100', format.getField('payload', packet));
    });

    it ("gets remaining bits into Infinity field", function () {
      var packet = '00000001 10101010 10101010 10101';

      var format = new PacketEncoder([
        { key: 'toAddress', bits: 8 },
        { key: 'payload', bits: Infinity }
      ]);

      assertEqual('00000001', format.getField('toAddress', packet));
      assertEqual('101010101010101010101', format.getField('payload', packet));
    });

    it ("gets zero bits into Infinity field if it's beyond the binary length", function () {
      var packet = '1111';

      var format = new PacketEncoder([
        { key: 'toAddress', bits: 8 },
        { key: 'payload', bits: Infinity }
      ]);

      assertEqual('11110000', format.getField('toAddress', packet));
      assertEqual('', format.getField('payload', packet));
    });
  });

});
