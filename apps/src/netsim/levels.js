/*jshint multistr: true */

var msg = require('../../locale/current/netsim');
var utils = require('../utils');
var DnsMode = require('./netsimConstants').DnsMode;

/**
 * @typedef {Object} NetSimLevelConfiguration
 *
 * @property {boolean} showDnsTab - Whether the DNS tab will show up at all.
 * @property {boolean} showDnsModeControl - Whether the DNS mode controls will
 *           be available to the student.
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

  // DNS Tab and its controls
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
  showDnsModeControl: false,
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
