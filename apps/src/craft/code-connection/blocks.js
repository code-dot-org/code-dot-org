// Install extensions to Blockly's language and JavaScript generator.
export const install = (blockly, blockInstallOptions) => {
  blockly.Blocks.craft_waitOneSecond = {
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel('wait 1 second'));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_waitOneSecond = function () {
    return `delay('block_id_${this.id}', 1000);`;
  };

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

  blockly.Blocks.craft_callNativeAsync = {
    init: function () {
      this.setHSV(258, 0.35, 0.62);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel('prompt for value'));
      this.setOutput(true, Blockly.BlockValueType.NUMBER);
    }
  };

  blockly.JavaScript.craft_callNativeAsync = function () {
    return [`prompt('block_id_${this.id}')`, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  };
};
