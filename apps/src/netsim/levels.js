/*jshint multistr: true */

var netsimConstants = require('./netsimConstants');
var Packet = require('./Packet');
var BITS_PER_NIBBLE = netsimConstants.BITS_PER_NIBBLE;
var MessageGranularity = netsimConstants.MessageGranularity;
var DnsMode = netsimConstants.DnsMode;
var EncodingType = netsimConstants.EncodingType;
var NetSimTabType = netsimConstants.NetSimTabType;

/**
 * A level configuration that can be used by NetSim
 * @typedef {Object} netsimLevelConfiguration
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
 * @property {packetHeaderSpec} routerExpectsPacketHeader - The header format
 *           the router uses to parse incoming packets and figure out where
 *           to route them.
 *
 * @property {packetHeaderSpec} clientInitialPacketHeader - The header format
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
 * @property {boolean} showMetronome - Whether the metronome (and its related
 *           speed control) should show up on the "My Device" tab.
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
 * @type {netsimLevelConfiguration}
 */
levels.custom = {

  // Lobby configuration
  showClientsInLobby: false,
  showRoutersInLobby: false,
  canConnectToClients: false,
  canConnectToRouters: false,
  showAddRouterButton: false,

  // Simulator-wide setup
  messageGranularity: MessageGranularity.BITS,
  automaticReceive: false,

  // Packet header specification
  routerExpectsPacketHeader: [],
  clientInitialPacketHeader: [],

  // Visualization configuration
  showHostnameInGraph: true,

  // Send widget configuration
  showAddPacketButton: false,
  showPacketSizeControl: false,
  defaultPacketSizeLimit: Infinity,

  // Tab-panel control
  showTabs: [],
  defaultTabIndex: 0,

  // Instructions tab and its controls
  // Note: Uses the blockly-standard level.instructions value, which should
  //       be localized by the time it gets here.

  // "My Device" tab and its controls
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

  // DNS tab and its controls
  showDnsModeControl: false,
  defaultDnsMode: DnsMode.NONE
};
