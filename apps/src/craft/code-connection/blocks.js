// Install extensions to Blockly's language and JavaScript generator.
export const install = (blockly) => {
  blockly.Blocks.craft_log = {
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendValueInput('VALUE')
          .appendTitle(new blockly.FieldLabel('log'));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_log = function () {
    const argument0 = blockly.JavaScript.valueToCode(this, 'VALUE', Blockly.JavaScript.ORDER_NONE);
    return `log('block_id_${this.id}', ${argument0});`;
  };
};
