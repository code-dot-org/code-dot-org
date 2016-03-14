/**
 * @overview Utility class for encoding and decoding simulated packets.
 */
'use strict';

var NetSimUtils = require('./NetSimUtils');
var DataConverters = require('./DataConverters');
var NetSimGlobals = require('./NetSimGlobals');

/**
 * Wraps binary packet content with the format information required to
 * interpret it.
 * @param {Packet.HeaderType[]} formatSpec
 * @param {string} binary
 * @constructor
 */
var Packet = module.exports = function (formatSpec, binary) {
  var level = NetSimGlobals.getLevelConfig();

  /** @type {Packet.Encoder} */
  this.encoder = new Packet.Encoder(level.addressFormat,
      level.packetCountBitWidth, formatSpec);

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
 * Whether the given header field type will use the address format.
 * @param {Packet.HeaderType} headerType
 * @returns {boolean}
 */
Packet.isAddressField = function (headerType) {
  return headerType === Packet.HeaderType.TO_ADDRESS ||
      headerType === Packet.HeaderType.FROM_ADDRESS;
};

/**
 * Whether the given header field will use the packetCount bit width.
 * @param {Packet.HeaderType} headerType
 * @returns {boolean}
 */
Packet.isPacketField = function (headerType) {
  return headerType === Packet.HeaderType.PACKET_INDEX ||
      headerType === Packet.HeaderType.PACKET_COUNT;
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
 * @param {Packet.HeaderType} headerType
 * @returns {string}
 */
Packet.prototype.getHeaderAsAddressString = function (headerType) {
  return this.encoder.getHeaderAsAddressString(headerType, this.binary);
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
 * Given a particular packet format, can convert a set of fields down
 * into a binary string matching the specification, or extract fields
 * on demand from a binary string.
 * @param {AddressHeaderFormat} addressFormat
 * @param {number} packetCountBitWidth
 * @param {Packet.HeaderType[]} headerSpec - Specification of packet format, an
 *        ordered set of objects in the form {key:string, bits:number} where
 *        key is the field name you'll use to retrieve the information, and
 *        bits is the length of the field.
 * @constructor
 */
Packet.Encoder = function (addressFormat, packetCountBitWidth, headerSpec) {
  /** @type {string} */
  this.addressFormat_ = addressFormat;

  this.addressBitWidth_ = this.calculateBitWidth(this.addressFormat_);

  /** @type {number} */
  this.packetCountBitWidth_ = packetCountBitWidth;

  /** @type {Packet.HeaderType[]} */
  this.headerSpec_ = headerSpec;

  this.validateSpec();
};

/**
 * @param {AddressHeaderFormat} addressFormat
 * @private
 */
Packet.Encoder.prototype.calculateBitWidth = function (addressFormat) {
  return addressFormat.split(/\D+/).reduce(function (prev, cur) {
    return prev + (parseInt(cur, 10) || 0);
  }, 0);
};

/**
 * Verify that the configured format specification describes a valid format that
 * can be used by the Packet.Encoder object.
 */
Packet.Encoder.prototype.validateSpec = function () {
  var keyCache = {};

  for (var i = 0; i < this.headerSpec_.length; i++) {
    var isAddressField = Packet.isAddressField(this.headerSpec_[i]);
    var isPacketField = Packet.isPacketField(this.headerSpec_[i]);

    if (isAddressField && this.addressBitWidth_ === 0) {
      throw new Error("Invalid packet format: Includes an address field but " +
        " address format is invalid.");
    }

    if (isPacketField && this.packetCountBitWidth_ === 0) {
      throw new Error("Invalid packet format: Includes a packet count field " +
          " but packet field bit width is zero");
    }

    if (!isAddressField && !isPacketField) {
      throw new Error("Invalid packet format: Unrecognized packet header field " +
          this.headerSpec_[i]);
    }

    if (keyCache.hasOwnProperty(this.headerSpec_[i])) {
      throw new Error("Invalid packet format: Field keys must be unique.");
    } else {
      keyCache[this.headerSpec_[i]] = 'used';
    }
  }
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
  binary = DataConverters.minifyBinary(binary);

  while (this.headerSpec_[ruleIndex] !== key) {
    binaryIndex += this.getFieldBitWidth(this.headerSpec_[ruleIndex]);
    ruleIndex++;

    if (ruleIndex >= this.headerSpec_.length) {
      // Didn't find key
      throw new Error('Key "' + key + '" not found in packet spec.');
    }
  }

  // Read value
  var bitWidth = this.getFieldBitWidth(this.headerSpec_[ruleIndex]);
  var bits = binary.slice(binaryIndex, binaryIndex + bitWidth);

  // Right-pad with zeroes to desired size
  if (bitWidth !== Infinity) {
    while (bits.length < bitWidth) {
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
  return DataConverters.binaryToInt(this.getHeader(key, binary));
};

/**
 * Retrieve an address header as a string, so we can give the multi-part
 * representation.
 * @param {Packet.HeaderType} key
 * @param {string} binary for whole packet
 * @returns {string}
 */
Packet.Encoder.prototype.getHeaderAsAddressString = function (key, binary) {
  return DataConverters.binaryToAddressString(
      this.getHeader(key, binary), this.addressFormat_);
};

/**
 * Skip over headers given in spec and return remainder of binary which
 * must be the message body.
 * @param {string} binary - entire packet as a binary string
 * @returns {string} packet body binary string
 */
Packet.Encoder.prototype.getBody = function (binary) {
  return DataConverters.minifyBinary(binary)
      .slice(this.getHeaderLength());
};

/**
 * @returns {number} How many bits the header takes up
 */
Packet.Encoder.prototype.getHeaderLength = function () {
  return this.headerSpec_.reduce(function (prev, cur) {
    return prev + this.getFieldBitWidth(cur);
  }.bind(this), 0);
};

/**
 * Skip over headers given in spec, and return remainder of packet interpreted
 * to ascii with the given character width.
 * @param {string} binary - entire packet as a binary string
 * @param {number} bitsPerChar - bits to represent as a single character,
 *        recommended to use 8 for normal ASCII.
 */
Packet.Encoder.prototype.getBodyAsAscii = function (binary, bitsPerChar) {
  return DataConverters.binaryToAscii(this.getBody(binary), bitsPerChar);
};

/**
 * @param {Packet.HeaderType} headerType
 * @returns {number} how many bits that field should take in the packet header
 */
Packet.Encoder.prototype.getFieldBitWidth = function (headerType) {
  if (Packet.isAddressField(headerType)) {
    return this.addressBitWidth_;
  }

  if (Packet.isPacketField(headerType)) {
    return this.packetCountBitWidth_;
  }

  // Should never get here.
  throw new Error("Unable to select a bit-width for field " + headerType);
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
  this.headerSpec_.forEach(function (headerField){
    if (headers.hasOwnProperty(headerField)) {
      // Convert differently for address and packet fields?
      if (Packet.isAddressField(headerField)) {
        binaryHeaders[headerField] = this.addressStringToBinary(headers[headerField]);
      } else {
        binaryHeaders[headerField] = DataConverters.intToBinary(
            headers[headerField], this.getFieldBitWidth(headerField));
      }
    }
  }, this);
  return binaryHeaders;
};

/**
 * Convert an address string (possibly multi-part) into binary based on the
 * configured address format.
 * @param {string} address
 * @returns {string} binary representation
 */
Packet.Encoder.prototype.addressStringToBinary = function (address) {
  return DataConverters.addressStringToBinary(address, this.addressFormat_);
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

  this.headerSpec_.forEach(function (fieldSpec) {
    var fieldWidth = this.getFieldBitWidth(fieldSpec);

    // Get header value from provided headers, if it exists.
    // If not, we'll start with an empty string and pad it to the correct
    // length, below.
    var fieldBits = binaryHeaders.hasOwnProperty(fieldSpec) ?
        binaryHeaders[fieldSpec] : '';

    // Right-truncate to the desired size
    fieldBits = fieldBits.slice(0, fieldWidth);

    // Left-pad to desired size
    fieldBits = NetSimUtils.zeroPadLeft(fieldBits, fieldWidth);

    parts.push(fieldBits);
  }, this);

  parts.push(body);

  return parts.join('');
};
