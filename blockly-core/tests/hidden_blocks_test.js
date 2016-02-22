/**
 * Tests for code generation with hidden blocks.
 */

/* global Blockly, goog */
/* global assertEquals */
'use strict';

var HIDDEN_VAR_REASSIGNMENT =
  '<xml>' +
    '<block type="variables_set" inline="false">' +
      '<title name="VAR">x</title>' +
      '<value name="VALUE">' +
        '<block type="math_number">' +
          '<title name="NUM">1</title>' +
        '</block>' +
      '</value>' +
      '<next>' +
        '<block type="variables_set" inline="false" uservisible="false">' +
          '<title name="VAR">x</title>' +
          '<value name="VALUE">' +
            '<block type="math_number" uservisible="false">' +
              '<title name="NUM">2</title>' +
            '</block>' +
          '</value>' +
        '</block>' +
      '</next>' +
    '</block>' +
  '</xml>';

var NESTED_HIDDEN_VAR_REASSIGNMENT =
  '<xml>' +
    '<block type="variables_set" inline="false">' +
      '<title name="VAR">x</title>' +
      '<value name="VALUE">' +
        '<block type="math_number">' +
          '<title name="NUM">1</title>' +
        '</block>' +
      '</value>' +
      '<next>' +
        '<block type="controls_if" inline="false">' +
          '<value name="IF0">' +
            '<block type="logic_compare" inline="true" movable="false">' +
              '<title name="OP">EQ</title>' +
              '<value name="A">' +
                '<block type="variables_get" movable="false">' +
                  '<title name="VAR">x</title>' +
                '</block>' +
              '</value>' +
              '<value name="B">' +
                '<block type="variables_get">' +
                  '<title name="VAR">x</title>' +
                '</block>' +
              '</value>' +
            '</block>' +
          '</value>' +
          '<statement name="DO0">' +
            '<block type="variables_set" inline="false">' +
              '<title name="VAR">x</title>' +
              '<value name="VALUE">' +
                '<block type="math_number">' +
                  '<title name="NUM">2</title>' +
                '</block>' +
              '</value>' +
              '<next>' +
                '<block type="variables_set" inline="false" uservisible="false">' +
                  '<title name="VAR">x</title>' +
                  '<value name="VALUE">' +
                    '<block type="math_number" uservisible="false">' +
                      '<title name="NUM">3</title>' +
                    '</block>' +
                  '</value>' +
                '</block>' +
              '</next>' +
            '</block>' +
          '</statement>' +
        '</block>' +
      '</next>' +
    '</block>' +
  '</xml>';

function test_showHiddenDefaultsToTrue() {
  Blockly.Test.initializeBlockSpaceEditor();
  var blockSpace = Blockly.mainBlockSpace;

  Blockly.Xml.domToBlockSpace(blockSpace, Blockly.Xml.textToDom(
      HIDDEN_VAR_REASSIGNMENT));

  var generatedCode =
      Blockly.Generator.blockSpaceToCode('JavaScript');
  assertEquals(2, eval(generatedCode));
}

function test_showHiddenTrue() {
  Blockly.Test.initializeBlockSpaceEditor();
  var blockSpace = Blockly.mainBlockSpace;

  Blockly.Xml.domToBlockSpace(blockSpace, Blockly.Xml.textToDom(
      HIDDEN_VAR_REASSIGNMENT));

  var generatedCode =
      Blockly.Generator.blockSpaceToCode('JavaScript', null, true);
  assertEquals(2, eval(generatedCode));
}

function test_showHiddenTrue_nested() {
  Blockly.Test.initializeBlockSpaceEditor();
  var blockSpace = Blockly.mainBlockSpace;

  Blockly.Xml.domToBlockSpace(blockSpace, Blockly.Xml.textToDom(
      NESTED_HIDDEN_VAR_REASSIGNMENT));

  var generatedCode =
      Blockly.Generator.blockSpaceToCode('JavaScript', null, true);
  assertEquals(3, eval(generatedCode));
}

function test_showHiddenFalse() {
  Blockly.Test.initializeBlockSpaceEditor();
  var blockSpace = Blockly.mainBlockSpace;

  Blockly.Xml.domToBlockSpace(blockSpace, Blockly.Xml.textToDom(
      HIDDEN_VAR_REASSIGNMENT));

  var generatedCode =
      Blockly.Generator.blockSpaceToCode('JavaScript', null, false)
  assertEquals(1, eval(generatedCode));
}

function test_showHiddenFalse_nested() {
  Blockly.Test.initializeBlockSpaceEditor();
  var blockSpace = Blockly.mainBlockSpace;

  Blockly.Xml.domToBlockSpace(blockSpace, Blockly.Xml.textToDom(
      NESTED_HIDDEN_VAR_REASSIGNMENT));

  var generatedCode =
      Blockly.Generator.blockSpaceToCode('JavaScript', null, false)
  assertEquals(3, eval(generatedCode));
}

