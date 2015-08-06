var testUtils = require('../util/testUtils');
var assert = testUtils.assert;
var assertEqual = testUtils.assertEqual;
var assertThrows = testUtils.assertThrows;
var NetSimTestUtils = require('../util/netsimTestUtils');
var fakeShard = NetSimTestUtils.fakeShard;
var assertTableSize = NetSimTestUtils.assertTableSize;
var NetSimLogger = require('@cdo/apps/netsim/NetSimLogger');

var Packet = require('@cdo/apps/netsim/Packet');

describe("Packet.Encoder", function () {

  beforeEach(function () {
    NetSimTestUtils.initializeGlobalsToDefaultValues();
  });

  describe("address format bit widths", function () {
    var calculateBitWidth = Packet.Encoder.prototype.calculateBitWidth;

    it ("calculates zero width for empty string", function () {
      assertEqual(0, calculateBitWidth(''));
    });

    it ("calculates zero width for any string having no numbers", function () {
      assertEqual(0, calculateBitWidth('a.b.c'));
      assertEqual(0, calculateBitWidth('a million'));
    });

    it ("calculates zero width for string zero", function () {
      assertEqual(0, calculateBitWidth('0'));
      assertEqual(0, calculateBitWidth('0000.0000.0000.0000'));
    });

    it ("treats contiguous sets of digits as section bit-widths", function () {
      assertEqual(4, calculateBitWidth('4'));
      assertEqual(8, calculateBitWidth('8'));
      assertEqual(8, calculateBitWidth('4.4'));
      assertEqual(32, calculateBitWidth('8.8.8.8'));

      assertEqual(4, calculateBitWidth('1.1.1.1'));
      assertEqual(22, calculateBitWidth('11.11'));
      assertEqual(112, calculateBitWidth('111.1'));
      assertEqual(1111, calculateBitWidth('1111'));
    });

    it ("is okay with surrounding white-space", function () {
      assertEqual(4, calculateBitWidth(' 4 '));
      assertEqual(8, calculateBitWidth(' 8 '));
      assertEqual(8, calculateBitWidth(' 4.4 '));
      assertEqual(32, calculateBitWidth(' 8 . 8 . 8 . 8 '));
    });

    it ("totally ignores intermediate non-digits", function () {
      assertEqual(4, calculateBitWidth(' IPv4 '));
      assertEqual(8, calculateBitWidth(' 4-by-4 '));
      assertEqual(24, calculateBitWidth(' 8 . 8 . A . 8 '));
    });

  });

  describe("format validation", function () {

    it ("throws on construction if addressFormat in interpreted as zero-length " +
        "and an address field is present", function () {
      var packetCountBits = 4;
      var headerFields = [ "toAddress" ];
      assertThrows(Error, function () {
        var format = new Packet.Encoder("", packetCountBits, headerFields);
      });
      assertThrows(Error, function () {
        var format = new Packet.Encoder("a.b.c", packetCountBits, headerFields);
      });
    });

    it ("ignores addressFormat when no address field is present", function () {
      var packetCountBits = 4;
      var headerFields = [ "packetIndex" ];
      var format = new Packet.Encoder('', packetCountBits, headerFields);
      format = new Packet.Encoder('a.b.c', packetCountBits, headerFields);
    });

    it ("throws on construction if packetCountBitWidth is zero and packet " +
        " fields are present", function () {
      var addressFormat = "4";
      assertThrows(Error, function () {
        var format = new Packet.Encoder(addressFormat, 0, ["packetIndex"]);
      });
      assertThrows(Error, function () {
        var format = new Packet.Encoder(addressFormat, 0, ["packetCount"]);
      });
    });

    it ("ignores zero packetCountBitWidth if no packet fields are used", function () {
      var addressFormat = "4";
      var format = new Packet.Encoder(addressFormat, 0, []);
      format = new Packet.Encoder(addressFormat, 0, ["toAddress"]);
    });

    it ("allows four header field types", function () {
      var addressFormat = '4';
      var packetFieldWidth = 4;
      var format = new Packet.Encoder(addressFormat, packetFieldWidth, ["toAddress"]);
      format = new Packet.Encoder(addressFormat, packetFieldWidth, ["fromAddress"]);
      format = new Packet.Encoder(addressFormat, packetFieldWidth, ["packetIndex"]);
      format = new Packet.Encoder(addressFormat, packetFieldWidth, ["packetCount"]);
    });

    it ("throws if unknown header field type is passed", function () {
      var addressFormat = '4';
      var packetFieldWidth = 4;
      assertThrows(Error, function () {
        var format = new Packet.Encoder(addressFormat, packetFieldWidth, ["otherField"]);
      });
    });

    it ("throws if a valid field shows up multiple times", function () {
      var addressFormat = '4';
      var packetFieldWidth = 4;
      assertThrows(Error, function () {
        var format = new Packet.Encoder(addressFormat, packetFieldWidth, [
          "packetIndex",
          "packetIndex"
        ]);
      });
    });

    it ("allows different valid fields together in the header", function () {
      var addressFormat = '4';
      var packetFieldWidth = 4;
      var format = new Packet.Encoder(addressFormat, packetFieldWidth, [
        "packetIndex",
        "packetCount"
      ]);
    });
  });

  describe("constructing binary from data", function () {
    var shortFormat;

    beforeEach(function () {
      shortFormat = new Packet.Encoder('4', 0, ['toAddress', 'fromAddress']);
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

  describe("constructing binary from data with multi-tier address", function () {
    var encoder;

    beforeEach(function () {
      encoder = new Packet.Encoder('4.4', 0, ['toAddress', 'fromAddress']);
    });

    it ("concatenates binary for keys in correct order", function () {
      var binary = encoder.concatenateBinary(
          encoder.makeBinaryHeaders({
            toAddress: '6.1',
            fromAddress: '6.2'
          }),
          '0010');

      //              6   1       6   2        2
      assertEqual('01100001'+ '01100010' + '0010', binary);
    });

    it ("fills remaining components with zeroes if too few are provided", function () {
      var binary = encoder.concatenateBinary(
          encoder.makeBinaryHeaders({
            toAddress: '6',
            fromAddress: '6.'
          }),
          '0010');

      //              6   0       6   0        2
      assertEqual('01100000'+ '01100000' + '0010', binary);
    });

    it ("ignores extra components, using leftmost components first", function () {
      var binary = encoder.concatenateBinary(
          encoder.makeBinaryHeaders({
            toAddress: '3.4.5',
            fromAddress: '6.a.7.8'
          }),
          '0010');

      //              3   4       6   7        2
      assertEqual('00110100'+ '01100111' + '0010', binary);
    });
  });

  describe("retrieving fields from binary", function () {
    it ("deconstructs binary using a provided format", function () {
      var packet = '00000001 00000010';

      var format = new Packet.Encoder('8', 0, ['toAddress', 'fromAddress']);

      assertEqual('00000001', format.getHeader('toAddress', packet));
      assertEqual('00000010', format.getHeader('fromAddress', packet));

      var otherFormat = new Packet.Encoder('4', 0, ['toAddress', 'fromAddress']);

      assertEqual('0000', otherFormat.getHeader('toAddress', packet));
      assertEqual('0001', otherFormat.getHeader('fromAddress', packet));
    });

    it ("throws when getting a key that isn't in the spec", function () {
      var packet = '00000001 10101010 10101010 10101';

      var format = new Packet.Encoder('8', 0, ['toAddress']);

      assertThrows(Error, function () {
        format.getHeader('fromAddress', packet);
      });
    });

    it ("returns zeroes when getting a key that is beyond the binary length", function () {
      var packet = '1111';

      var format = new Packet.Encoder('4', 0, ['toAddress', 'fromAddress']);

      assertEqual('0000', format.getHeader('fromAddress', packet));
    });

    it ("right-pads with zeroes when getting a key that overlaps the binary end", function () {
      var packet = '1111 11';

      var format = new Packet.Encoder('4', 0, ['toAddress', 'fromAddress']);

      assertEqual('1100', format.getHeader('fromAddress', packet));
    });

    it ("gets remaining bits into Infinity body field", function () {
      var packet = '00000001 10101010 10101010 10101';

      var format = new Packet.Encoder('8', 0, ['toAddress']);

      assertEqual('00000001', format.getHeader('toAddress', packet));
      assertEqual('10101010' + '10101010' + '10101', format.getBody(packet));
    });

    it ("gets zero bits into Infinity body field if it's beyond the binary length", function () {
      var packet = '1111';

      var format = new Packet.Encoder('8', 0, ['toAddress']);

      assertEqual('11110000', format.getHeader('toAddress', packet));
      assertEqual('', format.getBody(packet));
    });
  });

  describe("retrieving multi-tier address from binary", function () {
    it ("deconstructs binary using a provided format", function () {
      var packet = '01000001 01000010';

      var format = new Packet.Encoder('4.4', 0, ['toAddress', 'fromAddress']);

      assertEqual('01000001', format.getHeader('toAddress', packet));
      assertEqual('01000010', format.getHeader('fromAddress', packet));

      var otherFormat = new Packet.Encoder('2.5', 0, ['toAddress', 'fromAddress']);

      assertEqual('0100000', otherFormat.getHeader('toAddress', packet));
      assertEqual('1010000', otherFormat.getHeader('fromAddress', packet));
    });

    it ("returns zeroes when getting a key that is beyond the binary length", function () {
      var packet = '11111111';

      var format = new Packet.Encoder('4.4', 0, ['toAddress', 'fromAddress']);

      assertEqual('00000000', format.getHeader('fromAddress', packet));
    });

    it ("right-pads with zeroes when getting a key that overlaps the binary end", function () {
      var packet = '11111100 11';

      var format = new Packet.Encoder('4.4', 0, ['toAddress', 'fromAddress']);

      assertEqual('11000000', format.getHeader('fromAddress', packet));
    });

    it ("converts back to a string in original format", function () {
      var packet = '01000001 01000010 10101';
      var format = new Packet.Encoder('4.4', 0, ['toAddress', 'fromAddress']);

      assertEqual('4.1', format.getHeaderAsAddressString('toAddress', packet));
      assertEqual('4.2', format.getHeaderAsAddressString('fromAddress', packet));
    });

    it ("handles nonuniform parts", function () {
      var packet = '01000001 01000010 10101';
      var format = new Packet.Encoder('4.3.1', 0, ['toAddress', 'fromAddress']);

      assertEqual('4.0.1', format.getHeaderAsAddressString('toAddress', packet));
      assertEqual('4.1.0', format.getHeaderAsAddressString('fromAddress', packet));
    });

    it ("Allows non-dot separator", function () {
      var packet = '010011 111000 10101';
      var format = new Packet.Encoder('2-3 1', 0, ['toAddress', 'fromAddress']);

      assertEqual('1-1 1', format.getHeaderAsAddressString('toAddress', packet));
      assertEqual('3-4 0', format.getHeaderAsAddressString('fromAddress', packet));
    });
  });

});
