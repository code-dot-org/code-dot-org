import {assert} from '../../util/deprecatedChai';
var DataConverters = require('@cdo/apps/netsim/DataConverters');

describe('DataConverters', function() {
  describe('minifyAB', function() {
    var minifyAB = DataConverters.minifyAB;

    it('strips all characters except As and Bs', function() {
      assert.equal('AAAB', minifyAB('  A3$A A__B \n  kg'));
    });

    it('coerces letters to uppercase', function() {
      assert.equal('ABBB', minifyAB('abBb'));
    });
  });

  describe('minifyBinary', function() {
    var minifyBinary = DataConverters.minifyBinary;

    it('strips all characters except zeroes and ones', function() {
      assert.equal('00101', minifyBinary(' 0ABX$0K\x0D10Z  TU1'));
    });
  });

  describe('minifyHex', function() {
    var minifyHex = DataConverters.minifyHex;

    it('strips whitespace', function() {
      assert.equal('89AB', minifyHex('89 AB'));
    });

    it('strips non-hex characters', function() {
      assert.equal('DEF', minifyHex('DEFGH'));
    });

    it('coerces letters to uppercase', function() {
      assert.equal('AB', minifyHex('Ab'));
    });
  });

  describe('minifyDecimal', function() {
    var minifyDecimal = DataConverters.minifyDecimal;

    it('strips leading whitespace', function() {
      assert.equal('1 1 1', minifyDecimal('  1 1 1'));
    });

    it('strips trailing whitespace', function() {
      assert.equal('1 1 1', minifyDecimal('1 1 1  '));
    });

    it('collapses internal whitespace to one space', function() {
      assert.equal('1 1 1', minifyDecimal('1  1   1'));
    });

    it("strips characters that aren't whitespace or decimal", function() {
      assert.equal('1 1 1', minifyDecimal('a1 \x071B 1c'));
    });
  });

  describe('formatAB', function() {
    var formatAB = DataConverters.formatAB;

    it('is identity for empty string', function() {
      assert.strictEqual(formatAB(''), '');
    });

    it('splits the string at the given chunk size', function() {
      var rawABs = 'ABABABABABABABAB';
      assert.equal('ABAB ABAB ABAB ABAB', formatAB(rawABs, 4));
      assert.equal('ABABABAB ABABABAB', formatAB(rawABs, 8));
    });

    it('does not pad when a chunk comes out uneven', function() {
      var rawABs = 'ABABABABABABABAB';
      assert.equal('ABABA BABAB ABABA B', formatAB(rawABs, 5));
    });

    it('minifies and cleans input before formatting', function() {
      var rawInput = 'AB BAB ABA\xB5ABA B';
      assert.equal('ABBA BABA ABAB', formatAB(rawInput, 4));
    });

    it('throws an exception when chunk size is zero or less', function() {
      assert.throws(formatAB.bind(null, '', 0), RangeError);
      assert.throws(formatAB.bind(null, '', -1), RangeError);
    });

    it("respects optional 'offset' argument", function() {
      var rawABs = 'AAAABBBBAAAABBBB';
      assert.equal('AAA ABBB BAAA ABBB B', formatAB(rawABs, 4, -5));
      assert.equal('AAAA BBBB AAAA BBBB', formatAB(rawABs, 4, -4));
      assert.equal('A AAAB BBBA AAAB BBB', formatAB(rawABs, 4, -3));
      assert.equal('AA AABB BBAA AABB BB', formatAB(rawABs, 4, -2));
      assert.equal('AAA ABBB BAAA ABBB B', formatAB(rawABs, 4, -1));
      assert.equal('AAAA BBBB AAAA BBBB', formatAB(rawABs, 4, 0));
      assert.equal('A AAAB BBBA AAAB BBB', formatAB(rawABs, 4, 1));
      assert.equal('AA AABB BBAA AABB BB', formatAB(rawABs, 4, 2));
      assert.equal('AAA ABBB BAAA ABBB B', formatAB(rawABs, 4, 3));
      assert.equal('AAAA BBBB AAAA BBBB', formatAB(rawABs, 4, 4));
      assert.equal('A AAAB BBBA AAAB BBB', formatAB(rawABs, 4, 5));
    });
  });

  describe('abToInt', function() {
    var abToInt = DataConverters.abToInt;

    it('converts empty string to NaN', function() {
      assert(isNaN(abToInt('')));
    });

    it('interprets As and Bs as a single number regardless of length', function() {
      assert.strictEqual(abToInt('A'), 0);
      assert.strictEqual(abToInt('AAAAAAAA'), 0);
      assert.strictEqual(abToInt('BAAAAAAAAAAAAAAA'), 32768);
    });

    it('minifies and cleans input before converting', function() {
      assert.equal(16, abToInt('AAAB \x1B \x1D \x1F AAAA'));
    });
  });

  describe('intToAB', function() {
    var intToAB = DataConverters.intToAB;

    it('converts a number to its AB representation', function() {
      var width = 4;
      assert.equal('AAAA', intToAB(0, width));
      assert.equal('AAAB', intToAB(1, width));
      assert.equal('AABA', intToAB(2, width));
      assert.equal('AABB', intToAB(3, width));
      assert.equal('ABAB', intToAB(5, width));
      assert.equal('BAAB', intToAB(9, width));
    });

    it('can give AB-strings of different widths, left-padding with As', function() {
      var num = 7;
      assert.equal('BBB', intToAB(num, 3));
      assert.equal('ABBB', intToAB(num, 4));
      assert.equal('AABBB', intToAB(num, 5));
      assert.equal('AAABBB', intToAB(num, 6));
      assert.equal('AAAABBB', intToAB(num, 7));
      assert.equal('AAAAABBB', intToAB(num, 8));
    });

    it('drops leftmost bits when overflowing given width', function() {
      // Non-overflow case
      assert.equal('AAA', intToAB(0, 3));
      assert.equal('AAB', intToAB(1, 3));
      assert.equal('ABA', intToAB(2, 3));

      // Overflow case, wraps around.
      assert.equal('AAA', intToAB(8, 3));
      assert.equal('AAB', intToAB(9, 3));
      assert.equal('ABA', intToAB(10, 3));
    });

    it('throws an exception when width of zero or less is requested', function() {
      assert.throws(intToAB.bind(null, 10, 0), RangeError);
      assert.throws(intToAB.bind(null, 10, -1), RangeError);
    });
  });

  describe('abToBinary', function() {
    var abToBinary = DataConverters.abToBinary;

    it('converts empty string to empty string', function() {
      assert.strictEqual(abToBinary(''), '');
    });

    it('converts an a or an A into a zero', function() {
      assert.strictEqual(abToBinary('A'), '0');
      assert.strictEqual(abToBinary('a'), '0');
    });

    it('converts a b or a B into a one', function() {
      assert.strictEqual(abToBinary('B'), '1');
      assert.strictEqual(abToBinary('b'), '1');
    });

    it('minifies and cleans', function() {
      assert.equal('00010000', abToBinary('  aAa_b aaaA$'));
    });
  });

  describe('binaryToAB', function() {
    var binaryToAB = DataConverters.binaryToAB;

    it('converts empty string to empty string', function() {
      assert.strictEqual(binaryToAB(''), '');
    });

    it('converts a zero into an A', function() {
      assert.strictEqual(binaryToAB('0'), 'A');
    });

    it('converts a one into a B', function() {
      assert.strictEqual(binaryToAB('1'), 'B');
    });

    it('cleans binary before parsing', function() {
      assert.equal('BBBBBAAABBBBBAAA', binaryToAB('1111 10‰00 11 “11” 10 00'));
    });
  });

  describe('formatBinary', function() {
    var formatBinary = DataConverters.formatBinary;

    it('is identity for empty string', function() {
      assert.strictEqual(formatBinary(''), '');
    });

    it('splits the binary string at given chunk size', function() {
      var rawBinary = '0101010101010101';
      assert.equal('0101 0101 0101 0101', formatBinary(rawBinary, 4));
      assert.equal('01010101 01010101', formatBinary(rawBinary, 8));
    });

    it('does not pad when a chunk comes out uneven', function() {
      var rawBinary = '0101010101010101';
      assert.equal('01010 10101 01010 1', formatBinary(rawBinary, 5));
    });

    it('minifies and cleans input before formatting', function() {
      var rawInput = '01 101 A10\x15010 1';
      assert.equal('0110 1100 101', formatBinary(rawInput, 4));
    });

    it('throws an exception when chunk size is zero or less', function() {
      assert.throws(formatBinary.bind(null, '', 0), RangeError);
      assert.throws(formatBinary.bind(null, '', -1), RangeError);
    });

    it("respects optional 'offset' argument", function() {
      var rawBinary = '1111000011110000';
      assert.equal('111 1000 0111 1000 0', formatBinary(rawBinary, 4, -5));
      assert.equal('1111 0000 1111 0000', formatBinary(rawBinary, 4, -4));
      assert.equal('1 1110 0001 1110 000', formatBinary(rawBinary, 4, -3));
      assert.equal('11 1100 0011 1100 00', formatBinary(rawBinary, 4, -2));
      assert.equal('111 1000 0111 1000 0', formatBinary(rawBinary, 4, -1));
      assert.equal('1111 0000 1111 0000', formatBinary(rawBinary, 4, 0));
      assert.equal('1 1110 0001 1110 000', formatBinary(rawBinary, 4, 1));
      assert.equal('11 1100 0011 1100 00', formatBinary(rawBinary, 4, 2));
      assert.equal('111 1000 0111 1000 0', formatBinary(rawBinary, 4, 3));
      assert.equal('1111 0000 1111 0000', formatBinary(rawBinary, 4, 4));
      assert.equal('1 1110 0001 1110 000', formatBinary(rawBinary, 4, 5));
    });
  });

  describe('formatHex', function() {
    var formatHex = DataConverters.formatHex;

    it('is identity for empty string', function() {
      assert.strictEqual(formatHex(''), '');
    });

    it('splits the hex string at given binary chunk size', function() {
      var rawHex = 'ABCDEF';
      assert.equal('AB CD EF', formatHex(rawHex, 8));
      assert.equal('ABC DEF', formatHex(rawHex, 12));
    });

    it(
      'does not split the hex string when the chunk size is ' +
        'not divisble by 4',
      function() {
        var rawHex = 'ABCDEF';
        assert.equal('ABCDEF', formatHex(rawHex, 7));
        assert.equal('ABCDEF', formatHex(rawHex, 9));
        assert.equal('ABCDEF', formatHex(rawHex, 10));
        assert.equal('ABCDEF', formatHex(rawHex, 11));
      }
    );

    it('does not pad when a chunk comes out uneven', function() {
      var rawHex = 'ABCDEF';
      assert.equal('ABCD EF', formatHex(rawHex, 16));
    });

    it('minifies and cleans input before formatting', function() {
      var rawInput = 'ABG cde 12xyz\x18';
      assert.equal('AB CD E1 2', formatHex(rawInput, 8));
    });

    it('throws an exception when chunk size is zero or less', function() {
      assert.throws(formatHex.bind(null, '', 0), RangeError);
      assert.throws(formatHex.bind(null, '', -1), RangeError);
    });

    it("respects optional 'offset' argument at aligned chunk sizes", function() {
      var rawBinary = 'ABCDEF';
      // At 8 bits
      assert.equal('A BC DE F', formatHex(rawBinary, 8, -3));
      assert.equal('AB CD EF', formatHex(rawBinary, 8, -2));
      assert.equal('A BC DE F', formatHex(rawBinary, 8, -1));
      assert.equal('AB CD EF', formatHex(rawBinary, 8, 0));
      assert.equal('A BC DE F', formatHex(rawBinary, 8, 1));
      assert.equal('AB CD EF', formatHex(rawBinary, 8, 2));
      assert.equal('A BC DE F', formatHex(rawBinary, 8, 3));

      // At 12 bits
      assert.equal('AB CDE F', formatHex(rawBinary, 12, -4));
      assert.equal('ABC DEF', formatHex(rawBinary, 12, -3));
      assert.equal('A BCD EF', formatHex(rawBinary, 12, -2));
      assert.equal('AB CDE F', formatHex(rawBinary, 12, -1));
      assert.equal('ABC DEF', formatHex(rawBinary, 12, 0));
      assert.equal('A BCD EF', formatHex(rawBinary, 12, 1));
      assert.equal('AB CDE F', formatHex(rawBinary, 12, 2));
      assert.equal('ABC DEF', formatHex(rawBinary, 12, 3));
      assert.equal('A BCD EF', formatHex(rawBinary, 12, 4));
    });

    it("ignores 'offset' at nonaligned chunk sizes", function() {
      var rawBinary = 'ABCDEF';
      // At 5 bits
      assert.equal('ABCDEF', formatHex(rawBinary, 5, -3));
      assert.equal('ABCDEF', formatHex(rawBinary, 5, -2));
      assert.equal('ABCDEF', formatHex(rawBinary, 5, -1));
      assert.equal('ABCDEF', formatHex(rawBinary, 5, 0));
      assert.equal('ABCDEF', formatHex(rawBinary, 5, 1));
      assert.equal('ABCDEF', formatHex(rawBinary, 5, 2));
      assert.equal('ABCDEF', formatHex(rawBinary, 5, 3));
    });
  });

  describe('alignDecimal', function() {
    var alignDecimal = DataConverters.alignDecimal;

    it('is identity for empty string', function() {
      assert.strictEqual(alignDecimal(''), '');
    });

    it('puts final digits of all numbers at equal distances apart', function() {
      assert.equal('1 1 1', alignDecimal('1  1    1'));
      assert.equal('10 01 10', alignDecimal('10 1 10'));
      assert.equal('100 010 001', alignDecimal('100 10 1'));
    });

    it('pads leading numbers', function() {
      assert.equal('001 010 100', alignDecimal('1 10 100'));
    });
  });

  describe('binaryToInt', function() {
    var binaryToInt = DataConverters.binaryToInt;

    it('converts empty string to NaN', function() {
      assert(isNaN(binaryToInt('')));
    });

    it('interprets binary as a single number regardless of length', function() {
      assert.strictEqual(binaryToInt('0'), 0);
      assert.strictEqual(binaryToInt('00000000'), 0);
      assert.strictEqual(binaryToInt('1000000000000000'), 32768);
    });

    it('minifies and cleans input before converting', function() {
      assert.equal(16, binaryToInt('0001 \x1B \x1D \x1F 0000'));
    });
  });

  describe('intToBinary', function() {
    var intToBinary = DataConverters.intToBinary;

    it('converts a number to its binary representation', function() {
      var width = 4;
      assert.equal('0000', intToBinary(0, width));
      assert.equal('0001', intToBinary(1, width));
      assert.equal('0010', intToBinary(2, width));
      assert.equal('0011', intToBinary(3, width));
      assert.equal('0101', intToBinary(5, width));
      assert.equal('1001', intToBinary(9, width));
    });

    it('can give binary of different widths, left-padding with zeroes', function() {
      var num = 7;
      assert.equal('111', intToBinary(num, 3));
      assert.equal('0111', intToBinary(num, 4));
      assert.equal('00111', intToBinary(num, 5));
      assert.equal('000111', intToBinary(num, 6));
      assert.equal('0000111', intToBinary(num, 7));
      assert.equal('00000111', intToBinary(num, 8));
    });

    it('drops leftmost bits when overflowing given width', function() {
      // Non-overflow case
      assert.equal('000', intToBinary(0, 3));
      assert.equal('001', intToBinary(1, 3));
      assert.equal('010', intToBinary(2, 3));

      // Overflow case, wraps around.
      assert.equal('000', intToBinary(8, 3));
      assert.equal('001', intToBinary(9, 3));
      assert.equal('010', intToBinary(10, 3));
    });

    it('throws an exception when width of zero or less is requested', function() {
      assert.throws(intToBinary.bind(null, 10, 0), RangeError);
      assert.throws(intToBinary.bind(null, 10, -1), RangeError);
    });
  });

  describe('hexToInt', function() {
    var hexToInt = DataConverters.hexToInt;

    it('converts empty string to NaN', function() {
      assert(isNaN(hexToInt('')));
    });

    it('interprets hexadecimal as a single number regardless of length', function() {
      assert.equal(10, hexToInt('A'));
      assert.equal(10, hexToInt('000A'));
      assert.equal(268435456, hexToInt('10000000'));
    });

    it('minifies and cleans input before converting', function() {
      assert.equal(2571, hexToInt('0A 0B <= • ?'));
    });
  });

  describe('intToHex', function() {
    var intToHex = DataConverters.intToHex;

    it('converts a number to its hex representation', function() {
      var width = 4;
      assert.strictEqual(intToHex(0, width), '0000');
      assert.strictEqual(intToHex(8, width), '0008');
      assert.strictEqual(intToHex(20, width), '0014');
      assert.strictEqual(intToHex(1200, width), '04B0');
    });

    it('gives hex with uppercase letters', function() {
      var width = 1;
      assert.strictEqual(intToHex(10, width), 'A');
      assert.strictEqual(intToHex(11, width), 'B');
      assert.strictEqual(intToHex(12, width), 'C');
      assert.strictEqual(intToHex(13, width), 'D');
      assert.strictEqual(intToHex(14, width), 'E');
      assert.strictEqual(intToHex(15, width), 'F');
    });

    it('can give hex of different widths, left-padding with zeroes', function() {
      var number = 245;
      assert.strictEqual(intToHex(number, 2), 'F5');
      assert.strictEqual(intToHex(number, 3), '0F5');
      assert.strictEqual(intToHex(number, 4), '00F5');
    });

    it('drops leftmost nibbles when overflowing given width', function() {
      // Non-overflow case:
      assert.strictEqual(intToHex(0, 2), '00');
      assert.strictEqual(intToHex(1, 2), '01');
      assert.strictEqual(intToHex(2, 2), '02');

      // Overflow case:
      assert.strictEqual(intToHex(256, 2), '00');
      assert.strictEqual(intToHex(257, 2), '01');
      assert.strictEqual(intToHex(258, 2), '02');
    });

    it('throws an exception when width of zero or less is requested', function() {
      assert.throws(intToHex.bind(null, 15, 0), RangeError);
      assert.throws(intToHex.bind(null, 15, -1), RangeError);
    });
  });

  describe('hexToBinary', function() {
    var hexToBinary = DataConverters.hexToBinary;

    it('converts empty string to empty string', function() {
      assert.equal('', hexToBinary(''));
    });

    it('turns a hex character into 4 bits', function() {
      assert.equal('0000', hexToBinary('0'));
      assert.equal('0001', hexToBinary('1'));
      assert.equal('0010', hexToBinary('2'));
      assert.equal('0011', hexToBinary('3'));
      assert.equal('0100', hexToBinary('4'));
      assert.equal('0101', hexToBinary('5'));
      assert.equal('0110', hexToBinary('6'));
      assert.equal('0111', hexToBinary('7'));
      assert.equal('1000', hexToBinary('8'));
      assert.equal('1001', hexToBinary('9'));
      assert.equal('1010', hexToBinary('A'));
      assert.equal('1011', hexToBinary('B'));
      assert.equal('1100', hexToBinary('C'));
      assert.equal('1101', hexToBinary('D'));
      assert.equal('1110', hexToBinary('E'));
      assert.equal('1111', hexToBinary('F'));
    });

    it('gives 4 bits for each character', function() {
      assert.equal('00000000', hexToBinary('00'));
      assert.equal('100000011111', hexToBinary('81F'));
      assert.equal('1001100110011001', hexToBinary('9999'));
    });
  });

  describe('binaryToHex', function() {
    var binaryToHex = DataConverters.binaryToHex;

    it('converts empty string to empty string', function() {
      assert.equal('', binaryToHex(''));
    });

    it('produces correct uppercase hex characters', function() {
      assert.equal('0', binaryToHex('0000'));
      assert.equal('1', binaryToHex('0001'));
      assert.equal('2', binaryToHex('0010'));
      assert.equal('3', binaryToHex('0011'));
      assert.equal('4', binaryToHex('0100'));
      assert.equal('5', binaryToHex('0101'));
      assert.equal('6', binaryToHex('0110'));
      assert.equal('7', binaryToHex('0111'));
      assert.equal('8', binaryToHex('1000'));
      assert.equal('9', binaryToHex('1001'));
      assert.equal('A', binaryToHex('1010'));
      assert.equal('B', binaryToHex('1011'));
      assert.equal('C', binaryToHex('1100'));
      assert.equal('D', binaryToHex('1101'));
      assert.equal('E', binaryToHex('1110'));
      assert.equal('F', binaryToHex('1111'));
    });

    it('cleans binary before parsing', function() {
      assert.equal('F8F8', binaryToHex('1111 10‰00 11 “11” 10 00'));
    });

    it('right-pads when binary length is not a multiple of 4', function() {
      assert.equal('88', binaryToHex('1000 1')); // Pads 3 zeroes
      assert.equal('CC', binaryToHex('1100 11')); // Pads 2 zeros
      assert.equal('EE', binaryToHex('1110 111')); // Pads 1 zero
    });
  });

  describe('decimalToBinary', function() {
    var decimalToBinary = DataConverters.decimalToBinary;

    it('converts empty string to empty string', function() {
      assert.equal('', decimalToBinary('', 8));
    });

    it('produces correct bytes for numbers in the string', function() {
      assert.equal('000', decimalToBinary('0', 3));
      assert.equal('001', decimalToBinary('1', 3));
      assert.equal('010', decimalToBinary('2', 3));
      assert.equal('011', decimalToBinary('3', 3));
      assert.equal('100', decimalToBinary('4', 3));
      assert.equal('101', decimalToBinary('5', 3));
      assert.equal('110', decimalToBinary('6', 3));
      assert.equal('111', decimalToBinary('7', 3));
    });

    it('concatenates bytes for whitespace-delimited numbers in the string', function() {
      assert.equal('000', decimalToBinary('00', 3));
      assert.equal('000000', decimalToBinary('0 0', 3));
      assert.equal('101011', decimalToBinary('5 3', 3));
    });

    it('handles leading and trailing spaces', function() {
      assert.equal('100001', decimalToBinary(' 4 1', 3));
      assert.equal('100001', decimalToBinary('4 1 ', 3));
    });

    it('truncates left bits when numbers overflow byte-size', function() {
      assert.equal('000000', decimalToBinary('0 8', 3));
      assert.equal('001001', decimalToBinary('1 9', 3));
      assert.equal('010010', decimalToBinary('2 10', 3));
    });
  });

  describe('binaryToDecimal', function() {
    var binaryToDecimal = DataConverters.binaryToDecimal;

    it('converts empty string to empty string', function() {
      assert.strictEqual(binaryToDecimal('', 8), '');
    });

    it('produces correct numbers for binary', function() {
      assert.equal('0', binaryToDecimal('000', 3));
      assert.equal('1', binaryToDecimal('001', 3));
      assert.equal('2', binaryToDecimal('010', 3));
      assert.equal('3', binaryToDecimal('011', 3));
      assert.equal('4', binaryToDecimal('100', 3));
      assert.equal('5', binaryToDecimal('101', 3));
      assert.equal('6', binaryToDecimal('110', 3));
      assert.equal('7', binaryToDecimal('111', 3));
    });

    it('cleans binary first', function() {
      assert.equal('7 5', binaryToDecimal('11 11 01™', 3));
    });

    it('can extract multiple numbers from binary', function() {
      assert.equal('0 0 0', binaryToDecimal('000', 1));
      assert.equal('7 5', binaryToDecimal('111101', 3));
    });

    it('can extract multi-digit numbers from binary', function() {
      assert.equal('15', binaryToDecimal('1111', 4));
      assert.equal('15 13', binaryToDecimal('11111101', 4));
    });

    it("zero-pads right when bits don't divide by byte-size", function() {
      assert.equal('8 8', binaryToDecimal('1000 1', 4));
      assert.equal('12 12', binaryToDecimal('1100 11', 4));
      assert.equal('14 14', binaryToDecimal('1110 111', 4));
    });
  });

  describe('asciiToBinary', function() {
    var asciiToBinary = DataConverters.asciiToBinary;

    it('converts empty string to empty string', function() {
      assert.strictEqual(asciiToBinary('', 8), '');
    });

    it('produces correct binary for characters', function() {
      assert.equal('01100001', asciiToBinary('a', 8));
      assert.equal('01100010', asciiToBinary('b', 8));
      assert.equal('01100011', asciiToBinary('c', 8));
      assert.equal('01100100', asciiToBinary('d', 8));
      assert.equal('01000001', asciiToBinary('A', 8));
      assert.equal('01000010', asciiToBinary('B', 8));
      assert.equal('01000011', asciiToBinary('C', 8));
      assert.equal('01000100', asciiToBinary('D', 8));
    });

    it('takes multiple characters', function() {
      assert.equal('010010000110100100100001', asciiToBinary('Hi!', 8));
    });

    it('produces byteSize bits for each character, padding left', function() {
      assert.equal('1100001', asciiToBinary('a', 7));
      assert.equal('01100001', asciiToBinary('a', 8));
      assert.equal('001100001', asciiToBinary('a', 9));
    });

    it('truncates on left when character overflows given byteSize', function() {
      assert.equal('100001', asciiToBinary('a', 6));
      assert.equal('00001', asciiToBinary('a', 5));
      assert.equal('0001', asciiToBinary('a', 4));
      assert.equal('001', asciiToBinary('a', 3));
      assert.equal('01', asciiToBinary('a', 2));
      assert.equal('1', asciiToBinary('a', 1));
    });

    it('throws an exception when byteSize of zero or less is requested', function() {
      assert.throws(asciiToBinary.bind(null, 'a', 0), RangeError);
      assert.throws(asciiToBinary.bind(null, 'a', -1), RangeError);
    });
  });

  describe('binaryToAscii', function() {
    var binaryToAscii = DataConverters.binaryToAscii;

    it('converts empty string to empty string', function() {
      assert.strictEqual(binaryToAscii('', 8), '');
    });

    it('produces correct characters for binary', function() {
      assert.equal('a', binaryToAscii('01100001', 8));
      assert.equal('b', binaryToAscii('01100010', 8));
      assert.equal('c', binaryToAscii('01100011', 8));
      assert.equal('d', binaryToAscii('01100100', 8));
      assert.equal('A', binaryToAscii('01000001', 8));
      assert.equal('B', binaryToAscii('01000010', 8));
      assert.equal('C', binaryToAscii('01000011', 8));
      assert.equal('D', binaryToAscii('01000100', 8));
    });

    it('extracts multiple characters', function() {
      assert.equal('Hi!', binaryToAscii('010010000110100100100001', 8));
    });

    it('extracts a character for each byteSize bits', function() {
      assert.equal('a', binaryToAscii('1100001', 7));
      assert.equal('a', binaryToAscii('01100001', 8));
      assert.equal('a', binaryToAscii('001100001', 9));
    });

    it("zero-pads on right when binary length doesn't divide into byteSize", function() {
      assert.equal('@@', binaryToAscii('01000000 01', 8));
      assert.equal('``', binaryToAscii('01100000 011', 8));
      assert.equal('pp', binaryToAscii('01110000 0111', 8));
      assert.equal('xx', binaryToAscii('01111000 01111', 8));
      assert.equal('||', binaryToAscii('01111100 011111', 8));
      assert.equal('~~', binaryToAscii('01111110 0111111', 8));
    });

    it('throws an exception when byteSize of zero or less is requested', function() {
      assert.throws(binaryToAscii.bind(null, '01100001', 0), RangeError);
      assert.throws(binaryToAscii.bind(null, '01100001', -1), RangeError);
    });
  });

  describe('binaryToBase64', function() {
    var binaryToBase64 = DataConverters.binaryToBase64;
    var base64ToBinary = DataConverters.base64ToBinary;

    /**
     * Assert if the given base64 results are not equal. Equality is
     * defined as sharing BOTH their string and their len properties
     * @param {Base64Payload} left
     * @param {Base64Payload} right
     */
    var assertBase64NotEqual = function(left, right) {
      assert.notDeepEqual(
        left,
        right,
        'Expected ' +
          JSON.stringify(left) +
          ' and ' +
          JSON.stringify(right) +
          ' to be not equal, but they are'
      );
    };

    it('converts empty string to empty string with length 0', function() {
      var b64 = binaryToBase64('');
      assert.strictEqual(b64.string, '');
      assert.strictEqual(b64.len, 0);
    });

    it('throws an exception when given a non-binary String', function() {
      assert.throws(
        binaryToBase64.bind(null, 'some non-binary String'),
        TypeError
      );
    });

    it("zero-pads on right when binary length doesn't divide into byteSize", function() {
      var b64 = binaryToBase64('1').string;
      assert.equal(b64, binaryToBase64('10').string);
      assert.equal(b64, binaryToBase64('100').string);
      assert.equal(b64, binaryToBase64('1000').string);
      assert.equal(b64, binaryToBase64('10000').string);
      assert.equal(b64, binaryToBase64('100000').string);
      assert.equal(b64, binaryToBase64('1000000').string);
      assert.equal(b64, binaryToBase64('10000000').string);

      assert.notEqual(b64, binaryToBase64('11').string);
      assert.notEqual(b64, binaryToBase64('101').string);
      assert.notEqual(b64, binaryToBase64('1001').string);
      assert.notEqual(b64, binaryToBase64('10001').string);
      assert.notEqual(b64, binaryToBase64('100001').string);
      assert.notEqual(b64, binaryToBase64('1000001').string);
      assert.notEqual(b64, binaryToBase64('10000001').string);

      var longerb64 = binaryToBase64('101011010').string;
      assert.equal(longerb64, binaryToBase64('101011010').string);
      assert.equal(longerb64, binaryToBase64('1010110100').string);
      assert.equal(longerb64, binaryToBase64('10101101000').string);
      assert.equal(longerb64, binaryToBase64('101011010000').string);
      assert.equal(longerb64, binaryToBase64('1010110100000').string);
      assert.equal(longerb64, binaryToBase64('10101101000000').string);
      assert.equal(longerb64, binaryToBase64('101011010000000').string);
      assert.equal(longerb64, binaryToBase64('1010110100000000').string);

      assert.notEqual(longerb64, binaryToBase64('101011011').string);
      assert.notEqual(longerb64, binaryToBase64('1010110101').string);
      assert.notEqual(longerb64, binaryToBase64('10101101001').string);
      assert.notEqual(longerb64, binaryToBase64('101011010001').string);
      assert.notEqual(longerb64, binaryToBase64('1010110100001').string);
      assert.notEqual(longerb64, binaryToBase64('10101101000001').string);
      assert.notEqual(longerb64, binaryToBase64('101011010000001').string);
      assert.notEqual(longerb64, binaryToBase64('1010110100000001').string);
    });

    it('saves the original string length, even when padding', function() {
      var binaryString = '1';
      var binaryStringLen = binaryString.length;
      var b64 = binaryToBase64(binaryString);
      do {
        assert.equal(b64.len, binaryString.length);
        binaryString += '0';
        b64 = binaryToBase64(binaryString);
        assert.notEqual(b64.len, binaryStringLen);
        binaryStringLen = binaryString.length;
      } while (binaryString.length <= 32);
    });

    it('converts reversably to a base64 value', function() {
      var binaryString = '10101110101010101010101101011011110100110';
      var base64 = binaryToBase64(binaryString);
      assert.equal(binaryString, base64ToBinary(base64.string, base64.len));
    });

    it('converts uniquely to a base64 (string, length) pair', function() {
      var base64Values = [
        '0',
        '1',
        '00',
        '11',
        '000',
        '111',
        '0000',
        '1111',
        '00000',
        '11111',
        '000000',
        '111111',
        '0000000',
        '1111111',
        '00000000',
        '11111111',
        '000000000',
        '111111111'
      ].map(binaryToBase64);
      var i, j;

      for (i = 0; i < base64Values.length; i += 1) {
        for (j = i + 1; j < base64Values.length; j += 1) {
          assertBase64NotEqual(base64Values[i], base64Values[j]);
        }
      }
    });
  });

  describe('base64ToBinary', function() {
    var base64ToBinary = DataConverters.base64ToBinary;
    it('throws an exception when given a non-base64-encoded String', function() {
      assert.throws(
        base64ToBinary.bind(null, 'some non-base64 String'),
        TypeError
      );
    });
  });

  describe('binaryToAddressString', function() {
    var binaryToAddressString = DataConverters.binaryToAddressString;
    var ipv4 = '8.8.8.8';

    it('converts empty string to empty string', function() {
      assert.strictEqual(binaryToAddressString('', ipv4), '');
    });

    it('renders correctly formatted addresses', function() {
      var addressBinary = DataConverters.hexToBinary('7F 00 00 01');
      assert.equal('127.0.0.1', binaryToAddressString(addressBinary, ipv4));
    });

    it('left-pads individual parts when missing bits', function() {
      var addressBinary;
      addressBinary = '00000000 00000000 00000000 1';
      assert.equal('0.0.0.1', binaryToAddressString(addressBinary, ipv4));

      addressBinary = '00000000 00000000 00000000 10';
      assert.equal('0.0.0.2', binaryToAddressString(addressBinary, ipv4));

      addressBinary = '00000000 00000000 00000000 100';
      assert.equal('0.0.0.4', binaryToAddressString(addressBinary, ipv4));

      addressBinary = '00000000 00000000 00000000 1000';
      assert.equal('0.0.0.8', binaryToAddressString(addressBinary, ipv4));

      addressBinary = '00000000 00000000 00000000 10000';
      assert.equal('0.0.0.16', binaryToAddressString(addressBinary, ipv4));

      addressBinary = '00000000 00000000 00000000 100000';
      assert.equal('0.0.0.32', binaryToAddressString(addressBinary, ipv4));

      addressBinary = '00000000 00000000 00000000 1000000';
      assert.equal('0.0.0.64', binaryToAddressString(addressBinary, ipv4));
    });

    it('fills right address parts with zero when not enough parts exist', function() {
      var addressBinary;
      addressBinary = DataConverters.hexToBinary('FF');
      assert.equal('255.0.0.0', binaryToAddressString(addressBinary, ipv4));

      addressBinary = DataConverters.hexToBinary('FF FF');
      assert.equal('255.255.0.0', binaryToAddressString(addressBinary, ipv4));

      addressBinary = DataConverters.hexToBinary('FF FF FF');
      assert.equal('255.255.255.0', binaryToAddressString(addressBinary, ipv4));
    });

    it('accepts different formats', function() {
      var addressBinary = '1000 1001 1010 1011';
      assert.equal('137.171', binaryToAddressString(addressBinary, '8.8'));
      assert.equal(
        '8.9.10.11',
        binaryToAddressString(addressBinary, '4.4.4.4')
      );
      assert.equal('8.9.171', binaryToAddressString(addressBinary, '4.4.8'));
      assert.equal(
        '17:3:2:2:1:1',
        binaryToAddressString(addressBinary, '5:4:3:2:1:1')
      );
    });
  });

  describe('addressStringToBinary', function() {
    var addressStringToBinary = DataConverters.addressStringToBinary;

    it('converts empty string to empty string', function() {
      var addressFormat = '4.4';
      assert.strictEqual(addressStringToBinary('', addressFormat), '');
    });

    it('produces correct binary for the given address', function() {
      var addressFormat = '4.4';
      assert.equal('00000000', addressStringToBinary('0.0', addressFormat));
      assert.equal('00000001', addressStringToBinary('0.1', addressFormat));
      assert.equal('00000010', addressStringToBinary('0.2', addressFormat));
      assert.equal('00010001', addressStringToBinary('1.1', addressFormat));
      assert.equal('00010010', addressStringToBinary('1.2', addressFormat));
      assert.equal('00110100', addressStringToBinary('3.4', addressFormat));
      assert.equal('10111100', addressStringToBinary('11.12', addressFormat));
      assert.equal('11111111', addressStringToBinary('15.15', addressFormat));
    });

    it('produces correct binary for the given format', function() {
      var addressString = '2.3.4.5';
      assert.equal('0010', addressStringToBinary(addressString, '4'));
      assert.equal('00000010', addressStringToBinary(addressString, '8'));
      assert.equal(
        '0010' + '0011',
        addressStringToBinary(addressString, '4.4')
      );
      assert.equal(
        '00000010' + '00000011',
        addressStringToBinary(addressString, '8.8')
      );
      assert.equal(
        '0010' + '00000011',
        addressStringToBinary(addressString, '4.8')
      );
      assert.equal(
        '0010' + '0011' + '0100' + '0101',
        addressStringToBinary(addressString, '4.4.4.4')
      );
      assert.equal(
        '00000010' + '00000011' + '00000100' + '00000101',
        addressStringToBinary(addressString, '8.8.8.8')
      );
      assert.equal(
        '010' + '011' + '100' + '101',
        addressStringToBinary(addressString, '3.3.3.3')
      );
    });

    it('ignores extra address parts', function() {
      var addressString = '2.3.4.5';
      assert.equal('0010', addressStringToBinary(addressString, '4'));
      assert.equal(
        '0010' + '0011',
        addressStringToBinary(addressString, '4.4')
      );
      assert.equal(
        '0010' + '0011' + '0100',
        addressStringToBinary(addressString, '4.4.4')
      );
    });

    it('fills missing address parts with zero', function() {
      var addressString = '2';
      assert.equal(
        '0010' + '0000',
        addressStringToBinary(addressString, '4.4')
      );
      assert.equal(
        '0010' + '0000' + '0000',
        addressStringToBinary(addressString, '4.4.4')
      );
      assert.equal(
        '0010' + '0000' + '0000' + '0000',
        addressStringToBinary(addressString, '4.4.4.4')
      );
    });

    it('individual parts can overflow based on their bit-width', function() {
      var fourBitLimit = '4.4';
      assert.equal(
        '1111' + '1111',
        addressStringToBinary('15.15', fourBitLimit)
      );
      assert.equal(
        '0000' + '1111',
        addressStringToBinary('16.15', fourBitLimit)
      );
      assert.equal(
        '0001' + '1111',
        addressStringToBinary('17.15', fourBitLimit)
      );
      assert.equal(
        '1111' + '0000',
        addressStringToBinary('15.16', fourBitLimit)
      );
      assert.equal(
        '1111' + '0001',
        addressStringToBinary('15.17', fourBitLimit)
      );

      var eightBitLimit = '8.8';
      assert.equal(
        '00001111' + '00001111',
        addressStringToBinary('15.15', eightBitLimit)
      );
      assert.equal(
        '00010000' + '00001111',
        addressStringToBinary('16.15', eightBitLimit)
      );
      assert.equal(
        '00010001' + '00001111',
        addressStringToBinary('17.15', eightBitLimit)
      );

      assert.equal(
        '11111111' + '11111111',
        addressStringToBinary('255.255', eightBitLimit)
      );
      assert.equal(
        '00000000' + '11111111',
        addressStringToBinary('256.255', eightBitLimit)
      );
      assert.equal(
        '00000001' + '11111111',
        addressStringToBinary('257.255', eightBitLimit)
      );
    });
  });

  describe('formatBinaryForAddressHeader', function() {
    var formatBinaryForAddressHeader =
      DataConverters.formatBinaryForAddressHeader;

    it('is identity for empty string', function() {
      assert.strictEqual(formatBinaryForAddressHeader('', ''), '');
    });

    it('splits the binary string in the right places', function() {
      var rawBinary = '0101010101010101';
      assert.equal(
        '0101 0101 0101 0101',
        formatBinaryForAddressHeader(rawBinary, '4.4.4.4')
      );
      assert.equal(
        '01010101 01010101',
        formatBinaryForAddressHeader(rawBinary, '8.8')
      );
      assert.equal(
        '01010101 0101 01 0 1',
        formatBinaryForAddressHeader(rawBinary, '8.4.2.1.1')
      );
    });

    it('leaves any trailing binary as a single chunk', function() {
      var rawBinary = '0101010101010101';
      assert.equal(
        '01010 10101 010101',
        formatBinaryForAddressHeader(rawBinary, '5.5')
      );
    });

    it('stops when it runs out of source binary even if the format is longer', function() {
      var rawBinary = '0101010101010101';
      assert.equal(
        '01010 10101 01010 1',
        formatBinaryForAddressHeader(rawBinary, '5.5.5.5')
      );
    });

    it('minifies and cleans input before formatting', function() {
      var rawInput = '01 101 A10\x15010 1';
      assert.equal(
        '0110 1100 101',
        formatBinaryForAddressHeader(rawInput, '4.4.3')
      );
    });
  });
});
