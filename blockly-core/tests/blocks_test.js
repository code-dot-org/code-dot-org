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
