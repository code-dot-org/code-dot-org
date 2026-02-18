import * as BlocklyCore from 'blockly/core';

type FillPatternBlock = BlocklyCore.Block & {
  fillPattern?: string;
  setFillPattern(pattern: string): void;
  getFillPattern(): string | undefined;
};

const JIGSAW_FILL_PATTERN_MIXIN = {
  setFillPattern(this: FillPatternBlock, pattern: string) {
    console.log('Setting fill pattern to ' + pattern);
    this.fillPattern = pattern;
  },

  getFillPattern(this: FillPatternBlock) {
    console.log('Getting fill pattern: ' + this.fillPattern);
    return this.fillPattern;
  },
};

Blockly.Extensions.registerMixin(
  'jigsaw_fill_pattern_mixin',
  JIGSAW_FILL_PATTERN_MIXIN
);
