/**
 * We need to have browserify-shim know about our (potenitally) digested blockly
 * file so that it properly exports Blockly. We do that by using glob to find the
 * file and then use that to dynamically create our browserify shim config.
 */
var glob = require('glob');

module.exports = {};
// get potentically digested file
var files = glob.sync(__dirname + '/../../build/package/js/blockly*.js');
if (files.length !== 1) {
  throw new Error('Expected 1 blockly file');
}
var blocklyFile = files[0];
module.exports[blocklyFile] = { exports: 'Blockly' };
