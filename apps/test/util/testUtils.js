var chai = require('chai');
chai.Assertion.includeStack = true;
var assert = chai.assert;
exports.assert = assert;

exports.buildPath = function (path) {
  return __dirname + '/../../build/js/' + path;
};

var studioAppSingleton;

var testBlockFactory = require('./testBlockFactory');

require('./requireUncache').wrap(require);

var GlobalDiff = require('./globalDiff');
var globalDiff = new GlobalDiff();

/**
 * Wrapper around require, potentially also using our overloader, that also
 * validates that any additions to our global namespace are expected.
 */
function requireWithGlobalsCheck(path, allowedChanges) {
  allowedChanges = allowedChanges || [];

  globalDiff.cache();
  var result = require(path);
  var diff = globalDiff.diff(true);
  diff.forEach(function (key) {
    assert.notEqual(allowedChanges.indexOf(key), -1, "unexpected global change\n" +
      "key: " + key + "\n" +
      "require: " + path + "\n");
  });
  return result;
}

/**
 * Load files from code-dot-org/apps/build, while checking that the only
 * additions to the global namespace are allowedChanges
 */
exports.requireWithGlobalsCheckBuildFolder = function (path, allowedChanges) {
  return requireWithGlobalsCheck(exports.buildPath(path), allowedChanges, false);
};

/**
 * Initializes an instance of blockly for testing
 *
 * Warning: this likely doesn't do exactly the same thing each time.
 * For example, the first time requiring ./frame in setupTestBlockly will actually load frame.js.
 * Subsequent times, it will use the cached version of frame.js.
 */
exports.setupTestBlockly = function() {
  requireWithGlobalsCheck('./frame',
    ['document', 'window', 'DOMParser', 'XMLSerializer', 'Blockly']);
  assert(global.Blockly, 'Frame loaded Blockly into global namespace');

  // uncache file to force reload
  require.uncache(exports.buildPath('/base'));
  // c, n, v, p, s get added to global namespace by messageformat module, which
  // is loaded when we require our locale msg files
  studioAppSingleton = exports.requireWithGlobalsCheckBuildFolder('/base',
    ['c', 'n', 'v', 'p', 's']);

  var blocklyAppDiv = document.getElementById('app');
  assert(blocklyAppDiv, 'blocklyAppDiv exists');


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

/**
 * Generates an artist answer (which is just an ordered list of artist commands)
 * when given a function simulating the generated code. That function will
 * look something like the following:
 * function (api) {
 *   api.moveForward(100);
 *   api.turnRight(90);
 * }
 */
exports.generateArtistAnswer = function (generatedCode) {
  var ArtistAPI = require(this.buildPath('turtle/api'));
  var api = new ArtistAPI();

  api.log = [];
  generatedCode(api);
  return api.log;
};
