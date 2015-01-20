var testUtils = require('./util/testUtils');
var assert = testUtils.assert;
var canvas = require('canvas');

global.Image = canvas.Image;
global.Turtle = {};

// needed for Hammerjs
global.navigator = {};
global.window = {};
global.document = {};

describe('functional_cond', function () {
  var studioApp;

  // create our environment
  beforeEach(function () {
    testUtils.setupTestBlockly();
    studioApp = testUtils.getStudioAppSingleton();

    var sharedFunctionalBlocks = testUtils.requireWithGlobalsCheckBuildFolder('./sharedFunctionalBlocks');
    sharedFunctionalBlocks.install(Blockly, Blockly.JavaScript, null);
  });

  function validatePairs(block, expected) {
    assert.deepEqual(block.pairs_, expected);

    var max = expected.slice(-1);

    // Go through all values (and one beyond) and make sure that we have
    // inputs for the expected pairs, and dont for the others
    for (var i = 0; i <= max + 1; i++) {
      if (expected.indexOf(i) === -1) {
        assert(block.getInput('COND' + i) === null);
        assert(block.getInput('VALUE' + i) === null);
      } else {
        assert(block.getInput('COND' + i) !== null);
        assert(block.getInput('VALUE' + i) !== null);
      }
    }
  }

  it('it can addRow multiple times', function () {
    studioApp.loadBlocks('<xml><block type="functional_cond"></block></xml>');
    assert(Blockly.mainBlockSpace.getAllBlocks().length === 1);

    var block = Blockly.mainBlockSpace.getAllBlocks()[0];
    assert(block.type === 'functional_cond');
    validatePairs(block, [0]);

    block.addRow();
    validatePairs(block, [0, 1]);

    block.addRow();
    validatePairs(block, [0, 1, 2]);
  });

  it('can remove a row at the end', function () {
    studioApp.loadBlocks('<xml><block type="functional_cond"></block></xml>');
    assert(Blockly.mainBlockSpace.getAllBlocks().length === 1);

    var block = Blockly.mainBlockSpace.getAllBlocks()[0];
    assert(block.type === 'functional_cond');
    block.addRow();
    block.addRow();
    validatePairs(block, [0, 1, 2]);

    block.removeRow(2);
    validatePairs(block, [0, 1]);
  });

  it('can remove a row in the middle', function () {
    studioApp.loadBlocks('<xml><block type="functional_cond"></block></xml>');
    assert(Blockly.mainBlockSpace.getAllBlocks().length === 1);

    var block = Blockly.mainBlockSpace.getAllBlocks()[0];
    assert(block.type === 'functional_cond');
    block.addRow();
    block.addRow();
    validatePairs(block, [0, 1, 2]);

    block.removeRow(1);
    validatePairs(block, [0, 2]);
  });

  it('can add a row after removing one', function () {
    studioApp.loadBlocks('<xml><block type="functional_cond"></block></xml>');
    assert(Blockly.mainBlockSpace.getAllBlocks().length === 1);

    var block = Blockly.mainBlockSpace.getAllBlocks()[0];
    assert(block.type === 'functional_cond');
    block.addRow();
    block.addRow();
    validatePairs(block, [0, 1, 2]);

    block.removeRow(1);
    validatePairs(block, [0, 2]);

    block.addRow();
    validatePairs(block, [0, 2, 3]);
  });

  it("can't remove the last row", function () {
    studioApp.loadBlocks('<xml><block type="functional_cond"></block></xml>');
    assert(Blockly.mainBlockSpace.getAllBlocks().length === 1);

    var block = Blockly.mainBlockSpace.getAllBlocks()[0];
    assert(block.type === 'functional_cond');
    validatePairs(block, [0]);

    block.removeRow(0);
    validatePairs(block, [0]);
  });


  it('can copy/paste with sparse pairs', function () {
    studioApp.loadBlocks('<xml><block type="functional_cond"></block></xml>');
    assert(Blockly.mainBlockSpace.getAllBlocks().length === 1);

    var block = Blockly.mainBlockSpace.getAllBlocks()[0];
    assert(block.type === 'functional_cond');
    block.addRow();
    block.addRow();
    validatePairs(block, [0, 1, 2]);

    block.removeRow(1);
    validatePairs(block, [0, 2]);

    Blockly.BlockSpaceEditor.copy_(block);
    Blockly.mainBlockSpace.paste(Blockly.clipboard_);

    assert(Blockly.mainBlockSpace.getAllBlocks().length === 2);
    var pasted = Blockly.mainBlockSpace.getAllBlocks()[1];
    validatePairs(pasted, [0, 2]);
  });
});
