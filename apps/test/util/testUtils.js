var chai = require('chai');
chai.Assertion.includeStack = true;
var assert = chai.assert;
exports.assert = assert;
var SRC = '../../src/';

// TODO (brent) - unify around using built files instead of src files
exports.buildPath = function (path) {
  return __dirname + '/../../build/js/' + path;
};

var studioAppSingleton;

var testBlockFactory = require('./testBlockFactory');

require('./requireUncache').wrap(require);

var GlobalDiff = require('./globalDiff');
var globalDiff = new GlobalDiff();
var Overloader = require('./overloader');
var mapping = [
  {
    search: /\.\.\/locale\/current\//,
    replace: '../build/locale/en_us/'
  },
  {
    search: /^\.\/templates\//,
    replace: '../build/js/templates/'
  },
  {
    search: /lodash/,
    replace: '../build/js/lodash'
  }
];
var overloader = new Overloader(mapping, module);
// overloader.verbose = true;

/**
 * Wrapper around require, potentially also using our overloader, that also
 * validates that any additions to our global namespace are expected.
 */
exports.requireWithGlobalsCheck = function(path, allowedChanges, useOverloader) {
  allowedChanges = allowedChanges || [];
  if (useOverloader === undefined) {
    useOverloader = true;
  }

  globalDiff.cache();
  var result = useOverloader ? overloader.require(path) : require(path);
  var diff = globalDiff.diff(true);
  diff.forEach(function (key) {
    assert.notEqual(allowedChanges.indexOf(key), -1, "unexpected global change\n" +
      "key: " + key + "\n" +
      "require: " + path + "\n");
  });
  return result;
};

exports.requireWithGlobalsCheckSrcFolder = function(path, allowedChanges, useOverloader) {
  return this.requireWithGlobalsCheck(SRC + path, allowedChanges, useOverloader);
};

/**
 * Initializes an instance of blockly for testing
 *
 * Warning: this likely doesn't do exactly the same thing each time.
 * For example, the first time requiring ./frame in setupTestBlockly will actually load frame.js.
 * Subsequent times, it will use the cached version of frame.js.
 */
exports.setupTestBlockly = function() {
  this.requireWithGlobalsCheck('./frame',
    ['document', 'window', 'DOMParser', 'XMLSerializer', 'Blockly'], false);
  assert(global.Blockly, 'Frame loaded Blockly into global namespace');

  // uncache file to force reload
  require.uncache(SRC + '/base');
  // c, n, v, p, s get added to global namespace by messageformat module, which
  // is loaded when we require our locale msg files
  studioAppSingleton = this.requireWithGlobalsCheckSrcFolder('/base',
    ['c', 'n', 'v', 'p', 's']);

  var blocklyAppDiv = document.getElementById('app');
  assert(blocklyAppDiv, 'blocklyAppDiv exists');

  // TODO (brent) - address this
  studioAppSingleton.assetUrl = function (path) {
    return '../lib/blockly/' + path;
  };

  var options = {
    assetUrl: studioAppSingleton.assetUrl
  };
  Blockly.inject(blocklyAppDiv, options);
  testBlockFactory.installTestBlocks(Blockly);

  assert(Blockly.Blocks.text_print, "text_print block exists");
  assert(Blockly.Blocks.text, "text block exists");
  assert(Blockly.Blocks.math_number, "math_number block exists");
  assert(studioAppSingleton, "studioAppSingleton exists");
  assert(Blockly.mainBlockSpace, "Blockly workspace exists");

  Blockly.mainBlockSpace.clear();
  assert(Blockly.mainBlockSpace.getBlockCount() === 0, "Blockly workspace is empty");
};

/**
 * Gets the singleton loaded by setupTestBlockly. Throws if setupTestBlockly
 * was not used (this will be true in the case of level tests).
 */
exports.getStudioAppSingleton = function () {
  if (!studioAppSingleton) {
    throw new Error("Expect singleton to exist");
  }
  return studioAppSingleton;
};
