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

var SINGLE_DEFINITION_FILLED = '' +
'<xml>' +
  '<block type="functional_definition" inline="false" editable="false">' +
    '<mutation>' +
      '<outputtype>Number</outputtype>' +
    '</mutation>' +
    '<title name="NAME">functional-function</title>' +
    '<functional_input name="STACK">' +
      '<block type="functional_parameters_get">' +
        '<mutation>' +
          '<outputtype>Number</outputtype>' +
        '</mutation>' +
        '<title name="VAR">param0</title>' +
      '</block>' +
    '</functional_input>' +
  '</block>' +
'</xml>';

var SINGLE_DEFINITION_NOT_FILLED = '' +
'<xml>' +
  '<block type="functional_definition" inline="false" editable="false">' +
    '<mutation>' +
      '<outputtype>Number</outputtype>' +
    '</mutation>' +
    '<title name="NAME">functional-function</title>' +
  '</block>' +
'</xml>';

var PROCEDURE =
'<xml>' +
  '<block type="procedures_defnoreturn" editable="false">' +
    '<mutation></mutation>' +
    '<title name="NAME">test-function</title>' +
  '</block>' +
'</xml>';

var PROCEDURE_WITH_PARAM =
'<xml>' +
  '<block type="procedures_defnoreturn">' +
    '<mutation>' +
      '<arg name="x"/>' +
      '<arg name="y"/>' +
    '</mutation>' +
    '<title name="NAME">procedure with param 1</title>' +
    '<statement name="STACK">' +
      '<block type="controls_repeat_ext" inline="true">' +
        '<value name="TIMES">' +
          '<block type="parameters_get">' +
            '<title name="VAR">x</title>' +
          '</block>' +
        '</value>' +
        '<next>' +
          '<block type="controls_repeat_ext" inline="true">' +
            '<value name="TIMES">' +
              '<block type="parameters_get">' +
                '<title name="VAR">y</title>' +
              '</block>' +
            '</value>' +
          '</block>' +
        '</next>' +
      '</block>' +
    '</statement>' +
  '</block>' +
  '<block type="procedures_defnoreturn">' +
    '<mutation>' +
      '<arg name="x"/>' +
    '</mutation>' +
    '<title name="NAME">procedure with param 2</title>' +
    '<statement name="STACK">' +
      '<block type="controls_repeat_ext" inline="true">' +
        '<value name="TIMES">' +
          '<block type="parameters_get">' +
            '<title name="VAR">x</title>' +
          '</block>' +
        '</value>' +
      '</block>' +
    '</statement>' +
  '</block>' +
'</xml>';

var USER_CREATED_PROCEDURE =
'<xml>' +
  '<block type="procedures_defnoreturn" usercreated="true">' +
    '<mutation></mutation>' +
    '<title name="NAME">test-usercreated-function</title>' +
  '</block>' +
'</xml>';

var defaultSimpleDialog = null;

function initializeFunctionEditor(opt_functionDefinitionXML) {
  Blockly.focusedBlockSpace = Blockly.mainBlockSpace;
  Blockly.hasTrashcan = true;
  var xml = Blockly.Xml.textToDom(opt_functionDefinitionXML || PROCEDURE);
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

function openFunctionEditor(opt_name) {
  Blockly.functionEditor.autoOpenFunction(opt_name || 'test-function');
}

function getParametersUsedInFunctionEditor() {
  return Blockly.functionEditor.functionDefinitionBlock.getDescendants().
      filter(function(block) {
        return block.type == 'parameters_get';
      }).map(function(block) {
        return block.getTitleValue('VAR');
      });
}

function cleanupFunctionEditor() {
  Blockly.functionEditor.hideIfOpen();
}

function setCustomSimpleDialog(func) {
  if (!defaultSimpleDialog) {
    defaultSimpleDialog = Blockly.customSimpleDialog;
  }
  Blockly.customSimpleDialog = func;
}

function resetCustomSimpleDialog() {
  Blockly.customSimpleDialog = defaultSimpleDialog;
  defaultSimpleDialog = null;
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
  assertEquals(false,
      goog.style.isElementShown(goog.dom.getElementByClass('svgTextButton')));

  cleanupFunctionEditor();
  goog.dom.removeNode(container);
}

function test_functionEditor_deleteButton() {
  var container = Blockly.Test.initializeBlockSpaceEditor();
  initializeFunctionEditor(USER_CREATED_PROCEDURE);
  openFunctionEditor('test-usercreated-function');

  assertNotNull('Function exists',
      Blockly.mainBlockSpace.findFunction('test-usercreated-function'));
  assertNotNull('Function editor has delete button',
      goog.dom.getElementByClass('svgTextButton'));
  assertEquals('Delete button says "Delete"', 'Delete',
      goog.dom.getElementByClass('svgTextButton').textContent);

  // Skip confirmation dialog
  setCustomSimpleDialog(function(e) {e.onCancel();});
  Blockly.fireTestClickSequence(goog.dom.getElementByClass('svgTextButton'));

  assertNull('Function no longer exists',
      Blockly.mainBlockSpace.findFunction('test-usercreated-function'));

  resetCustomSimpleDialog();
  cleanupFunctionEditor();
  goog.dom.removeNode(container);
}

function test_functionEditor_renameParam() {
  var container = Blockly.Test.initializeBlockSpaceEditor();
  initializeFunctionEditor(PROCEDURE_WITH_PARAM);
  openFunctionEditor('procedure with param 1');
  Blockly.functionEditor.renameParameter('x', 'new_x');

  var paramsUsed = getParametersUsedInFunctionEditor();
  assertContains('Renamed to new_x', 'new_x', paramsUsed);
  assertContains('Does not change other parameter', 'y', paramsUsed);
  assertNotContains('No more old parameter', 'x', paramsUsed);

  cleanupFunctionEditor()

  // Check that the rename was limited to procedure 1's scope
  openFunctionEditor('procedure with param 2');
  paramsUsed = getParametersUsedInFunctionEditor();
  assertContains('Still has old parameter', 'x', paramsUsed);
  assertNotContains('No new parameter', 'new_x', paramsUsed);

  cleanupFunctionEditor();
  goog.dom.removeNode(container);
}

function test_functionEditor_deleteParam() {
  var container = Blockly.Test.initializeBlockSpaceEditor();
  initializeFunctionEditor(PROCEDURE_WITH_PARAM);
  openFunctionEditor('procedure with param 1');
  Blockly.functionEditor.removeParameter('x');

  var paramsUsed = getParametersUsedInFunctionEditor();
  assertNotContains('Parameter deleted', 'x', paramsUsed);
  assertContains('Still has other parameter', 'y', paramsUsed);


  cleanupFunctionEditor();
  goog.dom.removeNode(container);
}

function test_functionEditor_useSimpleDialogForParamDeletion() {
  var container = Blockly.Test.initializeBlockSpaceEditor();
  initializeFunctionEditor(PROCEDURE_WITH_PARAM);
  openFunctionEditor('procedure with param 1');
  var dialogCreated = false;
  setCustomSimpleDialog(function(config) {
    dialogCreated = true;
    config.onCancel();
  });

  Blockly.fireTestClickSequence(
      document.querySelector('.blocklyUndraggable .blocklyArrow'));
  var deleteOption = document.querySelectorAll('.goog-menuitem-content')[1];
  assertEquals('Delete parameter...', deleteOption.textContent);
  Blockly.fireTestClickSequence(deleteOption);

  assert(dialogCreated);
  var paramsUsed = getParametersUsedInFunctionEditor();
  assertEquals('One parameter left', 1, paramsUsed.length);

  resetCustomSimpleDialog();
  cleanupFunctionEditor();
  goog.dom.removeNode(container);
}

function test_contractEditor_add_examples() {
  var singleDefinitionString = SINGLE_DEFINITION_FILLED;
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

function test_contractEditor_run_test_with_definition_runs() {
  var container = initializeWithContractEditor(SINGLE_DEFINITION_FILLED);
  var contractEditor = Blockly.contractEditor;
  contractEditor.autoOpenWithLevelConfiguration({
    autoOpenFunction: 'functional-function'
  });
  contractEditor.addNewExampleBlock_();
  assertEquals('Has one example', 1, contractEditor.exampleBlocks.length);

  Blockly.fireTestClickSequence(goog.dom.getElementByClass('testButton'));

  var resultText = goog.dom.getTextContent(
      goog.dom.getElementByClass('example-result-text'));
  assertRegExp('^Block ID is', resultText);
  contractEditor.hideIfOpen();
  goog.dom.removeNode(container);
}

function test_contractEditor_run_test_no_definition_error() {
  var container = initializeWithContractEditor(SINGLE_DEFINITION_NOT_FILLED);
  var contractEditor = Blockly.contractEditor;
  contractEditor.autoOpenWithLevelConfiguration({
    autoOpenFunction: 'functional-function'
  });
  contractEditor.addNewExampleBlock_();
  assertEquals('Has one example', 1, contractEditor.exampleBlocks.length);

  Blockly.fireTestClickSequence(goog.dom.getElementByClass('testButton'));

  var resultText = goog.dom.getTextContent(
      goog.dom.getElementByClass('example-result-text'));
  assertEquals('Define the function below and try again.', resultText);
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

function test_contractEditor_new_function_then_variable_then_function() {
  Blockly.defaultNumExampleBlocks = 2;
  var container = initializeWithContractEditor('<xml/>');
  var contractEditor = Blockly.contractEditor;

  contractEditor.openWithNewFunction();
  assertContractDefinitionLaidOutAsExpected(contractEditor);
  contractEditor.hideIfOpen();
  contractEditor.openWithNewVariable();
  assertContractVariableDefinitionLaidOutAsExpected(contractEditor);
  contractEditor.hideIfOpen();
  contractEditor.openWithNewFunction();
  assertContractDefinitionLaidOutAsExpected(contractEditor);

  contractEditor.hideIfOpen();
  goog.dom.removeNode(container);
}

function assertContractDefinitionLaidOutAsExpected(contractEditor) {
  var definitionSectionLogic = contractEditor.definitionSectionLogic_;
  var definitionTableGroup = definitionSectionLogic.definitionTableGroup;
  var functionDefinitionBlock = contractEditor.functionDefinitionBlock;

  assertEquals('block', definitionTableGroup.style.display);
  assert('Contract definition is not variable',
      !functionDefinitionBlock.isVariable());
  assert('Contract definition is positioned relative to examples.',
      functionDefinitionBlock.getRelativeToSurfaceXY().x >
      Blockly.BlockSpaceEditor.BUMP_PADDING_LEFT);
}

function assertContractVariableDefinitionLaidOutAsExpected(contractEditor) {
  var definitionSectionLogic = contractEditor.definitionSectionLogic_;
  var definitionTableGroup = definitionSectionLogic.definitionTableGroup;
  var variableDefinitionBlock = contractEditor.functionDefinitionBlock;

  assert('Variable is detected properly', variableDefinitionBlock.isVariable());
  assertEquals('Variable definition block laid out to the',
      Blockly.BlockSpaceEditor.BUMP_PADDING_LEFT,
      variableDefinitionBlock.getRelativeToSurfaceXY().x);
  assertEquals('Variable definition is hidden properly',
      'none', definitionTableGroup.style.display);
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

function test_contractEditor_new_function_button_then_delete() {
  Blockly.defaultNumExampleBlocks = 2;
  var container = initializeWithContractEditor('<xml/>');
  var contractEditor = Blockly.contractEditor;

  contractEditor.openWithNewFunction();
  contractEditor.addNewExampleBlock_();
  contractEditor.addNewExampleBlock_();

  var definitionBlock = contractEditor.functionDefinitionBlock;
  var functionName = definitionBlock.getProcedureInfo().name;

  var acceptDialogTriggered = false;
  /**
   * @type {SimpleDialogFunction}
   * @param {DialogOptions} dialogOptions
   */
  var instantAcceptDialog = function (dialogOptions) {
    // Fake dialog class which accepts deletion immediately
    // in dialog parlence, deletion -> cancel (left side button)
    acceptDialogTriggered = true;
    dialogOptions.onCancel();
  };

  var rejectDialogTriggered = false;
  /**
   * @type {SimpleDialogFunction}
   * @param {DialogOptions} dialogOptions
   */
  var instantRejectDialog = function (dialogOptions) {
    // Fake dialog class which rejects deletion immediately
    // in dialog parlence, rejection -> confirm (right side button)
    rejectDialogTriggered = true;
    if (dialogOptions.onConfirm) {
      dialogOptions.onConfirm();
    }
  };

  var beforeDeletionAssertions = function () {
    assertTrue('Contract editor is open', contractEditor.isOpen());
    assertEquals('Has four examples',
        4, Blockly.mainBlockSpace.findFunctionExamples(functionName).length);
    assertNotNull('Function exists',
        Blockly.mainBlockSpace.findFunction(functionName));
  };

  var afterDeletionAssertions = function () {
    assertFalse('Contract editor no longer open', contractEditor.isOpen());
    assertEquals('Has no examples',
        0, Blockly.mainBlockSpace.findFunctionExamples(functionName).length);
    assertNull('Function no longer exists',
        Blockly.mainBlockSpace.findFunction(functionName));
  };

  beforeDeletionAssertions();
  assertFalse(acceptDialogTriggered);
  assertFalse(rejectDialogTriggered);

  setCustomSimpleDialog(instantRejectDialog);
  Blockly.fireTestClickSequence(goog.dom.getElementByClass('svgTextButton'));

  assertTrue(rejectDialogTriggered);
  beforeDeletionAssertions();

  setCustomSimpleDialog(instantAcceptDialog)
  Blockly.fireTestClickSequence(goog.dom.getElementByClass('svgTextButton'));

  assertTrue(acceptDialogTriggered);
  afterDeletionAssertions();

  resetCustomSimpleDialog();
  contractEditor.hideIfOpen();
  goog.dom.removeNode(container);
}
