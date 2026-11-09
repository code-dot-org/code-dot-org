import * as BlocklyCore from 'blockly/core';

import {EVENT_HAT_EXTENSION} from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/whenPlayer';
import whenPlayerStepsOn from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/whenPlayerStepsOn';

jest.mock('@cdo/apps/p5lab/spritelab/lab2/blockly/imagePickerFields', () => ({
  FIELD_BLOCK_IMAGE_TYPE: 'field_spritelab2_block_image',
}));

const prefixLines = BlocklyCore.CodeGenerator.prototype.prefixLines;

describe('spritelab2_whenPlayerStepsOn', () => {
  it('is a hat with a block image picker', () => {
    const {definition} = whenPlayerStepsOn;
    expect(definition.nextStatement).toBeNull();
    expect(definition.previousStatement).toBeUndefined();
    expect(definition.extensions).toContain(EVENT_HAT_EXTENSION);
    expect(definition.args0).toEqual([
      {type: 'field_spritelab2_block_image', name: 'ANIMATION_NAME'},
    ]);
  });

  it('wraps the blocks below it in a handler for the chosen image', () => {
    const next = {};
    const javascript = {
      blockToCode: jest.fn(() => 'playSound("synth://jump");\n'),
      prefixLines,
    };
    const block = {
      getFieldValue: () => '"lava"',
      nextConnection: {targetBlock: () => next},
    };
    const code = whenPlayerStepsOn.generator(
      block as never,
      javascript as never
    );
    expect(javascript.blockToCode).toHaveBeenCalledWith(next, false);
    expect(code).toBe(
      'whenPlayerStepsOn("lava", function () {\n' +
        '  playSound("synth://jump");\n' +
        '});\n'
    );
  });

  it('passes an unchosen image through as null', () => {
    const block = {
      getFieldValue: () => null,
      nextConnection: {targetBlock: () => null},
    };
    expect(
      whenPlayerStepsOn.generator(block as never, {prefixLines} as never)
    ).toBe('whenPlayerStepsOn(null, function () {\n});\n');
  });
});
