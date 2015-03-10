/*jshint multistr: true */

var msg = require('../../locale/current/netsim');
var utils = require('../utils');
var DnsMode = require('./netsimConstants').DnsMode;

/**
 * A level configuration that can be used by NetSim
 * @typedef {Object} NetSimLevelConfiguration
 *
 * @property {boolean} showInstructionsTab
 *
 * @property {boolean} showMyDeviceTab
 *
 * @property {boolean} showRouterTab
 *
 * @property {boolean} showDnsTab
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

  // Instructions tab and its controls
  showInstructionsTab: true,

  // "My Device" tab and its controls
  showMyDeviceTab: true,

  // Router tab and its controls
  showRouterTab: true,

  // DNS tab and its controls
  showDnsTab: true,
  showDnsModeControl: true,
  defaultDnsMode: DnsMode.NONE
};

/**
 * Just uses the default level configuration.
 * @type {NetSimLevelConfiguration}
 */
levels.netsim_demo = defaultLevel;

/**
 * Level demonstrating configuration that forces students to use "No DNS" mode.
 * @type {NetSimLevelConfiguration}
 */
levels.no_dns = utils.extend(defaultLevel, {
  showDnsTab: false,
  defaultDnsMode: DnsMode.NONE
});

/**
 * Level demonstrating configuration that forces students to use "Manual DNS" mode.
 * @type {NetSimLevelConfiguration}
 */
levels.manual_dns = utils.extend(defaultLevel, {
  showDnsModeControl: false,
  defaultDnsMode: DnsMode.MANUAL
});

/**
 * Level demonstrating configuration that forces students to use "Automatic DNS" mode.
 * @type {NetSimLevelConfiguration}
 */
levels.automatic_dns = utils.extend(defaultLevel, {
  showDnsModeControl: false,
  defaultDnsMode: DnsMode.AUTOMATIC
});
