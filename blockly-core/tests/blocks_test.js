/**
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * http://blockly.googlecode.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global Blockly, goog */
/* global assert, assertNull, assertNotNull, assertEquals, assertFalse */
'use strict';

function test_setBlockNotDisconnectable() {
  var containerDiv = Blockly.Test.initializeBlockSpaceEditor();

  var blockSpace = Blockly.mainBlockSpace;
  var block1 = new Blockly.Block(blockSpace);
  block1.initSvg();
  var block2 = new Blockly.Block(blockSpace);
  block2.initSvg();
  block2.setFunctionalOutput(true);
  assertNotNull(block1);
  assertEquals(2, blockSpace.topBlocks_.length);

  var inputName = "myInputName";
  block1.appendFunctionalInput(inputName);
  block1.attachBlockToInputName(block2, inputName);
  block2.setCanDisconnectFromParent(false);
  assertFalse(block2.canDisconnectFromParent());

  goog.dom.removeNode(containerDiv);
}

function test_clickIntoEditableUnmovableBlock() {
  var containerDiv = Blockly.Test.initializeBlockSpaceEditor();

  var blockSpace = Blockly.mainBlockSpace;
  var unmovableButEditable = ''+
      '<xml>' +
      '  <block type="math_number" movable="false">' +
      '    <title name="NUM">0</title>' +
      '  </block>' +
      '</xml>';

  Blockly.Xml.domToBlockSpace(blockSpace, Blockly.Xml.textToDom(
      unmovableButEditable));

  var inputText = goog.dom.getElementByClass('blocklyText');

  Blockly.fireTestClickSequence(inputText);

  assertNotNull("input should show up when editable field is clicked",
      goog.dom.getElementByClass('blocklyHtmlInput'));

  goog.dom.removeNode(containerDiv);
}

function test_setBlockNextConnectionDisabled() {
  var containerDiv = Blockly.Test.initializeBlockSpaceEditor();

  var blockSpace = Blockly.mainBlockSpace;
  var single_block_next_connection_default = ''+
      '<xml>' +
        '<block type="math_change">' +
          '<title name="VAR">i</title>' +
        '</block>' +
      '</xml>';

  Blockly.Xml.domToBlockSpace(blockSpace, Blockly.Xml.textToDom(
      single_block_next_connection_default));

  var block = blockSpace.getTopBlocks()[0];

  assert(block instanceof Blockly.Block);
  assertNotNull(block.nextConnection);
  assert(block.nextConnection instanceof Blockly.Connection);
  assert(block.nextConnectionDisabled_ === false);

  var single_block_next_connection_enabled = ''+
      '<xml>' +
      '  <block type="math_change" next_connection_disabled="false">' +
      '    <title name="VAR">j</title>' +
      '  </block>' +
      '</xml>';

  Blockly.Xml.domToBlockSpace(blockSpace, Blockly.Xml.textToDom(
      single_block_next_connection_enabled));

  block = blockSpace.getTopBlocks()[1];

  assert(block instanceof Blockly.Block);
  assertNotNull(block.nextConnection);
  assert(block.nextConnection instanceof Blockly.Connection);
  assert(block.nextConnectionDisabled_ === false);

  var single_block_next_connection_disabled = ''+
      '<xml>' +
      '  <block type="math_change" next_connection_disabled="true">' +
      '    <title name="VAR">k</title>' +
      '  </block>' +
      '</xml>';

  Blockly.Xml.domToBlockSpace(blockSpace, Blockly.Xml.textToDom(
      single_block_next_connection_disabled));

  block = blockSpace.getTopBlocks()[2];

  assert(block instanceof Blockly.Block);
  assert(block.nextConnectionDisabled_ === true);
  assertNull(block.nextConnection);

}

function test_visibleThroughParent() {
  Blockly.Test.initializeBlockSpaceEditor();
  var blockSpace = Blockly.mainBlockSpace;

  Blockly.Xml.domToBlockSpace(blockSpace, Blockly.Xml.textToDom(
    '<xml>' +
      '<block type="math_change">' +
        '<title name="VAR">i</title>' +
        '<next>' +
          '<block type="math_change">' +
            '<title name="VAR">j</title>' +
          '</block>' +
        '</next>' +
      '</block>' +
    '</xml>'
  ));

  var parentBlock = blockSpace.getTopBlocks()[0];
  var childBlock = parentBlock.getChildren()[0];

  assert(parentBlock.isVisible() === true);
  assert(childBlock.isVisible() === true);

  parentBlock.setCurrentlyHidden(true);

  assert(parentBlock.isVisible() === false);
  assert(childBlock.isVisible() === false);
}

function test_isVisible() {
  Blockly.Test.initializeBlockSpaceEditor();
  var blockSpace = Blockly.mainBlockSpace;

  Blockly.Xml.domToBlockSpace(blockSpace, Blockly.Xml.textToDom(
    '<xml>' +
      '<block type="math_change">' +
        '<title name="VAR">k</title>' +
      '</block>' +
    '</xml>'
  ));
  var block = blockSpace.getTopBlocks()[0];

  // block defaults to visible
  assert(block.isVisible() === true);

  // hide the block, and it's invisible
  block.setCurrentlyHidden(true);
  assert(block.isVisible() === false);

  // unhide the block, make it invisible to users, and it's invisible
  block.setCurrentlyHidden(false);
  block.setUserVisible(false);
  assert(block.isVisible() === false);

  // cache the original editBlocks state, change Blockly to edit mode,
  // and it becomes visible again
  var original_editBlocks_state = Blockly.editBlocks;
  Blockly.editBlocks = 'start_blocks';
  assert(block.isVisible() === true);

  // while still in edit mode, hide it, and it becomes invisible
  block.setCurrentlyHidden(true);
  assert(block.isVisible() === false);

  // finally, restore the editBlocks state to avoid polluting future
  // tests
  Blockly.editBlocks = original_editBlocks_state;
}

function test_blockSetIsUnused() {
  var orig = Blockly.showUnusedBlocks;

  var i, block;

  var containerDiv = Blockly.Test.initializeBlockSpaceEditor();
  var blockSpace = Blockly.mainBlockSpace;

  var blockXml = [
    '<block type="controls_whileUntil" />',
    '<block type="variables_set" uservisible="false" />',
    '<block type="functional_definition" />',
  ];

  Blockly.Xml.domToBlockSpace(blockSpace,
      Blockly.Xml.textToDom('<xml>' + blockXml.join('') + '</xml>'));

  var blocks = blockSpace.getTopBlocks();
  assertEquals(3, blocks.length);

  Blockly.showUnusedBlocks = false;
  for (i = 0; i < blocks.length; i++) {
    block = blocks[i];
    block.setIsUnused();
    assertEquals(false, block.isUnused());
  }

  Blockly.showUnusedBlocks = true;
  var expectedResults = [true, false, false];
  for (i = 0; i < blocks.length; i++) {
    block = blocks[i];
    var expectedResult = expectedResults[i];
    block.setIsUnused();
    assertEquals(expectedResult, block.isUnused());
  }

  goog.dom.removeNode(containerDiv);
  Blockly.showUnusedBlocks = orig;
}

function test_blockLimit() {
  var containerDiv = Blockly.Test.initializeBlockSpaceEditor();
  var blockSpace = Blockly.mainBlockSpace;

  Blockly.Xml.domToBlockSpace(blockSpace, Blockly.Xml.textToDom(
    '<xml>' +
      '<block type="math_change">' +
        '<title name="VAR">k</title>' +
      '</block>' +
    '</xml>'
  ));
  var block = blockSpace.getTopBlocks()[0];

  // artificially treat block as a toolbox block
  block.isInFlyout = true;

  // block default to limitless
  assert(block.hasLimit() === false);

  // set a limit
  block.setLimit(1);
  assert(block.hasLimit() === true);
  assert(block.totalRemaining() === 1);

  // add one toward the limit
  block.addTotal(1);
  assert(block.totalRemaining() === 0);

  // reset count
  block.resetTotal();
  assert(block.totalRemaining() === 1);
  goog.dom.removeNode(containerDiv);

  // cannot add more that the limit
  try {
    block.addTotal(2);
    assert(false, "addTotal did not throw expected exception");
  } catch (e) {
    assertEquals(e.message, "Failure: this toolbox block cannot create more than 1 workspace blocks");
  }

  // cannot remove more than all
  try {
    block.addTotal(-1);
    assert(false, "addTotal did not throw expected exception");
  } catch (e) {
    assertEquals(e.message, "Failure: cannot have a total of fewer than zero blocks");
  }
}
