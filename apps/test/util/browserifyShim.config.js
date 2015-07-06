/**
 * We need to have browserify-shim know about our digested file so that it
 * properly exports Blockly. We do that by using glob to find the digested file
 * and then using that to dynamically create our browserify shim config
 */
var glob = require('glob');
var files = glob.sync(__dirname + '/../../build/package/js/blockly-????????????????????????????????*.js');
var blockly = files[0];

module.exports = {};
module.exports[blockly] = { exports: 'Blockly' };
