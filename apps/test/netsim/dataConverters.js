var testUtils = require('../util/testUtils');
var assert = testUtils.assert;
var assertEqual = testUtils.assertEqual;
var assertThrows = testUtils.assertThrows;

var dataConverters = require('@cdo/apps/netsim/dataConverters');

describe("dataConverters", function () {

  describe("minifyAB", function () {
    var minifyAB = dataConverters.minifyAB;

    it ("strips all characters except As and Bs", function () {
      assertEqual('AAAB', minifyAB("  A3$A A__B \n  kg"));
    });

    it ("coerces letters to uppercase", function () {
      assertEqual('ABBB', minifyAB('abBb'));
    });
  });

  describe("minifyBinary", function () {
    var minifyBinary = dataConverters.minifyBinary;

    it("strips all characters except zeroes and ones", function () {
      assertEqual('00101', minifyBinary(' 0ABX$0K\x0D10Z  TU1'));
    });
  });

  describe("minifyHex", function () {
    var minifyHex = dataConverters.minifyHex;

    it ("strips whitespace", function () {
      assertEqual('89AB', minifyHex('89 AB'));
    });

    it ("strips non-hex characters", function () {
      assertEqual('DEF', minifyHex('DEFGH'));
    });

    it ("coerces letters to uppercase", function () {
      assertEqual('AB', minifyHex('Ab'));
    });
  });

  describe("minifyDecimal", function () {
    var minifyDecimal = dataConverters.minifyDecimal;

    it ("strips leading whitespace", function () {
      assertEqual('1 1 1', minifyDecimal('  1 1 1'));
    });

    it ("strips trailing whitespace", function () {
      assertEqual('1 1 1', minifyDecimal('1 1 1  '));
    });

    it ("collapses internal whitespace to one space", function () {
      assertEqual('1 1 1', minifyDecimal('1  1   1'));
    });

    it ("strips characters that aren't whitespace or decimal", function () {
      assertEqual('1 1 1', minifyDecimal('a1 \x071B 1c'));
    });
  });

  describe("formatAB", function () {
    var formatAB = dataConverters.formatAB;

    it ("is identity for empty string", function () {
      assertEqual('', formatAB(''));
    });

    it ("splits the string at the given chunk size", function () {
      var rawABs = "ABABABABABABABAB";
      assertEqual('ABAB ABAB ABAB ABAB', formatAB(rawABs, 4));
      assertEqual('ABABABAB ABABABAB', formatAB(rawABs, 8));
    });

    it ("does not pad when a chunk comes out uneven", function () {
      var rawABs = "ABABABABABABABAB";
      assertEqual('ABABA BABAB ABABA B', formatAB(rawABs, 5));
    });

    it ("minifies and cleans input before formatting", function () {
      var rawInput = "AB BAB ABA\xB5ABA B";
      assertEqual('ABBA BABA ABAB', formatAB(rawInput, 4));
    });

    it ("throws an exception when chunk size is zero or less", function () {
      assertThrows(RangeError, formatAB.bind(null, '', 0));
      assertThrows(RangeError, formatAB.bind(null, '', -1));
    });
  });

  describe("abToInt", function () {
    var abToInt = dataConverters.abToInt;

    it ("converts empty string to NaN", function () {
      assert(isNaN(abToInt('')));
    });

    it ("interprets As and Bs as a single number regardless of length", function () {
      assertEqual(0, abToInt('A'));
      assertEqual(0, abToInt('AAAAAAAA'));
      assertEqual(32768, abToInt('BAAAAAAAAAAAAAAA'));
    });

    it ("minifies and cleans input before converting", function () {
      assertEqual(16, abToInt('AAAB \x1B \x1D \x1F AAAA'));
    });
  });

  describe("intToAB", function () {
    var intToAB = dataConverters.intToAB;

    it ("converts a number to its AB representation", function () {
      var width = 4;
      assertEqual('AAAA', intToAB(0, width));
      assertEqual('AAAB', intToAB(1, width));
      assertEqual('AABA', intToAB(2, width));
      assertEqual('AABB', intToAB(3, width));
      assertEqual('ABAB', intToAB(5, width));
      assertEqual('BAAB', intToAB(9, width));
    });

    it ("can give AB-strings of different widths, left-padding with As", function () {
      var num = 7;
      assertEqual('BBB', intToAB(num, 3));
      assertEqual('ABBB', intToAB(num, 4));
      assertEqual('AABBB', intToAB(num, 5));
      assertEqual('AAABBB', intToAB(num, 6));
      assertEqual('AAAABBB', intToAB(num, 7));
      assertEqual('AAAAABBB', intToAB(num, 8));
    });

    it ("drops leftmost bits when overflowing given width", function () {
      // Non-overflow case
      assertEqual('AAA', intToAB(0, 3));
      assertEqual('AAB', intToAB(1, 3));
      assertEqual('ABA', intToAB(2, 3));

      // Overflow case, wraps around.
      assertEqual('AAA', intToAB(8, 3));
      assertEqual('AAB', intToAB(9, 3));
      assertEqual('ABA', intToAB(10, 3));
    });

    it ("throws an exception when width of zero or less is requested", function () {
      assertThrows(RangeError, intToAB.bind(null, 10, 0));
      assertThrows(RangeError, intToAB.bind(null, 10, -1));
    });
  });

  describe("abToBinary", function () {
    var abToBinary = dataConverters.abToBinary;

    it ("converts empty string to empty string", function () {
      assertEqual('', abToBinary(''));
    });

    it ("converts an a or an A into a zero", function () {
      assertEqual('0', abToBinary('A'));
      assertEqual('0', abToBinary('a'));
    });

    it ("converts a b or a B into a one", function () {
      assertEqual('1', abToBinary('B'));
      assertEqual('1', abToBinary('b'));
    });

    it ("minifies and cleans", function () {
      assertEqual('00010000', abToBinary('  aAa_b aaaA$'));
    });
  });

  describe("binaryToAB", function () {
    var binaryToAB = dataConverters.binaryToAB;

    it ("converts empty string to empty string", function () {
      assertEqual('', binaryToAB(''));
    });

    it ("converts a zero into an A", function () {
      assertEqual('A', binaryToAB('0'));
    });

    it ("converts a one into a B", function () {
      assertEqual('B', binaryToAB('1'));
    });

    it ("cleans binary before parsing", function () {
      assertEqual('BBBBBAAABBBBBAAA', binaryToAB('1111 10‰00 11 “11” 10 00'));
    });
  });

  describe("formatBinary", function() {
    var formatBinary = dataConverters.formatBinary;

    it ("is identity for empty string", function () {
      assertEqual('', formatBinary(''));
    });

    it ("splits the binary string at given chunk size", function () {
      var rawBinary = "0101010101010101";
      assertEqual('0101 0101 0101 0101', formatBinary(rawBinary, 4));
      assertEqual('01010101 01010101', formatBinary(rawBinary, 8));
    });

    it ("does not pad when a chunk comes out uneven", function () {
      var rawBinary = "0101010101010101";
      assertEqual('01010 10101 01010 1', formatBinary(rawBinary, 5));
    });

    it ("minifies and cleans input before formatting", function () {
      var rawInput = "01 101 A10\x15010 1";
      assertEqual('0110 1100 101', formatBinary(rawInput, 4));
    });

    it ("throws an exception when chunk size is zero or less", function () {
      assertThrows(RangeError, formatBinary.bind(null, '', 0));
      assertThrows(RangeError, formatBinary.bind(null, '', -1));
    });
  });

  describe("formatHex", function() {
    var formatHex = dataConverters.formatHex;

    it ("is identity for empty string", function () {
      assertEqual('', formatHex(''));
    });

    it ("splits the hex string at given binary chunk size", function () {
      var rawHex = "ABCDEF";
      assertEqual('AB CD EF', formatHex(rawHex, 8));
      assertEqual('ABC DEF', formatHex(rawHex, 12));
    });

    it ("does not split the hex string when the chunk size is " +
        "not divisble by 4", function () {
      var rawHex = "ABCDEF";
      assertEqual('ABCDEF', formatHex(rawHex, 7));
      assertEqual('ABCDEF', formatHex(rawHex, 9));
      assertEqual('ABCDEF', formatHex(rawHex, 10));
      assertEqual('ABCDEF', formatHex(rawHex, 11));
    });

    it ("does not pad when a chunk comes out uneven", function () {
      var rawHex = "ABCDEF";
      assertEqual('ABCD EF', formatHex(rawHex, 16));
    });

    it ("minifies and cleans input before formatting", function () {
      var rawInput = "ABG cde 12xyz\x18";
      assertEqual('AB CD E1 2', formatHex(rawInput, 8));
    });

    it ("throws an exception when chunk size is zero or less", function () {
      assertThrows(RangeError, formatHex.bind(null, '', 0));
      assertThrows(RangeError, formatHex.bind(null, '', -1));
    });
  });

  describe("alignDecimal", function () {
    var alignDecimal = dataConverters.alignDecimal;

    it ("is identity for empty string", function () {
      assertEqual('', alignDecimal(''));
    });

    it ("puts final digits of all numbers at equal distances apart", function () {
      assertEqual("1 1 1", alignDecimal('1  1    1'));
      assertEqual("10 01 10", alignDecimal('10 1 10'));
      assertEqual("100 010 001", alignDecimal('100 10 1'));
    });

    it ("pads leading numbers", function () {
      assertEqual('001 010 100', alignDecimal('1 10 100'));
    });
  });

  describe("binaryToInt", function () {
    var binaryToInt = dataConverters.binaryToInt;

    it ("converts empty string to NaN", function () {
      assert(isNaN(binaryToInt('')));
    });

    it ("interprets binary as a single number regardless of length", function () {
      assertEqual(0, binaryToInt('0'));
      assertEqual(0, binaryToInt('00000000'));
      assertEqual(32768, binaryToInt('1000000000000000'));
    });

    it ("minifies and cleans input before converting", function () {
      assertEqual(16, binaryToInt('0001 \x1B \x1D \x1F 0000'));
    });
  });

  describe("intToBinary", function () {
    var intToBinary = dataConverters.intToBinary;

    it ("converts a number to its binary representation", function () {
      var width = 4;
      assertEqual('0000', intToBinary(0, width));
      assertEqual('0001', intToBinary(1, width));
      assertEqual('0010', intToBinary(2, width));
      assertEqual('0011', intToBinary(3, width));
      assertEqual('0101', intToBinary(5, width));
      assertEqual('1001', intToBinary(9, width));
    });

    it ("can give binary of different widths, left-padding with zeroes", function () {
      var num = 7;
      assertEqual('111', intToBinary(num, 3));
      assertEqual('0111', intToBinary(num, 4));
      assertEqual('00111', intToBinary(num, 5));
      assertEqual('000111', intToBinary(num, 6));
      assertEqual('0000111', intToBinary(num, 7));
      assertEqual('00000111', intToBinary(num, 8));
    });

    it ("drops leftmost bits when overflowing given width", function () {
      // Non-overflow case
      assertEqual('000', intToBinary(0, 3));
      assertEqual('001', intToBinary(1, 3));
      assertEqual('010', intToBinary(2, 3));

      // Overflow case, wraps around.
      assertEqual('000', intToBinary(8, 3));
      assertEqual('001', intToBinary(9, 3));
      assertEqual('010', intToBinary(10, 3));
    });

    it ("throws an exception when width of zero or less is requested", function () {
      assertThrows(RangeError, intToBinary.bind(null, 10, 0));
      assertThrows(RangeError, intToBinary.bind(null, 10, -1));
    });
  });

  describe("hexToInt", function () {
    var hexToInt = dataConverters.hexToInt;

    it ("converts empty string to NaN", function () {
      assert(isNaN(hexToInt('')));
    });

    it ("interprets hexadecimal as a single number regardless of length", function () {
      assertEqual(10, hexToInt('A'));
      assertEqual(10, hexToInt('000A'));
      assertEqual(268435456, hexToInt('10000000'));
    });

    it ("minifies and cleans input before converting", function () {
      assertEqual(2571, hexToInt('0A 0B <= • ?'));
    });
  });

  describe("intToHex", function () {
    var intToHex = dataConverters.intToHex;

    it ("converts a number to its hex representation", function () {
      var width = 4;
      assertEqual('0000', intToHex(0, width));
      assertEqual('0008', intToHex(8, width));
      assertEqual('0014', intToHex(20, width));
      assertEqual('04B0', intToHex(1200, width));
    });

    it ("gives hex with uppercase letters", function () {
      var width = 1;
      assertEqual('A', intToHex(10, width));
      assertEqual('B', intToHex(11, width));
      assertEqual('C', intToHex(12, width));
      assertEqual('D', intToHex(13, width));
      assertEqual('E', intToHex(14, width));
      assertEqual('F', intToHex(15, width));
    });

    it ("can give hex of different widths, left-padding with zeroes", function () {
      var number = 245;
      assertEqual('F5', intToHex(number, 2));
      assertEqual('0F5', intToHex(number, 3));
      assertEqual('00F5', intToHex(number, 4));
    });

    it ("drops leftmost nibbles when overflowing given width", function () {
      // Non-overflow case:
      assertEqual('00', intToHex(0, 2));
      assertEqual('01', intToHex(1, 2));
      assertEqual('02', intToHex(2, 2));

      // Overflow case:
      assertEqual('00', intToHex(256, 2));
      assertEqual('01', intToHex(257, 2));
      assertEqual('02', intToHex(258, 2));
    });

    it ("throws an exception when width of zero or less is requested", function () {
      assertThrows(RangeError, intToHex.bind(null, 15, 0));
      assertThrows(RangeError, intToHex.bind(null, 15, -1));
    });
  });

  describe("hexToBinary", function () {
    var hexToBinary = dataConverters.hexToBinary;

    it ("converts empty string to empty string", function () {
      assertEqual('', hexToBinary(''));
    });

    it ("turns a hex character into 4 bits", function () {
      assertEqual('0000', hexToBinary('0'));
      assertEqual('0001', hexToBinary('1'));
      assertEqual('0010', hexToBinary('2'));
      assertEqual('0011', hexToBinary('3'));
      assertEqual('0100', hexToBinary('4'));
      assertEqual('0101', hexToBinary('5'));
      assertEqual('0110', hexToBinary('6'));
      assertEqual('0111', hexToBinary('7'));
      assertEqual('1000', hexToBinary('8'));
      assertEqual('1001', hexToBinary('9'));
      assertEqual('1010', hexToBinary('A'));
      assertEqual('1011', hexToBinary('B'));
      assertEqual('1100', hexToBinary('C'));
      assertEqual('1101', hexToBinary('D'));
      assertEqual('1110', hexToBinary('E'));
      assertEqual('1111', hexToBinary('F'));
    });

    it ("gives 4 bits for each character", function () {
      assertEqual('00000000', hexToBinary('00'));
      assertEqual('100000011111', hexToBinary('81F'));
      assertEqual('1001100110011001', hexToBinary('9999'));
    });
  });

  describe("binaryToHex", function () {
    var binaryToHex = dataConverters.binaryToHex;

    it ("converts empty string to empty string", function () {
      assertEqual('', binaryToHex(''));
    });

    it ("produces correct uppercase hex characters", function () {
      assertEqual('0', binaryToHex('0000'));
      assertEqual('1', binaryToHex('0001'));
      assertEqual('2', binaryToHex('0010'));
      assertEqual('3', binaryToHex('0011'));
      assertEqual('4', binaryToHex('0100'));
      assertEqual('5', binaryToHex('0101'));
      assertEqual('6', binaryToHex('0110'));
      assertEqual('7', binaryToHex('0111'));
      assertEqual('8', binaryToHex('1000'));
      assertEqual('9', binaryToHex('1001'));
      assertEqual('A', binaryToHex('1010'));
      assertEqual('B', binaryToHex('1011'));
      assertEqual('C', binaryToHex('1100'));
      assertEqual('D', binaryToHex('1101'));
      assertEqual('E', binaryToHex('1110'));
      assertEqual('F', binaryToHex('1111'));
    });

    it ("cleans binary before parsing", function () {
      assertEqual('F8F8', binaryToHex('1111 10‰00 11 “11” 10 00'));
    });

    it ("right-pads when binary length is not a multiple of 4", function () {
      assertEqual('88', binaryToHex('1000 1')); // Pads 3 zeroes
      assertEqual('CC', binaryToHex('1100 11')); // Pads 2 zeros
      assertEqual('EE', binaryToHex('1110 111')); // Pads 1 zero
    });
  });

  describe("decimalToBinary", function () {
    var decimalToBinary = dataConverters.decimalToBinary;

    it ("converts empty string to empty string", function () {
      assertEqual('', decimalToBinary('', 8));
    });

    it ("produces correct bytes for numbers in the string", function () {
      assertEqual('000', decimalToBinary('0', 3));
      assertEqual('001', decimalToBinary('1', 3));
      assertEqual('010', decimalToBinary('2', 3));
      assertEqual('011', decimalToBinary('3', 3));
      assertEqual('100', decimalToBinary('4', 3));
      assertEqual('101', decimalToBinary('5', 3));
      assertEqual('110', decimalToBinary('6', 3));
      assertEqual('111', decimalToBinary('7', 3));
    });

    it ("concatenates bytes for whitespace-delimited numbers in the string", function () {
      assertEqual('000', decimalToBinary('00', 3));
      assertEqual('000000', decimalToBinary('0 0', 3));
      assertEqual('101011', decimalToBinary('5 3', 3));
    });

    it ("handles leading and trailing spaces", function () {
      assertEqual('100001', decimalToBinary(' 4 1', 3));
      assertEqual('100001', decimalToBinary('4 1 ', 3));
    });

    it ("truncates left bits when numbers overflow byte-size", function () {
      assertEqual('000000', decimalToBinary('0 8', 3));
      assertEqual('001001', decimalToBinary('1 9', 3));
      assertEqual('010010', decimalToBinary('2 10', 3));
    });
  });

  describe("binaryToDecimal", function () {
    var binaryToDecimal = dataConverters.binaryToDecimal;

    it ("converts empty string to empty string", function () {
      assertEqual('', binaryToDecimal('', 8));
    });

    it ("produces correct numbers for binary", function () {
      assertEqual('0', binaryToDecimal('000', 3));
      assertEqual('1', binaryToDecimal('001', 3));
      assertEqual('2', binaryToDecimal('010', 3));
      assertEqual('3', binaryToDecimal('011', 3));
      assertEqual('4', binaryToDecimal('100', 3));
      assertEqual('5', binaryToDecimal('101', 3));
      assertEqual('6', binaryToDecimal('110', 3));
      assertEqual('7', binaryToDecimal('111', 3));
    });

    it ("cleans binary first", function () {
      assertEqual('7 5', binaryToDecimal('11 11 01™', 3));
    });

    it ("can extract multiple numbers from binary", function () {
      assertEqual('0 0 0', binaryToDecimal('000', 1));
      assertEqual('7 5', binaryToDecimal('111101', 3));
    });

    it ("can extract multi-digit numbers from binary", function () {
      assertEqual('15', binaryToDecimal('1111', 4));
      assertEqual('15 13', binaryToDecimal('11111101', 4));
    });

    it ("zero-pads right when bits don't divide by byte-size", function () {
      assertEqual('8 8', binaryToDecimal('1000 1', 4));
      assertEqual('12 12', binaryToDecimal('1100 11', 4));
      assertEqual('14 14', binaryToDecimal('1110 111', 4));
    });
  });

  describe("asciiToBinary", function () {
    var asciiToBinary = dataConverters.asciiToBinary;

    it ("converts empty string to empty string", function () {
      assertEqual('', asciiToBinary('', 8));
    });

    it ("produces correct binary for characters", function () {
      assertEqual('01100001', asciiToBinary('a', 8));
      assertEqual('01100010', asciiToBinary('b', 8));
      assertEqual('01100011', asciiToBinary('c', 8));
      assertEqual('01100100', asciiToBinary('d', 8));
      assertEqual('01000001', asciiToBinary('A', 8));
      assertEqual('01000010', asciiToBinary('B', 8));
      assertEqual('01000011', asciiToBinary('C', 8));
      assertEqual('01000100', asciiToBinary('D', 8));
    });

    it ("takes multiple characters", function () {
      assertEqual('010010000110100100100001', asciiToBinary('Hi!', 8));
    });

    it ("produces byteSize bits for each character, padding left", function () {
      assertEqual('1100001', asciiToBinary('a', 7));
      assertEqual('01100001', asciiToBinary('a', 8));
      assertEqual('001100001', asciiToBinary('a', 9));
    });

    it ("truncates on left when character overflows given byteSize", function () {
      assertEqual('100001', asciiToBinary('a', 6));
      assertEqual('00001', asciiToBinary('a', 5));
      assertEqual('0001', asciiToBinary('a', 4));
      assertEqual('001', asciiToBinary('a', 3));
      assertEqual('01', asciiToBinary('a', 2));
      assertEqual('1', asciiToBinary('a', 1));
    });

    it ("throws an exception when byteSize of zero or less is requested", function () {
      assertThrows(RangeError, asciiToBinary.bind(null, 'a', 0));
      assertThrows(RangeError, asciiToBinary.bind(null, 'a', -1));
    });
  });

  describe("binaryToAscii", function () {
    var binaryToAscii = dataConverters.binaryToAscii;

    it ("converts empty string to empty string", function () {
      assertEqual('', binaryToAscii('', 8));
    });

    it ("produces correct characters for binary", function () {
      assertEqual('a', binaryToAscii('01100001', 8));
      assertEqual('b', binaryToAscii('01100010', 8));
      assertEqual('c', binaryToAscii('01100011', 8));
      assertEqual('d', binaryToAscii('01100100', 8));
      assertEqual('A', binaryToAscii('01000001', 8));
      assertEqual('B', binaryToAscii('01000010', 8));
      assertEqual('C', binaryToAscii('01000011', 8));
      assertEqual('D', binaryToAscii('01000100', 8));
    });

    it ("extracts multiple characters", function () {
      assertEqual('Hi!', binaryToAscii('010010000110100100100001', 8));
    });

    it ("extracts a character for each byteSize bits", function () {
      assertEqual('a', binaryToAscii('1100001', 7));
      assertEqual('a', binaryToAscii('01100001', 8));
      assertEqual('a', binaryToAscii('001100001', 9));
    });

    it ("zero-pads on right when binary length doesn't divide into byteSize", function () {
      assertEqual('@@', binaryToAscii('01000000 01', 8));
      assertEqual('``', binaryToAscii('01100000 011', 8));
      assertEqual('pp', binaryToAscii('01110000 0111', 8));
      assertEqual('xx', binaryToAscii('01111000 01111', 8));
      assertEqual('||', binaryToAscii('01111100 011111', 8));
      assertEqual('~~', binaryToAscii('01111110 0111111', 8));
    });

    it ("throws an exception when byteSize of zero or less is requested", function () {
      assertThrows(RangeError, binaryToAscii.bind(null, '01100001', 0));
      assertThrows(RangeError, binaryToAscii.bind(null, '01100001', -1));
    });
  });

});
