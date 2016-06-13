/* global Blockly, goog */
/* global assert, assertNull, assertNotNull, assertEquals, assertFalse */
'use strict';

var TWO_CONNECTED_BLOCKS =
  '<xml>' +
    '<block type="variables_set">' +
      '<title name="VAR">x</title>' +
      '<value name="VALUE">' +
        '<block type="math_number">' +
          '<title name="NUM">1</title>' +
        '</block>' +
      '</value>' +
      '<next>' +
        '<block type="variables_set">' +
          '<title name="VAR">x</title>' +
          '<value name="VALUE">' +
            '<block type="math_number">' +
              '<title name="NUM">2</title>' +
            '</block>' +
          '</value>' +
        '</block>' +
      '</next>' +
    '</block>' +
  '</xml>';

var TWO_DISCONNECTED_BLOCKS =
  '<xml>' +
    '<block type="variables_set">' +
      '<title name="VAR">x</title>' +
      '<value name="VALUE">' +
        '<block type="math_number">' +
          '<title name="NUM">1</title>' +
        '</block>' +
      '</value>' +
    '</block>' +
    '<block type="variables_set">' +
      '<title name="VAR">x</title>' +
      '<value name="VALUE">' +
        '<block type="math_number">' +
          '<title name="NUM">2</title>' +
        '</block>' +
      '</value>' +
    '</block>' +
  '</xml>';


function test_unattachedBlocks() {
  var orig = Blockly.showUnusedBlocks;
  Blockly.Test.initializeBlockSpaceEditor();
  var blockSpace = Blockly.mainBlockSpace;

  var expectedCode = [
    ["var x;\n\n\nx = 1;\nx = 2;\n",
    "var x;\n\n\nx = 1;\n\nx = 2;\n"],
    ["var x;\n\n\n/*\nx = 1;\nx = 2;\n*/\n",
    "var x;\n\n\n/*\nx = 1;\n*/\n\n/*\nx = 2;\n*/\n"]
  ];

  [false, true].forEach(function (showUnusedBlocks, i) {
    [TWO_CONNECTED_BLOCKS, TWO_DISCONNECTED_BLOCKS].forEach(function (xml, j) {
      Blockly.showUnusedBlocks = showUnusedBlocks;
      blockSpace.clear();
      Blockly.Xml.domToBlockSpace(blockSpace, Blockly.Xml.textToDom(xml));
      var generatedCode = Blockly.Generator.blockSpaceToCode('JavaScript');
      assertEquals(expectedCode[i][j], generatedCode);
    });
  });

  Blockly.showUnusedBlocks = orig;
}
