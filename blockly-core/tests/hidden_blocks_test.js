/**
 * Tests for code generation with hidden blocks.
 */

/* global Blockly, goog */
/* global assertEquals */
'use strict';

function test_showHiddenTrue() {
  Blockly.Test.initializeBlockSpaceEditor();
  var blockSpace = Blockly.mainBlockSpace;

  Blockly.Xml.domToBlockSpace(blockSpace, Blockly.Xml.textToDom(
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
    '</xml>'
  ));

  var generatedCode = 
      Blockly.Generator.blockSpaceToCode('JavaScript', null, true);
  assertEquals(2, eval(generatedCode));
}

function test_showHiddenFalse() {
  Blockly.Test.initializeBlockSpaceEditor();
  var blockSpace = Blockly.mainBlockSpace;

  Blockly.Xml.domToBlockSpace(blockSpace, Blockly.Xml.textToDom(
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
    '</xml>'
  ));

  var generatedCode = 
      Blockly.Generator.blockSpaceToCode('JavaScript', null, false)
  assertEquals(1, eval(generatedCode));
}

