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
var defaultLevel = {

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
 * Just uses the default level configuration.
 * @type {NetSimLevelConfiguration}
 */
levels.netsim_demo = defaultLevel;

/**
 * Variant 1 base level
 * @type {NetSimLevelConfiguration}
 */
levels.variant1 = utils.extend(defaultLevel, {
  showAddRouterButton: false,

  showTabs: [NetSimTabType.INSTRUCTIONS],

  defaultEnabledEncodings: [EncodingType.A_AND_B]
});

/**
 * Variant 2 base level
 * @type {NetSimLevelConfiguration}
 */
levels.variant2 = utils.extend(defaultLevel, {
  showAddRouterButton: false,
  showTabs: [NetSimTabType.INSTRUCTIONS, NetSimTabType.MY_DEVICE],
  showEncodingControls: [EncodingType.ASCII],
  defaultEnabledEncodings: [EncodingType.BINARY, EncodingType.ASCII]
});

/**
 * Variant 3 base level
 * @type {NetSimLevelConfiguration}
 */
levels.variant3 = utils.extend(defaultLevel, {
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

/**
 * AB-Sending Widget
 * Unit 1, Lesson 4
 *
 * Recognizing that since every bit-sending device made in the class sends
 * binary messages, we lose the physical bit sending devices (they are
 * cumbersome) and replace with an abstraction - the bit sending widget
 * which simulates a simplex wire that can hold a state until the next state
 * is set. Students invent a call-response protocol and use the bit sending
 * widget to send the bits - coordination, speed and timing become an issue.
 *
 * @type {NetSimLevelConfiguration}
 */
levels.unit1_lesson04 = levels.variant1;

/**
 * Sending Numbers
 * Unit 1, Lesson 8
 *
 * Students return to the sending bits widget - this version uses 0s and 1s,
 * and also automatically sends/recvs bits at the bit-rate set by the user.
 * Student challenge is to invent a protocol for sending the cartesian
 * coordinates for a line-drawing image that has at least 5 points.
 *
 * @type {NetSimLevelConfiguration}
 */
levels.unit1_lesson08 = utils.extend(levels.variant2, {
  // Hide encoding controls, only allow BINARY encoding
  showEncodingControls: [],
  defaultEnabledEncodings: [EncodingType.BINARY]
});

/**
 * Encoding and Sending Text
 * Unit 1, Lesson 10
 *
 * Students invent their own binary encoding for the text in order to send a
 * text message to a friend on the bit-sending widget. Students create their
 * own system, but are shown ASCII at the end of the lesson.
 *
 * @type {NetSimLevelConfiguration}
 */
levels.unit1_lesson10 = utils.extend(levels.variant2, {
  // Hide encoding controls, only allow BINARY encoding
  showEncodingControls: [],
  defaultEnabledEncodings: [EncodingType.BINARY]
});

/**
 * Sending Formatted Text
 * Unit 1, Lesson 11
 *
 * @type {NetSimLevelConfiguration}
 */
levels.unit1_lesson11 = levels.variant2;

/**
 * Addressing Messages
 * Unit 2, Lesson 1
 *
 * Students are presented with a sending bits problem that forces them to
 * invent an addressing protocol to add into their message sending protocols.
 * Addressing protocol will be numeric and the question about how many
 * bits/bytes to allocate for it are raised. Foreshadowing IP addresses
 *
 * @type {NetSimLevelConfiguration}
 */
levels.unit2_lesson01 = utils.extend(levels.variant3, {
  // No DNS tab yet
  showTabs: [
    NetSimTabType.INSTRUCTIONS,
    NetSimTabType.MY_DEVICE,
    NetSimTabType.ROUTER
  ],

  // Force DNS Mode to NONE
  defaultDnsMode: DnsMode.NONE
});

/**
 * Name-to-address Mapping
 * Unit 2, Lesson 2
 *
 * In this lesson students invent a protocol to do name-to-address mapping in
 * their little tiny network. Students are presented with the problem of people
 * joining and not knowing their address. How do you find out? How do you
 * distribute the problem to prevent bottlenecks or failures (redundancy)?
 * Foreshadows DNS.
 *
 * @type {NetSimLevelConfiguration}
 */
levels.unit2_lesson02 = utils.extend(levels.variant3, {
  // Hide router tab, no cheating!
  showTabs: [
    NetSimTabType.INSTRUCTIONS,
    NetSimTabType.MY_DEVICE,
    NetSimTabType.DNS
  ],

  // Force DNS Mode to MANUAL
  defaultDnsMode: DnsMode.MANUAL
});

/**
 * DNS in the real world
 * Unit 2, Lesson 3
 *
 * A “real world” style lesson in which students learn (through video?
 * research?) about IP addresses and the DNS. After this lesson students
 * should know pretty thoroughly how the real stuff works, the history
 * behind it and some of the major issues that arise (need for IPv6, and
 * DNS not secure).
 *
 * @type {NetSimLevelConfiguration}
 */
levels.unit2_lesson03 = utils.extend(levels.variant3, {
  // Hide router tab, no cheating!
  showTabs: [
    NetSimTabType.INSTRUCTIONS,
    NetSimTabType.MY_DEVICE,
    NetSimTabType.DNS
  ],

  // Force DNS Mode to AUTOMATIC
  defaultDnsMode: DnsMode.AUTOMATIC
});

/**
 * Routing part 1
 * Unit 2, Lesson 4
 *
 * In this lesson we concern ourselves more with issues that might arise with
 * the router and also concerning the potential of our current model to scale
 * and ensure equitable bandwidth use. Students are presented with scenarios
 * that lead them to invent some kind of multi-packet protocol to layer into
 * their addressing protocol (the TCP part of TCP/IP) learn about bandwidth,
 * latency and throughput.
 *
 * @type {NetSimLevelConfiguration}
 */
levels.unit2_lesson04 = levels.variant3;
