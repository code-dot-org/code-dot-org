/**
 * @overview Provides utility methods for converting user data between
 *           different encodings, and formatting those encodings: binary,
 *           hex, decimal, ASCII.  "A and B" is a special encoding that is
 *           just binary with "A" sub'd for 0 and "B" sub'd for 1.
 */

import * as utils from '../utils'; // For String.prototype.repeat polyfill
import {zeroPadLeft, zeroPadRight} from './NetSimUtils';

/**
 * @typedef {string} AddressHeaderFormat
 * A string indicating the parts of an address field in the packet header,
 * their respective byte-widths, and the separators to be used when converting
 * binary to a readable format.
 * Examples:
 * "4" indicates a single 4-byte number, e.g. 5 / 0101
 * "8.4" indicates an 8-byte number followed by a 4-byte number, separated
 *   by a period, e.g. 1.1 / 000000010001 or 18.9 / 00010010 1001
 * "8.8.8.8" would be an IPv4 address, e.g.
 *   127.0.0.1 / 01111111 00000000 00000000 00000001
 */

/**
 * Converts an As and Bs string into its most compact representation, forced
 * to uppercase.
 * @param {string} abString
 * @returns {string}
 */
export const minifyAB = function (abString) {
  return abString.replace(/[^AB]/gi, '').toUpperCase();
};

/**
 * Converts an AB-binary string to a formatted representation, with chunks
 * of a set size separated by a space.
 * @param {string} abString
 * @param {number} chunkSize
 * @param {number} [offset] bit-offset for formatting effect; default 0.
 * @returns {string} formatted version
 */
export const formatAB = function (abString, chunkSize, offset) {
  return formatBinary(abToBinary(abString), chunkSize, offset)
    .replace(/0/g, 'A')
    .replace(/1/g, 'B');
};

/**
 * Converts a binary string into its most compact string representation.
 * @param {string} binaryString that may contain whitespace
 * @returns {string} binary string with no whitespace
 */
export const minifyBinary = function (binaryString) {
  return binaryString.replace(/[^01]/g, '');
};

/**
 * Converts a binary string to a formatted representation, with chunks of
 * a set size separated by a space.
 * @param {string} binaryString - may be unformatted already
 * @param {number} chunkSize - how many bits per format chunk
 * @param {number} [offset] bit-offset for formatting effect; default 0.
 * @returns {string} pretty formatted binary string
 */
export const formatBinary = function (binaryString, chunkSize, offset) {
  offset = utils.valueOr(offset, 0);
  if (chunkSize <= 0) {
    throw new RangeError('Parameter chunkSize must be greater than zero');
  }

  var binary = minifyBinary(binaryString);

  var chunks = [];
  var firstChunkLength = utils.mod(offset, chunkSize);
  if (firstChunkLength > 0) {
    chunks.push(binary.substr(0, firstChunkLength));
  }

  for (var i = firstChunkLength; i < binary.length; i += chunkSize) {
    chunks.push(binary.substr(i, chunkSize));
  }

  return chunks.join(' ');
};

/**
 * Converts a hexadecimal string into its most compact string representation.
 * Strips whitespace and non-hex characters, and coerces letters to uppercase.
 * @param {string} hexString
 * @returns {string}
 */
export const minifyHex = function (hexString) {
  return hexString.replace(/[^0-9A-F]/gi, '').toUpperCase();
};

/**
 * Reduces all whitespace to single characters and strips non-digits.
 * @param decimalString
 */
export const minifyDecimal = function (decimalString) {
  return decimalString
    .replace(/(^\s+|\s+$|[^0-9\s])/g, '')
    .replace(/\s+/g, ' ');
};

/**
 * Converts a hex string to a formatted representation, with chunks of
 * a set size separated by a space.
 * @param {string} hexString
 * @param {number} chunkSize - in bits!
 * @param {number} [offset] hex-digit-offset for formatting effect; default 0.
 * @returns {string} formatted hex
 */
export const formatHex = function (hexString, chunkSize, offset) {
  offset = utils.valueOr(offset, 0);
  if (chunkSize <= 0) {
    throw new RangeError('Parameter chunkSize must be greater than zero');
  }

  // Don't format hex when the chunkSize doesn't align with hex characters.
  if (chunkSize % 4 !== 0) {
    return hexString;
  }

  var hexChunkSize = chunkSize / 4;
  var hex = minifyHex(hexString);

  var chunks = [];
  var firstChunkLength = utils.mod(offset, hexChunkSize);
  if (firstChunkLength > 0) {
    chunks.push(hex.substr(0, firstChunkLength));
  }

  for (var i = firstChunkLength; i < hex.length; i += hexChunkSize) {
    chunks.push(hex.substr(i, hexChunkSize));
  }

  return chunks.join(' ');
};

/**
 * Takes a set of whitespace-separated numbers and pads the spacing between
 * them to the width of the widest number, so that they line up when they
 * wrap.
 * @param {string} decimalString
 * @returns {string} aligned decimal string
 */
export const alignDecimal = function (decimalString) {
  if (decimalString.replace(/\D/g, '') === '') {
    return '';
  }

  var numbers = minifyDecimal(decimalString).split(/\s+/);

  // Find the length of the longest number
  var mostDigits = numbers.reduce(function (prev, cur) {
    if (cur.length > prev) {
      return cur.length;
    }
    return prev;
  }, 0);

  var zeroPadding = '0'.repeat(mostDigits);

  return numbers
    .map(function (numString) {
      // Left-pad each number with non-breaking spaces up to max width.
      return (zeroPadding + numString).slice(-mostDigits);
    })
    .join(' ');
};

/**
 * Interprets a string of As and Bs as binary where A is 0 and B is 1, then
 * interprets that binary as a single number, and returns that number.
 * @param {string} abString
 * @returns {number}
 */
export const abToInt = function (abString) {
  return binaryToInt(abToBinary(abString));
};

/**
 * Converts a number to an AB binary representation
 * @param {number} num
 * @param {number} width
 * @returns {string}
 */
export const intToAB = function (num, width) {
  return binaryToAB(intToBinary(num, width));
};

/**
 * Converts As and Bs to a binary string, where A is 0 and B is 1.
 * @param {string} abString
 * @returns {string}
 */
export const abToBinary = function (abString) {
  return minifyAB(abString).replace(/A/g, '0').replace(/B/g, '1');
};

/**
 * Converts binary into As and Bs, where 0 is A and 1 is B.
 * @param {string} binaryString
 * @returns {string}
 */
export const binaryToAB = function (binaryString) {
  return minifyBinary(binaryString).replace(/0/g, 'A').replace(/1/g, 'B');
};

/**
 * Interprets a binary string as a single number, and returns that number.
 * @param {string} binaryString
 * @returns {number}
 */
export const binaryToInt = function (binaryString) {
  return parseInt(minifyBinary(binaryString), 2);
};

var intToString = function (int, base, width) {
  if (width <= 0) {
    throw new RangeError('Output width must be greater than zero');
  }
  return zeroPadLeft(int.toString(base), width);
};

/**
 * Converts a number to a binary string representation with the given width.
 * @param {number} int - number to convert
 * @param {number} width - number of bits to use
 * @returns {string} - binary representation with length of "width"
 */
export const intToBinary = function (int, width) {
  return intToString(int, 2, width);
};

/**
 * Interprets a hex string as a single number, and returns that number.
 * @param hexadecimalString
 * @returns {Number}
 */
export const hexToInt = function (hexadecimalString) {
  return parseInt(minifyHex(hexadecimalString), 16);
};

/**
 * Converts a number to a hexadecimal string representation with the given
 * width.
 * @param {number} int - number to convert
 * @param {number} width - number of characters to use
 * @returns {string} - hex representation with length of "width"
 */
export const intToHex = function (int, width) {
  return intToString(int, 16, width).toUpperCase();
};

/**
 * Converts a hex string to a binary string, by mapping each hex character
 * to four bits of binary.
 * @param {string} hexadecimalString
 * @returns {string} binary representation.
 */
export const hexToBinary = function (hexadecimalString) {
  var uglyHex = minifyHex(hexadecimalString);
  var binary = '';

  for (var i = 0; i < uglyHex.length; i++) {
    binary += intToBinary(hexToInt(uglyHex.substr(i, 1)), 4);
  }

  return binary;
};

/**
 * Converts a binary string to a hex string, mapping each four bits into
 * a hex character and right-padding with zeroes to round out the binary length.
 * @param {string} binaryString
 * @returns {string}
 */
export const binaryToHex = function (binaryString) {
  var currentNibble;
  var nibbleWidth = 4;
  var chars = [];
  var uglyBinary = minifyBinary(binaryString);
  for (var i = 0; i < uglyBinary.length; i += nibbleWidth) {
    currentNibble = zeroPadRight(
      uglyBinary.substr(i, nibbleWidth),
      nibbleWidth
    );
    chars.push(intToHex(binaryToInt(currentNibble), 1));
  }
  return chars.join('');
};

/**
 * Converts a string set of numbers to a binary representation of those numbers
 * using the given byte-size.
 * @param {string} decimalString - A set of numbers separated by whitespace.
 * @param {number} byteSize - How many bits to use to represent each number.
 * @returns {string} Binary representation.
 */
export const decimalToBinary = function (decimalString, byteSize) {
  // Special case: No numbers
  if (decimalString.replace(/\D/g, '') === '') {
    return '';
  }

  return minifyDecimal(decimalString)
    .split(/\s+/)
    .map(function (numString) {
      return intToBinary(parseInt(numString, 10), byteSize);
    })
    .join('');
};

/**
 * Converts binary to a string of decimal numbers separated by whitespace.
 * @param {string} binaryString
 * @param {number} byteSize - How many bits to read for each number
 * @returns {string} decimal numbers
 */
export const binaryToDecimal = function (binaryString, byteSize) {
  var currentByte;
  var numbers = [];
  var binary = minifyBinary(binaryString);
  for (var i = 0; i < binary.length; i += byteSize) {
    currentByte = zeroPadRight(binary.substr(i, byteSize), byteSize);
    numbers.push(binaryToInt(currentByte));
  }
  return numbers.join(' ');
};

/**
 * Converts ascii to binary, using the given bytesize for each character.
 * Overflow is ignored (left-trimmed); recommend using a bytesize of 8 in
 * most circumstances.
 * @param {string} asciiString
 * @param {number} byteSize
 * @returns {string}
 */
export const asciiToBinary = function (asciiString, byteSize) {
  var bytes = [];
  for (var i = 0; i < asciiString.length; i++) {
    bytes.push(intToBinary(asciiString.charCodeAt(i), byteSize));
  }
  return bytes.join('');
};

/**
 * Converts binary to an ascii string, using the given bytesize for each
 * character.  If the binary is not divisible by bytesize, the final character
 * is right-padded.
 * @param {string} binaryString
 * @param {number} byteSize
 * @returns {string} ASCII string
 */
export const binaryToAscii = function (binaryString, byteSize) {
  if (byteSize <= 0) {
    throw new RangeError('Parameter byteSize must be greater than zero');
  }

  var currentByte;
  var chars = [];
  var binary = minifyBinary(binaryString);
  for (var i = 0; i < binary.length; i += byteSize) {
    currentByte = zeroPadRight(binary.substr(i, byteSize), byteSize);
    chars.push(String.fromCharCode(binaryToInt(currentByte)));
  }
  return chars.join('');
};

/**
 * @typedef {Object} Base64Payload
 * @property {string} string - the base64-encoded payload
 * @property {number} len - the length of the original binary payload
 */

/**
 * Converts binary to a base64 string for more efficient network
 * transfer. Because base64 expects even bytes, we pad the binary string
 * to the nearest byte and return the original length. The reverse
 * conversion expects to be given that original length.
 * @param {string} binaryString
 * @returns {Base64Payload} Object containing the base64 string and the
 *          length of of the original binaryString
 * @throws {TypeError} if binaryString argument is not a
 *         properly-formatted string of zeroes and ones.
 * @example
 * // returns { string: "kg==", len: 7 }
 * DataConverters.binaryToBase64("1001001");
 */
export const binaryToBase64 = function (binaryString) {
  if (/^[01]*$/.test(binaryString) === false) {
    throw new TypeError(
      'argument binaryString to method binaryToBase64' +
        'must be a binary string; received "' +
        binaryString +
        '" instead'
    );
  }

  var byteLen = Math.ceil(binaryString.length / 8.0) * 8;
  var paddedBinaryString = zeroPadRight(binaryString, byteLen);
  var payload = window.btoa(binaryToAscii(paddedBinaryString, 8));

  return {string: payload, len: binaryString.length};
};

/**
 * Converts a base64 string back into a binary string of the specified
 * length.
 * @param {string} base64string
 * @param {number} len
 * @returns {string} binaryString
 * @throws {TypeError} if base64string argument is not a
 *         properly base64-encoded string
 * @example
 * // returns "1001001"
 * DataConverters.base64ToBinary("kg==", 7);
 */
export const base64ToBinary = function (base64string, len) {
  var decodedData;
  try {
    decodedData = window.atob(base64string);
  } catch (e) {
    throw new TypeError(
      'argument base64string to method base64ToBinary' +
        'must be a base64-encoded string'
    );
  }
  return asciiToBinary(decodedData, 8).substr(0, len);
};

/**
 * Converts binary to an address string using the provided address format.
 * @param {string} binaryString
 * @param {AddressHeaderFormat} addressFormat
 * @returns {string}
 */
export const binaryToAddressString = function (binaryString, addressFormat) {
  var binary = minifyBinary(binaryString);
  if (binary.length === 0) {
    return '';
  }

  var indexIntoBinary = 0;

  // Parentheses in the split() regex cause the dividing elements to be captured
  // and also included in the return value.
  return addressFormat
    .split(/(\D+)/)
    .map(function (formatPart) {
      var bitWidth = parseInt(formatPart, 10);
      if (isNaN(bitWidth)) {
        // Pass non-number parts of the format through, so we use the original
        // entered characters/layout for formatting.
        return formatPart;
      }

      var binarySlice = binary.substr(indexIntoBinary, bitWidth);
      var intVal = binarySlice.length > 0 ? binaryToInt(binarySlice) : 0;
      indexIntoBinary += bitWidth;
      return intVal.toString();
    })
    .join('');
};

/**
 * Converts a formatted address string (decimal numbers with separators) into
 * binary with bit-widths for each part matching the given format.
 * @param {string} addressString
 * @param {AddressHeaderFormat} addressFormat
 * @returns {string}
 */
export const addressStringToBinary = function (addressString, addressFormat) {
  if (addressString.length === 0) {
    return '';
  }

  // Actual user input, converted to a number[]
  var addressParts = addressString
    .toString()
    .split(/\D+/)
    .map(function (stringPart) {
      return parseInt(stringPart, 10);
    })
    .filter(function (numberPart) {
      return !isNaN(numberPart);
    });

  // Format, converted to a number[] where the numbers are bit-widths
  var partWidths = addressFormat
    .split(/\D+/)
    .map(function (stringPart) {
      return parseInt(stringPart, 10);
    })
    .filter(function (numberPart) {
      return !isNaN(numberPart);
    });

  var partValue;
  var binary = '';
  for (var i = 0; i < partWidths.length; i++) {
    partValue = i < addressParts.length ? addressParts[i] : 0;
    binary = binary + intToBinary(partValue, partWidths[i]);
  }
  return binary;
};

/**
 * Convert a binary string to a formatted representation, with chunks that
 * correspond to the parts of the address header.
 * @param {string} binaryString
 * @param {AddressHeaderFormat} addressFormat
 */
export const formatBinaryForAddressHeader = function (
  binaryString,
  addressFormat
) {
  var binary = minifyBinary(binaryString);

  var partWidths = addressFormat
    .split(/\D+/)
    .map(function (stringPart) {
      return parseInt(stringPart, 10);
    })
    .filter(function (numberPart) {
      return !isNaN(numberPart);
    });

  var chunks = [];
  var index = 0;
  partWidths.forEach(function (bitWidth) {
    var next = binary.substr(index, bitWidth);
    if (next.length > 0) {
      chunks.push(next);
    }
    index += bitWidth;
  });

  var next = binary.substr(index);
  if (next.length > 0) {
    chunks.push(next);
  }

  return chunks.join(' ');
};
