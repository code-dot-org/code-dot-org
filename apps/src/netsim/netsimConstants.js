/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxstatements: 200
 */
/* global exports */
'use strict';

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
 * @enum {string}
 */
exports.EncodingType = {
  /** All packet data is actually stored and moved around in binary, so
   *  the 'binary' encoding just represents access to that raw data. */
  BINARY: 'binary',

  /** An encoding used early in the lessons to show that binary isn't always
   *  1s and 0s.  Just like binary, but replaces 1/0 with A/B. */
  A_AND_B: 'a_and_b',

  /** Renders each binary nibble as a hex character. */
  HEXADECIMAL: 'hexadecimal',

  /** Renders each chunk of bits (using variable chunksize) in decimal */
  DECIMAL: 'decimal',

  /** Renders each chunk of bits (using variable chunksize) in ascii */
  ASCII: 'ascii'
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
