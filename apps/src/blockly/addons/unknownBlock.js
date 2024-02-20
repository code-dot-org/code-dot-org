export const UNKNOWN_BLOCK = {
  unknownBlock: true,
  init: function () {
    // Unknown blocks use a hard-coded HSV color and are not compatible with themes.
    Blockly.cdoUtils.handleColorAndStyle(this, [0, 0, 0.8]);
    this.appendDummyInput().appendField('unknown block', 'NAME');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  },
};
