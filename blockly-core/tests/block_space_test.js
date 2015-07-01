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
'use strict';

function test_initializeBlockSpace() {
  var container = Blockly.Test.initializeBlockSpaceEditor();
  goog.dom.removeNode(container);
}

function test_blockSpaceBumpsBlocks() {
  var container = Blockly.Test.initializeBlockSpaceEditor();

  var blockXML = '<xml><block type="math_number"><title name="NUM">0</title></block></xml>';
  Blockly.Xml.domToBlockSpace(Blockly.mainBlockSpace, Blockly.Xml.textToDom(blockXML));
  var numberBlock = Blockly.mainBlockSpace.getTopBlocks()[0];
  assertEquals('math_number', numberBlock.type);
  numberBlock.moveTo(10, 10);
  assertEquals(10, numberBlock.getRelativeToSurfaceXY().x);
  assertEquals(10, numberBlock.getRelativeToSurfaceXY().y);

  numberBlock.moveTo(-10, -10);
  assertEquals(-10, numberBlock.getRelativeToSurfaceXY().x);
  Blockly.mainBlockSpaceEditor.bumpBlocksIntoBlockSpace_();
  assertEquals(Blockly.BlockSpaceEditor.BUMP_PADDING_LEFT, numberBlock.getRelativeToSurfaceXY().x);
  assertEquals(Blockly.BlockSpaceEditor.BUMP_PADDING_TOP, numberBlock.getRelativeToSurfaceXY().y);

  goog.dom.removeNode(container);
}

function test_scrollBarsActivateOnDropOutsideViewport() {
  var container = Blockly.Test.initializeBlockSpaceEditor();

  var blockXML = '<xml><block type="math_number"><title name="NUM">0</title></block></xml>';
  Blockly.Xml.domToBlockSpace(Blockly.mainBlockSpace, Blockly.Xml.textToDom(blockXML));
  var numberBlock = Blockly.mainBlockSpace.getTopBlocks()[0];

  assert('Scrollbars not visible to start', !Blockly.mainBlockSpace.scrollbarPair.vScroll.isVisible());

  var viewportHeight = Blockly.mainBlockSpace.getMetrics().viewHeight;
  numberBlock.moveTo(0, viewportHeight); // hanging off bottom
  assertEquals(viewportHeight, numberBlock.getRelativeToSurfaceXY().y);

  Blockly.mainBlockSpace.scrollbarPair.resize();

  assert('Scrollbars visible after block dragged below bottom',
    Blockly.mainBlockSpace.scrollbarPair.vScroll.isVisible());

  goog.dom.removeNode(container);
}
