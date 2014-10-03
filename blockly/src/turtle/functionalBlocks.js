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
      this.appendFunctionalInput('VALUE1');
      // this.appendDummyInput()
      //     .appendTitle('')
      //     .setInline(true);
      this.appendFunctionalInput('VALUE2')
          .setInline(true);

      this.setFunctionalOutput(true, 'Number');
      // this.setPreviousStatement(true);
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
      this.setFunctionalOutput(true, 'Number');
    }
  };

  generator.functional_math_number = function() {
    return '';
  };
}
