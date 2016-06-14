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
    '<block type="math_number" y="109"><title name="NUM">0</title></block>',
    '<block type="math_number" x="119" y="129"><title name="NUM">0</title></block>',
    '<block type="math_number" uservisible="false" x="139"><title name="NUM">0</title></block>',
    '<block type="math_number" uservisible="false" y="149"><title name="NUM">0</title></block>',
    '<block type="math_number" uservisible="false" x="159" y="169"><title name="NUM">0</title></block>',
  ];

  var expected_positions = [
    [16, 16], // first block goes at the top
    [16, 121], // second block is hidden, so it goes below the others
    [16, 51], // third block goes after the first
    [99, 86], // fourth is absolutely positioned with x=
    [16, 109], // fifth is absolutely positioned with y=
    [119, 129], // sixth is absolutely positioned with x= and y=
    [139, 156], // seventh is hidden, so it goes after the second
    [16, 149], // eighth is absolutely positioned with y=
    [159, 169] // ninth is absolutely positioned with x= and y=
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

function test_blockSpace_isReadOnly() {
  Blockly.Test.testWithReadOnlyBlockSpaceEditor(function(blockSpaceEditor) {
    var blockSpace = blockSpaceEditor.blockSpace;
    // default values; Blockly.readOnly = false, blockSpaceEditor.readOnly_ = true
    assertEquals(blockSpaceEditor.readOnly_, true);
    assertEquals(Blockly.readOnly, false);
    assertEquals(blockSpaceEditor.isReadOnly(), true);
    assertEquals(blockSpace.isReadOnly(), true);

    // Blockly.readOnly = false, blockSpaceEditor.readOnly_ = false
    blockSpaceEditor.readOnly_ = false;
    Blockly.readOnly = false;
    assertEquals(blockSpaceEditor.readOnly_, false);
    assertEquals(Blockly.readOnly, false);
    assertEquals(blockSpaceEditor.isReadOnly(), false);
    assertEquals(blockSpace.isReadOnly(), false);

    // Blockly.readOnly = true, blockSpaceEditor.readOnly_ = false
    blockSpaceEditor.readOnly_ = false;
    Blockly.readOnly = true;
    assertEquals(blockSpaceEditor.readOnly_, false);
    assertEquals(Blockly.readOnly, true);
    assertEquals(blockSpaceEditor.isReadOnly(), true);
    assertEquals(blockSpace.isReadOnly(), true);

    // reset to defaults for next run
    blockSpaceEditor.readOnly_ = false;
    Blockly.readOnly = false;
  });
}

function test_readOnlyBlockSpaceCanRender() {
  Blockly.Test.testWithReadOnlyBlockSpaceEditor(function(blockSpaceEditor) {
    var blockSpace = blockSpaceEditor.blockSpace;
    var blockXML = '<xml><block type="math_number"><title name="NUM">0</title></block></xml>';
    Blockly.Xml.domToBlockSpace(blockSpace, Blockly.Xml.textToDom(blockXML));
    var numberBlock = blockSpace.getTopBlocks()[0];
    assertEquals(numberBlock.isEditable(), false);
  });
}

function test_blockSpacesUseSameWidgetDiv() {
  Blockly.Test.initializeBlockSpaceEditor();
  var first = Blockly.WidgetDiv;
  assertNotNull(first);
  Blockly.Test.initializeBlockSpaceEditor();
  var second = Blockly.WidgetDiv;
  assertNotNull(second);
  assertEquals(first, second);
}

function test_blockSpaceWithLimitedQuantitiesOfBlocks() {
  var container = Blockly.Test.initializeBlockSpaceEditor();

  var flyout = Blockly.mainBlockSpace.blockSpaceEditor.flyout_;
  flyout.init(Blockly.mainBlockSpace, true);

  var toolboxXML = Blockly.Xml.textToDom(
    '<xml>' +
      '<block type="math_number" limit="1">' +
        '<title name="NUM">0</title>' +
      '</block>' +
    '</xml>'
  );
  flyout.show(toolboxXML.childNodes);

  assertEquals(true, flyout.blockLimits.hasBlockLimits());
  assertEquals(1, flyout.blockLimits.limits_.math_number.limit);
  assertEquals(0, flyout.blockLimits.limits_.math_number.total);

  // can initially accomodate one more, but not two
  assertEquals(true, flyout.blockLimits.blockTypeWithinLimits('math_number', 1));
  assertEquals(false, flyout.blockLimits.blockTypeWithinLimits('math_number', 2));

  Blockly.Xml.domToBlockSpace(Blockly.mainBlockSpace, Blockly.Xml.textToDom(
    '<xml>' +
      '<block type="math_number">' +
        '<title name="NUM">0</title>' +
      '</block>' +
    '</xml>'
  ));
  flyout.onBlockSpaceChange_();

  // can no longer even accomodate one
  assertEquals(false, flyout.blockLimits.blockTypeWithinLimits('math_number', 1));

  goog.dom.removeNode(container);
}
