import {Input} from 'blockly';

export default class CdoInput extends Input {
  setStrictCheck(check: string | string[] | null) {
    this.setCheck(check);
  }

  getFieldRow() {
    return this.fieldRow;
  }
}
