import * as GoogleBlockly from 'blockly/core';

// The second parameter of CDO Blockly implementation of this class is
// a config object, which we are not currently using. In Google Blockly,
// the second parameter is an optional string for a class name. If the
// config option was used, errors would occur.
// The config option is specified for certain blocks in Jigsaw, Maze,
// Artist, and Play Lab. We can potentially add additional handling of
// this argument to this class in the future should we need it.
export default class CdoFieldLabel extends GoogleBlockly.FieldLabel {
  constructor(
    value?: string | typeof GoogleBlockly.Field.SKIP_SETUP,
    styleConfig?: string | object,
    config?: GoogleBlockly.FieldLabelConfig
  ) {
    let textClass = undefined;
    if (typeof styleConfig === 'string') {
      textClass = styleConfig;
    }
    super(value, textClass, config);
  }
}
