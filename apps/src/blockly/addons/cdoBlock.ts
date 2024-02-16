import {Block} from 'blockly';

export default class CdoBlock extends Block {
  setStrictOutput(output: boolean, check: string | string[] | null) {
    this.setOutput(output, check);
  }

  // Override the original setOutput method with a custom version that
  // will handle the case when "None" is passed appropriately
  // See: https://github.com/code-dot-org/code-dot-org/blob/9d63cbcbfd84b8179ae2519adbb5869cbc319643/apps/src/blocklyAddons/cdoConstants.js#L9
  setOutput(isOutput: boolean, check: string | string[] | null) {
    if (check === 'None') {
      return super.setOutput(isOutput, null);
    } else {
      return super.setOutput(isOutput, check);
    }
  }

  // Google Blockly uses any here
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setTitleValue(newValue: any, name: string) {
    return this.setFieldValue(newValue, name);
  }

  // TODO: is this only used by cdo?
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  createProcedureDefinitionBlock() {}
}
