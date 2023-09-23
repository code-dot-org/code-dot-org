// Note: Putting ES6 in this test file breaks the test build, for reasons we
// haven't figured out yet.  It's got something to do with require-globify.
import {assert} from '../../util/reconfiguredChai';
import {installTestBlocks} from './testBlockFactory';
import setupBlocklyGlobal from '../../util/setupBlocklyGlobal';
import {singleton as studioApp} from '@cdo/apps/StudioApp';

/**
 * Initializes an instance of blockly for testing
 */
export const setupTestBlockly = function () {
  setupBlocklyFrame();
  var options = {
    assetUrl: studioApp().assetUrl,
  };
  var blocklyAppDiv = document.getElementById('app');
  Blockly.inject(blocklyAppDiv, options);
  installTestBlocks(Blockly);

  assert(Blockly.Blocks.text_print, 'text_print block exists');
  assert(Blockly.Blocks.text, 'text block exists');
  assert(Blockly.Blocks.math_number, 'math_number block exists');
  assert(studioApp(), 'studioApp exists');
  assert(Blockly.mainBlockSpace, 'Blockly workspace exists');

  Blockly.mainBlockSpace.clear();
  assert(
    Blockly.mainBlockSpace.getBlockCount() === 0,
    'Blockly workspace is empty'
  );
};

export const setupBlocklyFrame = function () {
  setupBlocklyGlobal();
  assert(global.Blockly, 'Frame loaded Blockly into global namespace');
  assert(Object.keys(global.Blockly).length > 0);
  Blockly.JavaScript.INFINITE_LOOP_TRAP = null;

  // c, n, v, p, s get added to global namespace by messageformat module, which
  // is loaded when we require our locale msg files
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
export const getStudioAppSingleton = function () {
  if (!studioApp()) {
    throw new Error('Expect singleton to exist');
  }
  return studioApp();
};
