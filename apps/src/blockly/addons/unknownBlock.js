export const UNKNOWN_BLOCK = {
  unknownBlock: true,
  init: function() {
    this.setHSV(0, 0, 0.8);
    this.appendDummyInput().appendField('unknown block', 'NAME');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};
