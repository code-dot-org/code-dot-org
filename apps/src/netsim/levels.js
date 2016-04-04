/**
 * @overview Type documentation for a NetSim level configuration object,
 *           and default values for that object.
 */

var NetSimConstants = require('./NetSimConstants');
var Packet = require('./Packet');
var BITS_PER_NIBBLE = NetSimConstants.BITS_PER_NIBBLE;
var MessageGranularity = NetSimConstants.MessageGranularity;
var DnsMode = NetSimConstants.DnsMode;
var EncodingType = NetSimConstants.EncodingType;
var NetSimTabType = NetSimConstants.NetSimTabType;

/**
 * A level configuration that can be used by NetSim
 * @typedef {Object} NetSimLevelConfiguration
 *
 * @property {string} instructions - Inherited from blockly level configuration.
 *
 * @property {boolean} showClientsInLobby - Whether client nodes should appear
 *           in the lobby list at all.
 *
 * @property {boolean} showRoutersInLobby - Whether router nodes should appear
 *           in the lobby list at all.
 *
 * @property {boolean} canConnectToClients - Whether client nodes are selectable
 *           and can be connected to
 *
 * @property {boolean} canConnectToRouters - Whether router nodes are selectable
 *           and can be connected to
 *
 * @property {boolean} showAddRouterButton - Whether the "Add Router" button
 *           should appear above the lobby list.
 *
 * @property {boolean} showLogBrowserButton - Whether the "Log Browser" is
 *           available in the lobby.
 *
 * @property {MessageGranularity} messageGranularity - Whether the simulator
 *           puts a single bit into storage at a time, or a whole packet.
 *           Should use 'bits' for variant 1 (levels about the coordination
 *           problem), and 'packets' for levels where the coordination problem
 *           is abstracted away.
 *
 * @property {boolean} automaticReceive - Whether the local node will
 *           automatically pick up messages to itself from the message table,
 *           and dump them to the received message log.  If false, some other
 *           method must be used for receiving messages.
 *
 * @property {boolean} broadcastMode - Enabling this option turns "routers"
 *           into "rooms" and makes it so every message sent in the room
 *           will be received by every other person in that room.
 *
 * @property {boolean} connectedRouters - When false (default), each router or
 *           room exists in isolation and will have no contact with other routers
 *           or rooms.  When true, it is possible for messages to travel between
 *           routers, connecting the whole shard.
 *
 * @property {number} minimumExtraHops - Fewest non-destination routers an
 *           inter-router message should try to visit before going to its
 *           destination router.  Number of hops can be lower if network
 *           conditions don't allow it.
 *
 * @property {number} maximumExtraHops - Most non-destination routers an
 *           inter-router message should try to visit before going to its
 *           destination router.
 *
 * @property {AddressHeaderFormat} addressFormat - Specify how many bits wide
 *           an address is within the simulation and how it should be divided
 *           up into a hierarchy. Format resembles IPv4 dot-decimal notation,
 *           but the numbers specify the number of bits for each section.
 *           Examples:
 *           "8.8" - 16-bit address, represented as two 8-bit integers.
 *           "4" - 4 bit address represented as one 4-bit integer.
 *           "8.4" - 12-bit address, represented as an 8-bit integer followed
 *                   by a 4-bit integer
 *            This format will be applied to any "fromAddress" or "toAddress"
 *            header fields in the packet specification, and will determine
 *            how routers assign addresses.
 *
 * @property {number} packetCountBitWidth - How many bits should be allocated
 *           for any "packetIndex" or "packetCount" fields in the packet
 *           specification.
 *
 * @property {Packet.HeaderType[]} routerExpectsPacketHeader - The header format
 *           the router uses to parse incoming packets and figure out where
 *           to route them.
 *
 * @property {Packet.HeaderType[]} clientInitialPacketHeader - The header format
 *           used by the local client node when generating/parsing packets,
 *           which affects the layout of the send panel and log panels.
 *
 * @property {boolean} showHostnameInGraph - If false, student display name
 *           is used in the network graph.  If true, their generated hostname
 *           is displayed.
 *
 * @property {boolean} showAddPacketButton - Whether the "Add Packet" button
 *           should appear in the send widget.
 *
 * @property {boolean} showPacketSizeControl - Whether the packet size slider
 *           should appear in the send widget.
 *
 * @property {number} defaultPacketSizeLimit - Initial maximum packet size.
 *
 * @property {NetSimTabType[]} showTabs - Which tabs should appear beneath the
 *           network visualization.  Does not determine tab order; tabs always
 *           appear in the order "Instructions, My Device, Router, DNS."
 *
 * @property {number} defaultTabIndex - The zero-based index of the tab
 *           that should be active by default, which depends on which tabs
 *           you have enabled.
 *
 * @property {boolean} showPulseRateSlider - Whether the pulse rate slider
 *           is visible on the "My Device" tab.  This control is a different
 *           view on the bitrate, given in seconds-per-pulse; in fact, if both
 *           this and the bitrate slider are visible, dragging one will change
 *           the other.
 *
 * @property {boolean} showMetronome - Whether the metronome should show up on
 *           the "My Device" tab.
 *
 * @property {EncodingType[]} showEncodingControls - Which encodings, (ASCII,
 *           binary, etc.) should have visible controls on the "My Device" tab.
 *
 * @property {EncodingType[]} defaultEnabledEncodings - Which encodings should
 *           be enabled on page load.  Note: An encoding enabled here but not
 *           included in the visible controls will be enabled and cannot be
 *           disabled by the student.
 *
 * @property {boolean} showBitRateControl - Whether the bit rate slider should
 *           be displayed on the "My Device" tab.
 *
 * @property {boolean} lockBitRateControl - Whether the bit rate slider should
 *           be adjustable by the student.
 *
 * @property {number} defaultBitRateBitsPerSecond - Default bit rate on level
 *           load.  Also sets the pulse rate for levels with the metronome.
 *
 * @property {boolean} showChunkSizeControl - Whether the chunk size slider
 *           should be displayed on the "My Device" tab.
 *
 * @property {boolean} lockChunkSizeControl - Whether the chunk size slider
 *           should be adjustable by the student.
 *
 * @property {number} defaultChunkSizeBits- Default chunk size on level load.
 *
 * @property {boolean} showRouterBandwidthControl - Whether students should be
 *           able to see and manipulate the slider that adjusts the router's
 *           max throughput speed.
 *
 * @property {number} defaultRouterBandwidth - How fast the router should be
 *           able to process packets, on initial level load.
 *
 * @property {boolean} showRouterMemoryControl - Whether students should be
 *           able to see and manipulate the slider that adjusts the router's
 *           maximum queue memory.
 *
 * @property {number} defaultRouterMemory - How much data the router packet
 *           queue is able to hold before it starts dropping packets, in bits.
 *
 * @property {number} defaultRandomDropChance - Odds that the router will drop
 *           the packet for no reason while routing it.  Value in range
 *           0 (no drops) to 1 (drop everything)
 *
 * @property {boolean} showDnsModeControl - Whether the DNS mode controls will
 *           be available to the student.
 *
 * @property {DnsMode} defaultDnsMode - Which DNS mode the simulator should
 *           initialize into.
 */

/*
 * Configuration for all levels.
 */
var levels = module.exports = {};

/**
 * A default level configuration so that we can define the others by delta.
 * This default configuration enables everything possible, so other configs
 * should start with this one and disable features.
 * @type {NetSimLevelConfiguration}
 */
levels.custom = {

  // Lobby configuration
  showClientsInLobby: false,
  showRoutersInLobby: false,
  canConnectToClients: false,
  canConnectToRouters: false,
  showAddRouterButton: false,
  showLogBrowserButton: false,

  // Simulator-wide setup
  messageGranularity: MessageGranularity.BITS,
  automaticReceive: false,
  broadcastMode: false,
  connectedRouters: false,
  minimumExtraHops: 0,
  maximumExtraHops: 0,

  // Packet header specification
  addressFormat: '4',
  packetCountBitWidth: 4,
  routerExpectsPacketHeader: [],
  clientInitialPacketHeader: [],

  // Visualization configuration
  showHostnameInGraph: false,

  // Send widget configuration
  showAddPacketButton: false,
  showPacketSizeControl: false,
  defaultPacketSizeLimit: 8192,

  // Tab-panel control
  showTabs: [],
  defaultTabIndex: 0,

  // Instructions tab and its controls
  // Note: Uses the blockly-standard level.instructions value, which should
  //       be localized by the time it gets here.

  // "My Device" tab and its controls
  showPulseRateSlider: false,
  showMetronome: false,
  showEncodingControls: [],
  defaultEnabledEncodings: [],
  showBitRateControl: false,
  lockBitRateControl: false,
  defaultBitRateBitsPerSecond: Infinity,
  showChunkSizeControl: false,
  lockChunkSizeControl: false,
  defaultChunkSizeBits: 8,

  // Router tab and its controls
  showRouterBandwidthControl: false,
  defaultRouterBandwidth: Infinity,
  showRouterMemoryControl: false,
  defaultRouterMemory: Infinity,
  defaultRandomDropChance: 0,

  // DNS tab and its controls
  showDnsModeControl: false,
  defaultDnsMode: DnsMode.NONE
};

/**
 * Special level configuration for use with 'grunt dev' standalone mode.
 * Never used when serving NetSim levels through dashboard.
 * @type {NetSimLevelConfiguration}
 */
levels.playground = {

  // Lobby configuration
  showClientsInLobby: false,
  showRoutersInLobby: true,
  canConnectToClients: false,
  canConnectToRouters: true,
  showAddRouterButton: true,
  showLogBrowserButton: true,

  // Simulator-wide setup
  messageGranularity: MessageGranularity.PACKETS,
  automaticReceive: true,
  broadcastMode: false,
  connectedRouters: false,
  minimumExtraHops: 0,
  maximumExtraHops: 0,

  // Packet header specification
  addressFormat: '4',
  packetCountBitWidth: 4,
  routerExpectsPacketHeader: ['toAddress', 'fromAddress'],
  clientInitialPacketHeader: ['toAddress', 'fromAddress'],

  // Visualization configuration
  showHostnameInGraph: false,

  // Send widget configuration
  showAddPacketButton: false,
  showPacketSizeControl: false,
  defaultPacketSizeLimit: 8192,

  // Tab-panel control
  showTabs: ['instructions', 'my_device', 'router', 'dns'],
  defaultTabIndex: 0,

  // Instructions tab and its controls
  // Note: Uses the blockly-standard level.instructions value, which should
  //       be localized by the time it gets here.

  // "My Device" tab and its controls
  showPulseRateSlider: false,
  showMetronome: false,
  showEncodingControls: ['a_and_b', 'binary', 'hexadecimal', 'decimal', 'ascii'],
  defaultEnabledEncodings: ['a_and_b', 'binary', 'hexadecimal', 'decimal', 'ascii'],
  showBitRateControl: true,
  lockBitRateControl: false,
  defaultBitRateBitsPerSecond: Infinity,
  showChunkSizeControl: true,
  lockChunkSizeControl: false,
  defaultChunkSizeBits: 8,

  // Router tab and its controls
  showRouterBandwidthControl: true,
  defaultRouterBandwidth: Infinity,
  showRouterMemoryControl: true,
  defaultRouterMemory: Infinity,
  defaultRandomDropChance: 0,

  // DNS tab and its controls
  showDnsModeControl: true,
  defaultDnsMode: DnsMode.NONE
};
