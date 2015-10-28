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

/* global Blockly, goog, assertEquals, assert */

'use strict';

var SMALL_NUMBER_BLOCK  = '<xml>' +
    '<block type="math_number">' +
    '<title name="NUM">0</title>' +
    '</block>' +
    '</xml>';

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
  Blockly.mainBlockSpaceEditor.bumpBlocksIntoBlockSpace();
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

function test_blockSpaceExpandsWithMarginAfterBlockDrop() {
  var container = Blockly.Test.initializeBlockSpaceEditor();

  var blockSpace = Blockly.mainBlockSpace;
  Blockly.Xml.domToBlockSpace(blockSpace, Blockly.Xml.textToDom(SMALL_NUMBER_BLOCK));
  var numberBlock = blockSpace.getTopBlocks()[0];
  var viewportHeight = blockSpace.getMetrics().viewHeight;
  var originalScrollableHeight = blockSpace.getScrollableSize(
      blockSpace.getMetrics()).height;

  assertEquals(viewportHeight, originalScrollableHeight);

  // drop block just at bottom
  var distanceFromBottom = 10;
  numberBlock.moveTo(0, viewportHeight -
      numberBlock.getHeightWidth().height -
      distanceFromBottom);

  Blockly.mainBlockSpace.scrollbarPair.resize();

  var originalPlusMargin = originalScrollableHeight +
      Blockly.BlockSpace.SCROLLABLE_MARGIN_BELOW_BOTTOM -
      distanceFromBottom;
  var newScrollableHeight =
      blockSpace.getScrollableSize(blockSpace.getMetrics()).height;

  assert("Scrollable area has increased",
      newScrollableHeight > originalPlusMargin);

  goog.dom.removeNode(container);
}

function test_blockSpaceAutoPositioning() {
  var container = Blockly.Test.initializeBlockSpaceEditor();

  var blocks = [
    '<block type="math_number"><title name="NUM">0</title></block>',
    '<block type="math_number" uservisible="false"><title name="NUM">0</title></block>',
    '<block type="math_number"><title name="NUM">0</title></block>',
    '<block type="math_number" x="99"><title name="NUM">0</title></block>',
    '<block type="math_number" y="199"><title name="NUM">0</title></block>',
    '<block type="math_number" x="399" y="499"><title name="NUM">0</title></block>',
  ];

  var expected_positions = [
    [16, 16], // first block goes at the top
    [16, 86], // second block is hidden, so it goes below the others
    [16, 51], // third block goes after the first
    [99, 16], // fourth was absolutely positioned with x=
    [16, 199], // fifth was absolutely positioned with y=
    [399, 499] // sixth was absolutely positioned with x= and y=
  ];

  var blockXML = '<xml>' + blocks.join('') + '</xml>';
  Blockly.Xml.domToBlockSpace(Blockly.mainBlockSpace, Blockly.Xml.textToDom(blockXML));
  var topBlocks = Blockly.mainBlockSpace.getTopBlocks();
  
  for (var i = 0; i < topBlocks.length; i++) {
    var position = topBlocks[i].getRelativeToSurfaceXY();
    assertEquals(expected_positions[i][0], position.x);
    assertEquals(expected_positions[i][1], position.y);
  }
}
