/*jshint multistr: true */

var msg = require('../../locale/current/netsim');
var utils = require('../utils');
var netsimConstants = require('./netsimConstants');
var DnsMode = netsimConstants.DnsMode;
var EncodingType = netsimConstants.EncodingType;
var NetSimTabType = netsimConstants.NetSimTabType;

/**
 * A level configuration that can be used by NetSim
 * @typedef {Object} NetSimLevelConfiguration
 *
 * @property {boolean} showClientsInLobby
 *
 * @property {boolean} showRoutersInLobby
 *
 * @property {boolean} showAddRouterButton
 *
 * @property {NetSimTabType[]} showTabs
 *
 * @property {number} defaultTabIndex - The zero-based index of the tab
 *           that should be active by default, which depends on which tabs
 *           you have enabled.
 *
 * @property {EncodingType[]} showEncodingControls
 *
 * @property {EncodingType[]} defaultEnabledEncodings
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
levels.default = {

  // Lobby configuration
  showClientsInLobby: true,
  showRoutersInLobby: true,
  showAddRouterButton: true,

  // Tab-panel control
  showTabs: [
    NetSimTabType.INSTRUCTIONS,
    NetSimTabType.MY_DEVICE,
    NetSimTabType.ROUTER,
    NetSimTabType.DNS
  ],
  defaultTabIndex: 0,

  // Instructions tab and its controls
  // Nothing here yet!

  // "My Device" tab and its controls
  showEncodingControls: [
    EncodingType.BINARY,
    EncodingType.A_AND_B,
    EncodingType.HEXADECIMAL,
    EncodingType.DECIMAL,
    EncodingType.ASCII
  ],
  defaultEnabledEncodings: [
    EncodingType.ASCII,
    EncodingType.BINARY
  ],

  // Router tab and its controls
  // Nothing here yet!

  // DNS tab and its controls
  showDnsModeControl: true,
  defaultDnsMode: DnsMode.NONE
};

/**
 * Variant 1 base level
 * Sends individual bits at a time.
 * @type {NetSimLevelConfiguration}
 */
levels.variant1 = utils.extend(levels.default, {
  showAddRouterButton: false,

  showTabs: [NetSimTabType.INSTRUCTIONS],

  defaultEnabledEncodings: [EncodingType.A_AND_B]
});

/**
 * Variant 2 base level
 * Sends messages as packets, all at once.
 * @type {NetSimLevelConfiguration}
 */
levels.variant2 = utils.extend(levels.default, {
  showAddRouterButton: false,
  showTabs: [NetSimTabType.INSTRUCTIONS, NetSimTabType.MY_DEVICE],
  showEncodingControls: [EncodingType.ASCII],
  defaultEnabledEncodings: [EncodingType.BINARY, EncodingType.ASCII]
});

/**
 * Variant 3 base level
 * Enables routers.
 * @type {NetSimLevelConfiguration}
 */
levels.variant3 = utils.extend(levels.default, {
  showClientsInLobby: false,
  showAddRouterButton: true,

  showTabs: [
    NetSimTabType.INSTRUCTIONS,
    NetSimTabType.MY_DEVICE,
    NetSimTabType.ROUTER,
    NetSimTabType.DNS
  ],

  showEncodingControls: [EncodingType.ASCII],
  defaultEnabledEncodings: [EncodingType.BINARY, EncodingType.ASCII],

  showDnsModeControl: false,
  defaultDnsMode: DnsMode.AUTOMATIC
});
