export const UNKNOWN_BLOCK = {
  unknownBlock: true,
  init: function () {
    Blockly.cdoUtils.setHSV(this, 0, 0, 0.8);
    this.appendDummyInput().appendField('unknown block', 'NAME');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  },
};
