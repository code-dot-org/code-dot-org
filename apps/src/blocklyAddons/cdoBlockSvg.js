import GoogleBlockly from 'blockly/core';

export default class BlockSvg extends GoogleBlockly.BlockSvg {
  getTitles() {
    let fields = [];
    this.inputList.forEach(input => {
      input.fieldRow.forEach(field => {
        fields.push(field);
      });
    });
    return fields;
  }

  getTitleValue(name) {
    return super.getFieldValue(name);
  }

  isUserVisible() {
    return false; // TODO
  }

  setHSV(h, s, v) {
    return super.setColour(Blockly.utils.colour.hsvToHex(h, s, v * 255));
  }
}
