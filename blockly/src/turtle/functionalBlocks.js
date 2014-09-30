/**
 * A set of functional blocks
 */

exports.install = function(blockly, generator, gensym) {
 installPlus(blockly, generator, gensym);
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
      this.appendValueInput('VALUE')
          .setCheck('Number');
      this.appendValueInput('VALUE')
          .setCheck('Number')
          .setInline(true);

      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  generator.functional_plus = function() {
    return '';
  };
}
