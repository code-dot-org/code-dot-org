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

var netsimUtils = require('./netsimUtils');
var dataConverters = require('./dataConverters');

/**
 * Single packet header field type
 * @typedef {Object} packetHeaderField
 * @property {Packet.HeaderType} key - Used to identify the field, for parsing.
 * @property {number} bits - How long (in bits) the field is.
 */

/**
 * Packet header specification type
 * Note: Always assumes variable-length body following the header.
 * @typedef {packetHeaderField[]} packetHeaderSpec
 */

/**
 * Wraps binary packet content with the format information required to
 * interpret it.
 * @param {packetHeaderSpec} formatSpec
 * @param {string} binary
 * @constructor
 */
var Packet = module.exports = function (formatSpec, binary) {
  validateSpec(formatSpec);

  /** @type {Packet.Encoder} */
  this.encoder = new Packet.Encoder(formatSpec);

  /** @type {string} of binary content */
  this.binary = binary;
};

/**
 * Possible packet header fields.  Values to this enum become keys
 * that can be used when defining a level configuration.  They also correspond
 * to class names that get applied to fields representing data in that column.
 * @enum {string}
 * @readonly
 */
Packet.HeaderType = {
  TO_ADDRESS: 'toAddress',
  FROM_ADDRESS: 'fromAddress',
  PACKET_INDEX: 'packetIndex',
  PACKET_COUNT: 'packetCount'
};

/**
 * @param {Packet.HeaderType} headerType
 * @returns {string} of binary content
 */
Packet.prototype.getHeaderAsBinary = function (headerType) {
  return this.encoder.getHeader(headerType, this.binary);
};

/**
 * @param {Packet.HeaderType} headerType
 * @returns {number}
 */
Packet.prototype.getHeaderAsInt = function (headerType) {
  return this.encoder.getHeaderAsInt(headerType, this.binary);
};

/**
 * @returns {string} binary content
 */
Packet.prototype.getBodyAsBinary = function () {
  return this.encoder.getBody(this.binary);
};

/**
 * @param {number} bitsPerChar
 * @returns {string} ascii content
 */
Packet.prototype.getBodyAsAscii = function (bitsPerChar) {
  return this.encoder.getBodyAsAscii(this.binary, bitsPerChar);
};

/**
 * Verify that a given format specification describes a valid format that
 * can be used by the Packet.Encoder object.
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

    if (formatSpec[i].bits === Infinity) {
      throw new Error("Invalid packet format: Infinity field length not allowed.");
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
Packet.Encoder = function (formatSpec) {
  validateSpec(formatSpec);

  /** @type {packetHeaderSpec} */
  this.formatSpec_ = formatSpec;
};

/**
 * Retrieve requested header field by key from the provided binary blob.
 *
 * @param {Packet.HeaderType} key - which header to retrieve
 * @param {string} binary for entire packet
 * @returns {string} binary string value for header field
 * @throws when requested key is not in the configured packet spec
 */
Packet.Encoder.prototype.getHeader = function (key, binary) {
  var ruleIndex = 0, binaryIndex = 0;

  // Strip whitespace so we don't worry about being passed formatted binary
  binary = dataConverters.minifyBinary(binary);

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
 * @param {Packet.HeaderType} key - field name
 * @param {string} binary - entire packet as a binary string
 * @returns {number} - requested field, interpreted as an int.
 */
Packet.Encoder.prototype.getHeaderAsInt = function (key, binary) {
  return dataConverters.binaryToInt(this.getHeader(key, binary));
};

/**
 * Skip over headers given in spec and return remainder of binary which
 * must be the message body.
 * @param {string} binary - entire packet as a binary string
 * @returns {string} packet body binary string
 */
Packet.Encoder.prototype.getBody = function (binary) {
  return dataConverters.minifyBinary(binary)
      .slice(Packet.Encoder.getHeaderLength(this.formatSpec_));
};

/**
 * @param {packetHeaderSpec} formatSpec
 * @returns {number} How many bits the header takes up
 */
Packet.Encoder.getHeaderLength = function (formatSpec) {
  return formatSpec.reduce(function (prev, cur) {
    return prev + cur.bits;
  }, 0);
};

/**
 * Skip over headers given in spec, and return remainder of packet interpreted
 * to ascii with the given character width.
 * @param {string} binary - entire packet as a binary string
 * @param {number} bitsPerChar - bits to represent as a single character,
 *        recommended to use 8 for normal ASCII.
 */
Packet.Encoder.prototype.getBodyAsAscii = function (binary, bitsPerChar) {
  return dataConverters.binaryToAscii(this.getBody(binary), bitsPerChar);
};

/**
 * Given a "headers" object where the values are numbers, returns a corresponding
 * "headers" object where the values have all been converted to binary
 * representations at the appropriate width.  Only header fields that appear in
 * the configured packet header format will be converted and passed through to
 * output.
 * @param {Object} headers - with number values
 */
Packet.Encoder.prototype.makeBinaryHeaders = function (headers) {
  var binaryHeaders = {};
  this.formatSpec_.forEach(function (headerField){
    if (headers.hasOwnProperty(headerField.key)) {
      binaryHeaders[headerField.key] = dataConverters.intToBinary(
          headers[headerField.key], headerField.bits);
    }
  });
  return binaryHeaders;
};

/**
 * Takes a set of binary headers and a binary body, and generates a complete
 * packet binary matching the configured packet spec in terms of header width
 * and ordering.
 *
 * @param {Object} binaryHeaders - hash containing packet headers in binary, where
 *        the hash keys correspond to the "key" values in the packet spec, and
 *        the hash values are binary strings.
 * @param {string} body - binary string of the unlimited-length body of the
 *        packet, which will be placed after the packet headers.
 *
 * @returns {string} binary string of provided data, conforming to configured
 *          packet format.
 */
Packet.Encoder.prototype.concatenateBinary = function (binaryHeaders, body) {
  var parts = [];

  this.formatSpec_.forEach(function (fieldSpec) {
    // Get header value from provided headers, if it exists.
    // If not, we'll start with an empty string and pad it to the correct
    // length, below.
    var fieldBits = binaryHeaders.hasOwnProperty(fieldSpec.key) ?
        binaryHeaders[fieldSpec.key] : '';

    // Right-truncate to the desired size
    fieldBits = fieldBits.slice(0, fieldSpec.bits);

    // Left-pad to desired size
    fieldBits = netsimUtils.zeroPadLeft(fieldBits, fieldSpec.bits);

    parts.push(fieldBits);
  });

  parts.push(body);

  return parts.join('');
};
