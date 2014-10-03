/**
 * A set of functional blocks
 */

exports.install = function(blockly, generator, gensym) {
 installPlus(blockly, generator, gensym);
 installMathNumber(blockly, generator, gensym);
};

function installPlus(blockly, generator, gensym) {
  blockly.Blocks.functional_plus = {
    // Block for turning left or right.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle('+')
          .setAlign(Blockly.ALIGN_CENTRE);
      this.appendFunctionalInput('VALUE');
      this.appendFunctionalInput('VALUE')
          .setInline(true);

      this.setPreviousStatement(true);
      // this.setNextStatement(true);
    }
  };

  generator.functional_plus = function() {
    return '';
  };
}

function installMathNumber(blockly, generator, gensym) {
  blockly.Blocks.functional_math_number = {
    // Numeric value.
    init: function() {
      this.setHSV(258, 0.35, 0.62);
      this.appendDummyInput()
          .appendTitle(new Blockly.FieldTextInput('0',
          Blockly.FieldTextInput.numberValidator), 'NUM');
      this.setOutput(true, 'Number', Blockly.FUNCTIONAL_OUTPUT);
    }
  };

  generator.functional_math_number = function() {
    return '';
  };
}
