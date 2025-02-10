import * as GoogleBlockly from 'blockly/core';

// The second parameter of CDO Blockly implementation of this class is
// a config object, which we are not currently using. In Google Blockly,
// the second parameter is an optional string for a class name. If the
// config option was used, errors would occur.
// The config option is specified for certain blocks in Jigsaw, Maze,
// Artist, and Play Lab. We can potentially add additional handling of
// this argument to this class in the future should we need it.
export default class CdoFieldLabel extends GoogleBlockly.FieldLabel {
  // An override for legacy labs like Jigsaw where the rendered block size is constant.
  fixedSize: {width: number; height: number} | undefined;

  constructor(
    value?: string | typeof GoogleBlockly.Field.SKIP_SETUP,
    customOptions?: {
      fixedSize?: {width: number; height: number};
    }
  ) {
    // Google Blockly also supports optional textClass and config parameters,
    // but these are unused.
    super(value);

    this.fixedSize = customOptions?.fixedSize;
  }

  updateSize_(margin?: number) {
    super.updateSize_(margin);
    if (this.fixedSize) {
      const {width, height} = this.fixedSize;
      this.size_ = new GoogleBlockly.utils.Size(width, height);
    }
  }
}
