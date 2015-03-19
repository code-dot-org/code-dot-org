/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxparams: 3,
 maxstatements: 200
 */
'use strict';

var minifyBinary = require('./dataConverters').minifyBinary;
var dataConverters = require('./dataConverters');

/**
 * Single packet header field type
 * @typedef {Object} packetHeaderField
 *
 * @property {string} key - Used to identify the field, for parsing.
 *
 * @property {number} bits - How long (in bits) the field is.
 */

/**
 * Packet header specification type
 * Note: Always assumes variable-length body following the header.
 * @typedef {packetHeaderField[]} packetHeaderSpec
 */

/**
 * Verify that a given format specification describes a valid format that
 * can be used by the PacketEncoder object.
 * @param {packetHeaderSpec} formatSpec
 */
var validateSpec = function (formatSpec) {
  var keyCache = {};

  for (var i = 0; i < formatSpec.length; i++) {

    if (!formatSpec[i].hasOwnProperty('key')) {
      throw new Error("Invalid packet format: Each field must have a key.");
    }

    if (!formatSpec[i].hasOwnProperty('bits')) {
      throw new Error("Invalid packet format: Each field must have a length.");
    }

    if (keyCache.hasOwnProperty(formatSpec[i].key)) {
      throw new Error("Invalid packet format: Field keys must be unique.");
    } else {
      keyCache[formatSpec[i].key] = 'used';
    }

    if (formatSpec[i].bits === Infinity && i+1 < formatSpec.length) {
      throw new Error("Invalid packet format: Infinity field length is only " +
      "allowed in the last field.");
    }
  }
};

/**
 * Given a particular packet format, can convert a set of fields down
 * into a binary string matching the specification, or extract fields
 * on demand from a binary string.
 * @param {packetHeaderSpec} formatSpec - Specification of packet format, an
 *        ordered set of objects in the form {key:string, bits:number} where
 *        key is the field name you'll use to retrieve the information, and
 *        bits is the length of the field.
 * @constructor
 */
var PacketEncoder = module.exports = function (formatSpec) {
  validateSpec(formatSpec);

  /**
   * @type {Array.<Object>}
   */
  this.formatSpec_ = formatSpec;
};

/**
 * @type {number}
 * @const
 */
var BITS_PER_PACKET_HEADER_FIELD = 4;

/**
 * Static, globally available packet encoder for final packet layout.
 * TODO (bbuchanan): Replace this with a changeable format we can pass around!
 * @type {PacketEncoder}
 */
PacketEncoder.defaultPacketEncoder = new PacketEncoder([
  { key: 'toAddress', bits: BITS_PER_PACKET_HEADER_FIELD },
  { key: 'fromAddress', bits: BITS_PER_PACKET_HEADER_FIELD },
  { key: 'packetIndex', bits: BITS_PER_PACKET_HEADER_FIELD },
  { key: 'packetCount', bits: BITS_PER_PACKET_HEADER_FIELD },
  { key: 'message', bits: Infinity }
]);

PacketEncoder.prototype.getField = function (key, binary) {
  var ruleIndex = 0, binaryIndex = 0;

  // Strip whitespace so we don't worry about being passed formatted binary
  binary = minifyBinary(binary);

  while (this.formatSpec_[ruleIndex].key !== key) {
    binaryIndex += this.formatSpec_[ruleIndex].bits;
    ruleIndex++;

    if (ruleIndex >= this.formatSpec_.length) {
      // Didn't find key
      throw new Error('Key "' + key + '" not found in packet spec.');
    }
  }

  // Read value
  var bits = binary.slice(binaryIndex, binaryIndex + this.formatSpec_[ruleIndex].bits);

  // Right-pad with zeroes to desired size
  if (this.formatSpec_[ruleIndex].bits !== Infinity) {
    while (bits.length < this.formatSpec_[ruleIndex].bits) {
      bits += '0';
    }
  }

  return bits;
};

/**
 * @param {string} key - field name
 * @param {string} binary - entire packet as a binary string
 * @returns {number} - requested field, interpreted as an int.
 */
PacketEncoder.prototype.getHeaderFieldAsInt = function (key, binary) {
  return dataConverters.binaryToInt(this.getField(key, binary));
};

/**
 * Skip over headers given in spec and return remainder of binary which
 * must be the message body.
 * @param {string} binary - entire packet as a binary string
 * @returns {string} packet body binary string
 */
PacketEncoder.prototype.getBody = function (binary) {
  var totalHeaderLength = this.formatSpec_.reduce(function (prev, cur) {
    return prev + cur.bits;
  }, 0);
  return minifyBinary(binary).slice(totalHeaderLength);
};

/**
 * Skip over headers given in spec, and return remainder of packet interpreted
 * to ascii with the given character width.
 * @param {string} binary - entire packet as a binary string
 * @param {number} bitsPerChar - bits to represent as a single character,
 *        recommended to use 8 for normal ASCII.
 */
PacketEncoder.prototype.getBodyAsAscii = function (binary, bitsPerChar) {
  return dataConverters.binaryToAscii(this.getBody(binary), bitsPerChar);
};

PacketEncoder.prototype.createBinary = function (data) {
  var result = '';

  // For each field
  for (var i = 0; i < this.formatSpec_.length; i++) {
    var fieldBits = '';

    // If the field exists in the data, grab it
    if (data.hasOwnProperty(this.formatSpec_[i].key)) {
      fieldBits = data[this.formatSpec_[i].key];
    }

    // Right-truncate to the desired size
    if (fieldBits.length > this.formatSpec_[i].bits) {
      fieldBits = fieldBits.slice(0, this.formatSpec_[i].bits);
    }

    // Left-pad data to desired size
    if (this.formatSpec_[i].bits !== Infinity) {
      while (fieldBits.length < this.formatSpec_[i].bits) {
        fieldBits = '0' + fieldBits;
      }
    }

    // Append field to result
    result += fieldBits;
  }
  return result;
};

/**
 * Takes a set of binary headers and a binary body, and generates a complete
 * packet binary matching the configured packet spec in terms of header width
 * and ordering.
 *
 * @param {Object} headers - hash containing packet headers in binary, where
 *        the hash keys correspond to the "key" values in the packet spec, and
 *        the hash values are binary strings.
 * @param {string} body - binary string of the unlimited-length body of the
 *        packet, which will be placed after the packet headers.
 *
 * @returns {string} binary string of provided data, conforming to configured
 *          packet format.
 */
PacketEncoder.prototype.concatenateBinary = function (headers, body) {
  var parts = [];

  this.formatSpec_.forEach(function (headerField) {
    // Get header value from provided headers, if it exists.
    // If not, we'll start with an empty string and pad it to the correct
    // length, below.
    var fieldBits = headers.hasOwnProperty(headerField.key) ?
        headers[headerField.key] : '';

    // Right-truncate to the desired size
    fieldBits = fieldBits.slice(0, headerField.bits);

    // Left-pad to desired size
    dataConverters.zeroPadLeft(fieldBits, headerField.bits);

    parts.push(fieldBits);
  });

  parts.push(body);

  return parts.join('');
};
