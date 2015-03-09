/*jshint multistr: true */

var msg = require('../../locale/current/netsim');
var utils = require('../utils');

/**
 * @typedef {Object} NetSimLevelConfiguration
 * @property {boolean} freePlay - This was here before, I'm not sure what it
 *           will do.
 * @property {boolean} showDnsModeControl - Whether the DNS mode controls will
 *           be available to the student.
 * @property {string} defaultDnsMode - Which DNS mode the simulator should
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
  freePlay: true,
  showDnsModeControl: true,
  defaultDnsMode: 'none'
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
  showDnsModeControl: false,
  defaultDnsMode: 'none'
});

/**
 * Level demonstrating configuration that forces students to use "Manual DNS" mode.
 * @type {NetSimLevelConfiguration}
 */
levels.manual_dns = utils.extend(defaultLevel, {
  showDnsModeControl: false,
  defaultDnsMode: 'manual'
});
