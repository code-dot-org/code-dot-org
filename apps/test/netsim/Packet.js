var testUtils = require('../util/testUtils');
var assert = testUtils.assert;
var assertEqual = testUtils.assertEqual;
var assertThrows = testUtils.assertThrows;
var netsimTestUtils = require('../util/netsimTestUtils');
var fakeShard = netsimTestUtils.fakeShard;
var assertTableSize = netsimTestUtils.assertTableSize;

var Packet = testUtils.requireWithGlobalsCheckBuildFolder('netsim/Packet');

describe("Packet.Encoder", function () {

  describe("format validation", function () {

    it ("throws on construction if any field is missing a key", function () {
      assertThrows(Error, function () {
        var format = new Packet.Encoder([
          { bits: 8 },
          { key: 'fieldTwo', bits: 8 }
        ]);
      });
    });

    it ("throws on construction if any field is missing a length", function () {
      assertThrows(Error, function () {
        var format = new Packet.Encoder([
          { key: 'fieldOne' },
          { key: 'fieldTwo', bits: 8 }
        ]);
      });
    });

    it ("throws on construction if keys are not unique", function () {
      assertThrows(Error, function () {
        var format = new Packet.Encoder([
          { key: 'fieldOne', bits: 8 },
          { key: 'fieldOne', bits: 8 }
        ]);
      });
    });

    it ("throws on construction if Infinity field length used", function () {
      assertThrows(Error, function () {
        var format = new Packet.Encoder([
          { key: 'infinityFirst', bits: Infinity },
          { key: 'fixedLater', bits: 8 }
        ]);
      });

      assertThrows(Error, function () {
        var format = new Packet.Encoder([
          { key: 'infinityFirst', bits: 8 },
          { key: 'fixedLater', bits: Infinity }
        ]);
      });
    });
  });


  describe("constructing binary from data", function () {
    var shortFormat;

    beforeEach(function () {
      shortFormat = new Packet.Encoder([
        { key: 'toAddress', bits: 4 },
        { key: 'fromAddress', bits: 4 }
      ]);
    });

    it ("concatenates binary for keys in correct order", function () {
      var binary = shortFormat.concatenateBinary(
          shortFormat.makeBinaryHeaders({
            toAddress: 1,
            fromAddress: 2
          }),
          '0010');

      assertEqual('0001'+ '0010' + '0010', binary);
    });

    it ("doesn't care what order keys exist in data object", function () {
      var binary = shortFormat.concatenateBinary(
          shortFormat.makeBinaryHeaders({
            fromAddress: 2,
            toAddress: 1
          }),
          '0010');

      assertEqual('0001' + '0010' + '0010', binary);
    });

    it ("left-pads short information in data, within field", function () {
      var binary = shortFormat.concatenateBinary({
        toAddress: '101',
        fromAddress: '10'
      }, '');

      assertEqual('0101' + '0010', binary);
    });

    it ("right-truncates long information in data, within field", function () {
      var binary = shortFormat.concatenateBinary({
        toAddress: '01011',
        fromAddress: '0000'
      }, '');

      assertEqual('0101' + '0000', binary);
    });

    it ("zero-fills missing fields in data", function () {
      var binary = shortFormat.concatenateBinary({
        fromAddress: '10'
      }, '');

      assertEqual('0000' + '0010', binary);
    });

    it ("ignores extra fields in data", function () {
      var binary = shortFormat.concatenateBinary({
        toAddress: '101',
        fromAddress: '10',
        other: '1101'
      }, '');

      assertEqual('0101' + '0010', binary);
    });
  });

  describe("retrieving fields from binary", function () {
    it ("deconstructs binary using a provided format", function () {
      var packet = '00000001 00000010';

      var format = new Packet.Encoder([
        { key: 'toAddress', bits: 8 },
        { key: 'fromAddress', bits: 8 }
      ]);

      assertEqual('00000001', format.getHeader('toAddress', packet));
      assertEqual('00000010', format.getHeader('fromAddress', packet));

      var otherFormat = new Packet.Encoder([
        { key: 'toAddress', bits: 4 },
        { key: 'fromAddress', bits: 4 }
      ]);

      assertEqual('0000', otherFormat.getHeader('toAddress', packet));
      assertEqual('0001', otherFormat.getHeader('fromAddress', packet));
    });

    it ("throws when getting a key that isn't in the spec", function () {
      var packet = '00000001 10101010 10101010 10101';

      var format = new Packet.Encoder([
        { key: 'toAddress', bits: 8 },
        { key: 'payload', bits: 8 }
      ]);

      assertThrows(Error, function () {
        format.getHeader('fromAddress', packet);
      });
    });

    it ("returns zeroes when getting a key that is beyond the binary length", function () {
      var packet = '1111';

      var format = new Packet.Encoder([
        { key: 'toAddress', bits: 4 },
        { key: 'payload', bits: 4 }
      ]);

      assertEqual('0000', format.getHeader('payload', packet));
    });

    it ("right-pads with zeroes when getting a key that overlaps the binary end", function () {
      var packet = '1111 11';

      var format = new Packet.Encoder([
        { key: 'toAddress', bits: 4 },
        { key: 'payload', bits: 4 }
      ]);

      assertEqual('1100', format.getHeader('payload', packet));
    });

    it ("gets remaining bits into Infinity field", function () {
      var packet = '00000001 10101010 10101010 10101';

      var format = new Packet.Encoder([
        { key: 'toAddress', bits: 8 }
      ]);

      assertEqual('00000001', format.getHeader('toAddress', packet));
      assertEqual('10101010' + '10101010' + '10101', format.getBody(packet));
    });

    it ("gets zero bits into Infinity field if it's beyond the binary length", function () {
      var packet = '1111';

      var format = new Packet.Encoder([
        { key: 'toAddress', bits: 8 }
      ]);

      assertEqual('11110000', format.getHeader('toAddress', packet));
      assertEqual('', format.getBody(packet));
    });
  });

});
