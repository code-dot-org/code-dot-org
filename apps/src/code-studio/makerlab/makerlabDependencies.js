/**
 * Entry point to build a bundle containing a set of globals used by makerlab.
 */

process.hrtime = require('browser-process-hrtime');
window.JohnnyFive = require('johnny-five');
window.PlaygroundIO = require('playground-io');
window.ChromeSerialport = require('chrome-serialport');
