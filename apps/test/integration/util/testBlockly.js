var assert = require('chai').assert;
var testUtils = require('../../util/testUtils');
var testBlockFactory = require('../../util/testBlockFactory');

/** @type {StudioApp} instance reference internal to this module  */
var studioApp;

/**
 * Initializes an instance of blockly for testing
 */
exports.setupTestBlockly = function () {
  exports.setupBlocklyFrame();
  var options = {
    assetUrl: studioApp.assetUrl
  };
  var blocklyAppDiv = document.getElementById('app');
  Blockly.inject(blocklyAppDiv, options);
  // TODO (brent)
  // studioApp.removeEventListeners();
  testBlockFactory.installTestBlocks(Blockly);

  assert(Blockly.Blocks.text_print, "text_print block exists");
  assert(Blockly.Blocks.text, "text block exists");
  assert(Blockly.Blocks.math_number, "math_number block exists");
  assert(studioApp, "studioApp exists");
  assert(Blockly.mainBlockSpace, "Blockly workspace exists");

  Blockly.mainBlockSpace.clear();
  assert(Blockly.mainBlockSpace.getBlockCount() === 0, "Blockly workspace is empty");
};

exports.setupBlocklyFrame = function () {
  require('../../util/frame')();
  assert(global.Blockly, 'Frame loaded Blockly into global namespace');
  assert(Object.keys(global.Blockly).length > 0);
  Blockly.JavaScript.INFINITE_LOOP_TRAP = null;

  testUtils.setupLocales();

  // c, n, v, p, s get added to global namespace by messageformat module, which
  // is loaded when we require our locale msg files
  studioApp = require('@cdo/apps/StudioApp').singleton;
  studioApp.reset = function (){};

  var blocklyAppDiv = document.getElementById('app');
  assert(blocklyAppDiv, 'blocklyAppDiv exists');


  studioApp.assetUrl = function (path) {
    return '../lib/blockly/' + path;
  };
};

/**
 * Gets the singleton loaded by setupTestBlockly. Throws if setupTestBlockly
 * was not used (this will be true in the case of level tests).
 */
exports.getStudioAppSingleton = function () {
  if (!studioApp) {
    throw new Error("Expect singleton to exist");
  }
  return studioApp;
};
