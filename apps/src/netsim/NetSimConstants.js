/**
 * @overview Constants and enums used across Internet Simulator.
 */
/* global exports */
'use strict';

/**
 * @type {number}
 * @const
 */
exports.BITS_PER_NIBBLE = 4;

/**
 * @type {number}
 * @const
 */
exports.BITS_PER_BYTE = 8;

/**
 * @type {number}
 * @const
 */
exports.BITS_PER_KILOBYTE = 1024 * exports.BITS_PER_BYTE;

/**
 * @type {number}
 * @const
 */
exports.BITS_PER_MEGABYTE = 1024 * exports.BITS_PER_KILOBYTE;

/**
 * @type {number}
 * @const
 */
exports.BITS_PER_GIGABYTE = 1024 * exports.BITS_PER_MEGABYTE;

/**
 * @type {number}
 * @const
 */
exports.BITS_PER_KILOBIT = 1024;

/**
 * @type {number}
 * @const
 */
exports.BITS_PER_MEGABIT = 1024 * exports.BITS_PER_KILOBIT;

/**
 * @type {number}
 * @const
 */
exports.BITS_PER_GIGABIT = 1024 * exports.BITS_PER_MEGABIT;

/**
 * Types of nodes that can show up in the simulation.
 * @enum {string}
 */
exports.NodeType = {
  CLIENT: 'client',
  ROUTER: 'router'
};

/**
 * What type of message makes up the 'atom' of communication for this
 * simulator mode - single-bit messages (variant 1) or whole packets (variants
 * 2 and up)
 * @enum {string}
 */
exports.MessageGranularity = {
  PACKETS: 'packets',
  BITS: 'bits'
};

/**
 * DNS modes for the simulator.  Only applies in variant 3, when connecting
 * to a router.
 * @enum {string}
 */
exports.DnsMode = {
  /** There is no DNS node.  Everyone can see every other node's address. */
  NONE: 'none',

  /** One user acts as the DNS node at a time.  Everyone can see their own
   *  address and the DNS node's address, but nothing else. */
  MANUAL: 'manual',

  /** An automatic DNS node is added to the simulation.  Nodes are automatically
   *  registered with the DNS on connection. */
  AUTOMATIC: 'automatic'
};

/**
 * Encodings that can be used to interpret and display binary messages in
 * the simulator.
 * Map to class-names that can be applied to related table rows.
 * @enum {string}
 */
exports.EncodingType = {
  /** Renders each chunk of bits (using variable chunksize) in ascii */
  ASCII: 'ascii',

  /** Renders each chunk of bits (using variable chunksize) in decimal */
  DECIMAL: 'decimal',

  /** Renders each binary nibble as a hex character. */
  HEXADECIMAL: 'hexadecimal',

  /** All packet data is actually stored and moved around in binary, so
   *  the 'binary' encoding just represents access to that raw data. */
  BINARY: 'binary',

  /** An encoding used early in the lessons to show that binary isn't always
   *  1s and 0s.  Just like binary, but replaces 1/0 with A/B. */
  A_AND_B: 'a_and_b'
};

/**
 * Enumeration of tabs for level configuration
 * @enum {string}
 */
exports.NetSimTabType = {
  INSTRUCTIONS: 'instructions',
  MY_DEVICE: 'my_device',
  ROUTER: 'router',
  DNS: 'dns'
};

/**
 * Column types that can be used any time a packet is displayed on the page.
 * Related to Packet.HeaderType, but different because this includes columns
 * that aren't part of the header, and groups the packetInfo together.
 * Map to class-names that can be applied to related table cells.
 * @enum {string}
 */
exports.PacketUIColumnType = {
  ENCODING_LABEL: 'encodingLabel',
  TO_ADDRESS: 'toAddress',
  FROM_ADDRESS: 'fromAddress',
  PACKET_INFO: 'packetInfo',
  MESSAGE: 'message'
};
