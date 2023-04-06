import {assert} from '../util/reconfiguredChai';
import {setupTestGoogleBlockly} from './util/testGoogleBlockly';

let previousBlockly;

describe('test google blockly', function () {
  beforeEach(function () {
    previousBlockly = window.Blockly ? Blockly : undefined;
    setupTestGoogleBlockly();
  });

  it('can use domToBlock to create known blocks', function () {
    assert(Blockly.getMainWorkspace().getAllBlocks().length === 0);
    Blockly.Xml.domToBlock(
      Blockly.Xml.textToDom('<block type="empty_block"/>'),
      Blockly.getMainWorkspace()
    );
    assert(Blockly.getMainWorkspace().getAllBlocks().length === 1);
    assert(Blockly.getMainWorkspace().getAllBlocks()[0].type === 'empty_block');
    //   });

    //   it('can use domToBlock to create unknown blocks', function () {
    //     assert(Blockly.getMainWorkspace().getAllBlocks().length === 0);
    Blockly.Xml.domToBlock(
      Blockly.Xml.textToDom('<block type="some_nonexistent_block"/>'),
      Blockly.getMainWorkspace()
    );
    assert(Blockly.getMainWorkspace().getAllBlocks().length === 2);
    assert(Blockly.getMainWorkspace().getAllBlocks()[1].type === 'unknown');
  });

  afterEach(function () {
    Blockly.blockly_.ContextMenuRegistry.registry.reset();
    Blockly = previousBlockly;
  });
});
