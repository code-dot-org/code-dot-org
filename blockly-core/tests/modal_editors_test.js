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

function initializeFunctionEditor() {
  Blockly.focusedBlockSpace = Blockly.mainBlockSpace;
  Blockly.hasTrashcan = true;
  var functionDefinitionXML = '<xml><block type="procedures_defnoreturn" editable="false"><mutation></mutation><title name="NAME">test-function</title></block></xml>'
  var xml = Blockly.Xml.textToDom(functionDefinitionXML);
  Blockly.Xml.domToBlockSpace(Blockly.mainBlockSpace, xml);
  Blockly.useModalFunctionEditor = true;
  Blockly.functionEditor = new Blockly.FunctionEditor();
}

function initializeContractEditor(xmlString) {
  Blockly.focusedBlockSpace = Blockly.mainBlockSpace;
  Blockly.hasTrashcan = true;
  var xmlDom = Blockly.Xml.textToDom(xmlString);
  Blockly.Xml.domToBlockSpace(Blockly.mainBlockSpace, xmlDom);
  Blockly.useModalFunctionEditor = true;
  Blockly.functionEditor = Blockly.contractEditor = new Blockly.ContractEditor({
    disableExamples: false
  });
}

function initializeWithContractEditor(xmlString) {
  var container = Blockly.Test.initializeBlockSpaceEditor();
  initializeContractEditor(xmlString);
  return container;
}

function openFunctionEditor() {
  Blockly.functionEditor.autoOpenFunction('test-function');
}

function cleanupFunctionEditor() {
  Blockly.functionEditor.hideIfOpen();
}

function test_functionEditorDoesntBumpBlocksInMainBlockspace() {
  var container = Blockly.Test.initializeBlockSpaceEditor();

  var blockXML = '<xml><block type="math_number"><title name="NUM">0</title></block></xml>';
  Blockly.Xml.domToBlockSpace(Blockly.mainBlockSpace, Blockly.Xml.textToDom(blockXML));
  var numberBlock = Blockly.mainBlockSpace.getTopBlocks(false, false)[0];

  initializeFunctionEditor();

  var viewportHeight = Blockly.mainBlockSpace.getMetrics().viewHeight;

  numberBlock.moveTo(0, viewportHeight); // hanging off bottom (scrollable)
  assertEquals(viewportHeight, numberBlock.getRelativeToSurfaceXY().y);
  Blockly.mainBlockSpace.scrollbarPair.resize();
  assertEquals(viewportHeight, numberBlock.getRelativeToSurfaceXY().y);

  openFunctionEditor();

  Blockly.modalBlockSpaceEditor.bumpBlocksIntoBlockSpace();

  assertEquals("Opening function editor doesn't bump main block",
    viewportHeight, numberBlock.getRelativeToSurfaceXY().y);

  goog.dom.removeNode(container);
}

function test_initializeFunctionEditor() {
  var container = Blockly.Test.initializeBlockSpaceEditor();
  initializeFunctionEditor();
  openFunctionEditor();

  var definitionBlock = Blockly.functionEditor.functionDefinitionBlock;
  assertNotNull(definitionBlock);
  assertEquals('procedures_defnoreturn', definitionBlock.type);
  assertEquals(false, definitionBlock.isMovable());
  assertEquals(false, definitionBlock.shouldBeGrayedOut());
  assertEquals(false, definitionBlock.isDeletable());
  assertEquals(false, definitionBlock.isEditable());

  cleanupFunctionEditor();
  goog.dom.removeNode(container);
}

function test_contractEditor_add_examples() {
  var singleDefinitionString = '<xml><block type="functional_definition" inline="false" editable="false"><mutation><outputtype>Number</outputtype></mutation><title name="NAME">functional-function</title></block></xml>';
  var container = initializeWithContractEditor(singleDefinitionString);
  var contractEditor = Blockly.contractEditor;
  contractEditor.autoOpenWithLevelConfiguration({
    autoOpenFunction: 'functional-function'
  });
  assertEquals('Has zero examples', 0, contractEditor.exampleBlocks.length);
  contractEditor.addNewExampleBlock_();
  contractEditor.addNewExampleBlock_();
  assertEquals('Added two examples', 2, contractEditor.exampleBlocks.length);
  var firstExample = contractEditor.exampleBlocks[0];
  var callBlock = firstExample.getInputTargetBlock(
      Blockly.ContractEditor.EXAMPLE_BLOCK_ACTUAL_INPUT_NAME);
  assertFalse(callBlock.canDisconnectFromParent());
  contractEditor.hideIfOpen();
  goog.dom.removeNode(container);
}

function test_contractEditor_new_function_button() {
  Blockly.defaultNumExampleBlocks = 2;
  var container = initializeWithContractEditor('<xml/>');

  Blockly.contractEditor.openWithNewFunction();

  var definitionBlock = Blockly.contractEditor.functionDefinitionBlock;
  assertNotNull(definitionBlock);
  assertEquals('functional_definition', definitionBlock.type);
  assertEquals('Has two examples', 2, Blockly.contractEditor.exampleBlocks.length);

  Blockly.contractEditor.hideIfOpen();
  goog.dom.removeNode(container);
}

function test_contractEditor_new_variable_button() {
  var container = initializeWithContractEditor('<xml/>');

  Blockly.contractEditor.openWithNewVariable();

  var definitionBlock = Blockly.contractEditor.functionDefinitionBlock;
  assertNotNull(definitionBlock);
  assertEquals('functional_definition', definitionBlock.type);
  assert(Blockly.contractEditor.isEditingVariable());
  assertEquals('Variables have no examples', 0,
    Blockly.contractEditor.exampleBlocks.length);

  Blockly.contractEditor.hideIfOpen();
  goog.dom.removeNode(container);
}

function test_contractEditor_change_output_types() {
  var singleDefinitionString = '<xml><block type="functional_definition" inline="false" editable="false"><mutation><outputtype>Number</outputtype></mutation><title name="NAME">functional-function</title><functional_input name="STACK"><block type="functional_call"><mutation name="functional-function"></mutation></block></functional_input></block></xml>';
  var container = initializeWithContractEditor(singleDefinitionString);
  Blockly.contractEditor.autoOpenWithLevelConfiguration({
    autoOpenFunction: 'functional-function'
  });
  Blockly.contractEditor.addNewExampleBlock_();
  Blockly.contractEditor.addNewExampleBlock_();

  var firstExample = Blockly.contractEditor.exampleBlocks[0];
  var fnDefInput = Blockly.contractEditor.functionDefinitionBlock.getInput('STACK');
  assertEquals('functional_call', fnDefInput.connection.targetBlock().type);

  assertEquals('Function definition has correct initial type', 'Number',
    Blockly.contractEditor.currentFunctionDefinitionType_());
  assertEquals('Example actual slot has correct initial type', 'Number',
    firstExample.getInput('ACTUAL').connection.check_[0]);
  assertEquals('Example expected slot has correct initial type', 'Number',
    firstExample.getInput('EXPECTED').connection.check_[0]);
  assertEquals('Function definition slot has correct initial type', 'Number',
    fnDefInput.connection.check_[0]);
  var exampleFnCallBlockBefore = firstExample.getInput('ACTUAL').connection.targetBlock();
  assertEquals('Example default function call block has correct type', 'Number',
    exampleFnCallBlockBefore.previousConnection.check_[0]);
  assertEquals('Function definition call block has correct type', 'Number',
    fnDefInput.connection.targetBlock().previousConnection.check_[0]);

  Blockly.contractEditor.outputTypeChanged_('String');

  assertEquals('Example actual has correct input type after type change', 'String',
    firstExample.getInput('ACTUAL').connection.check_[0]);
  assertEquals('Example expected has correct input type after type change', 'String',
    firstExample.getInput('EXPECTED').connection.check_[0]);

  var exampleFnCallBlockAfter = firstExample.getInput('ACTUAL').connection.targetBlock();
  assertNotNull('Example actual call block is connected after type change',
    exampleFnCallBlockAfter);
  assertEquals('Example actual call block has correct type', 'String',
    exampleFnCallBlockAfter.previousConnection.check_[0]);

  assertEquals('Function definition changes type', 'String',
    Blockly.contractEditor.currentFunctionDefinitionType_());
  assertEquals('Function definition has correct input type after type change', 'String',
    fnDefInput.connection.check_[0]);

  var fnDefInputBlockAfter = fnDefInput.connection.targetBlock();
  assertNotNull('Function call block still connected to function definition after type change',
    fnDefInputBlockAfter);
  assertEquals('Function definition call block has correct new type', 'String',
    fnDefInputBlockAfter.previousConnection.check_[0]);

  Blockly.contractEditor.hideIfOpen();
  goog.dom.removeNode(container);
}
