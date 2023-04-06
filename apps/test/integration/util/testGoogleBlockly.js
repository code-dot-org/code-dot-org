// Note: Putting ES6 in this test file breaks the test build, for reasons we
// haven't figured out yet.  It's got something to do with require-globify.
var assert = require('../../util/reconfiguredChai').assert;
var testBlockFactory = require('./testBlockFactory');

/** @type {StudioApp} instance reference internal to this module  */
var studioApp;

/**
 * Initializes an instance of Google Blockly for testing
 */
exports.setupTestGoogleBlockly = function () {
  exports.setupGoogleBlocklyFrame();
  var options = {
    assetUrl: studioApp().assetUrl
  };
  var blocklyAppDiv = document.getElementById('app');
  Blockly.inject(blocklyAppDiv, options);
  assert(Blockly.Blocks.unknown, 'unknown block exists');

  testBlockFactory.installTestBlocks(Blockly);
  assert(Blockly.Blocks.empty_block, 'empty block exists');
  assert(Blockly.Blocks.block_with_3_titles, 'block_with_3_titles exists');
  assert(studioApp(), 'studioApp exists');
  assert(Blockly.getMainWorkspace(), 'Google Blockly workspace exists');

  Blockly.getMainWorkspace().clear();
  assert(
    Blockly.getMainWorkspace().getAllBlocks().length === 0,
    'Google Blockly workspace is empty'
  );
};

exports.setupGoogleBlocklyFrame = function () {
  require('../../util/setupGoogleBlocklyGlobal')();
  assert(global.Blockly, 'Frame loaded Google Blockly into global namespace');
  assert(Object.keys(global.Blockly).length > 0);
  Blockly.JavaScript.INFINITE_LOOP_TRAP = null;

  // c, n, v, p, s get added to global namespace by messageformat module, which
  // is loaded when we require our locale msg files
  studioApp = require('@cdo/apps/StudioApp').singleton;
  studioApp().reset = function () {};

  var blocklyAppDiv = document.getElementById('app');
  assert(blocklyAppDiv, 'blocklyAppDiv exists');

  studioApp().assetUrl = function (path) {
    return '../base/lib/blockly/' + path;
  };
};

/**
 * Gets the singleton loaded by setupTestBlockly. Throws if setupTestBlockly
 * was not used (this will be true in the case of level tests).
 */
exports.getStudioAppSingleton = function () {
  if (!studioApp()) {
    throw new Error('Expect singleton to exist');
  }
  return studioApp();
};
