var assert = require('chai').assert;
var testUtils = require('../../util/testUtils');
var testBlockFactory = require('../../util/testBlockFactory');

/**
 * Initializes an instance of blockly for testing
 */
exports.setupTestBlockly = function () {
  testUtils.setupBlocklyFrame();
  var studioApp = testUtils.getStudioAppSingleton();
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
