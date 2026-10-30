import * as BlocklyCore from 'blockly/core';

import whenPlayer, {
  EVENT_HAT_EXTENSION,
  eventHat,
  WHEN_PLAYER_OPTIONS,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/whenPlayer';
import {PLAYER_ACTIONS} from '@cdo/apps/p5lab/spritelab/lab2/playerActions';

const prefixLines = BlocklyCore.CodeGenerator.prototype.prefixLines;

describe('spritelab2_whenPlayer', () => {
  it('offers each player action once', () => {
    expect(WHEN_PLAYER_OPTIONS.map(([, value]) => value)).toEqual([
      ...PLAYER_ACTIONS,
    ]);
  });

  it('is a hat: a next connection and no previous one', () => {
    expect(whenPlayer.definition.nextStatement).toBeNull();
    expect(whenPlayer.definition.previousStatement).toBeUndefined();
  });

  it('marks itself as created so its chain is not generated twice', () => {
    expect(whenPlayer.definition.extensions).toContain(EVENT_HAT_EXTENSION);
    const block = {skipNextBlockGeneration: false};
    eventHat.call(block as never);
    expect(block.skipNextBlockGeneration).toBe(true);
  });

  it('wraps the blocks below it in a handler', () => {
    const next = {};
    const javascript = {
      blockToCode: jest.fn(() => 'playSound("synth://jump");\n'),
      prefixLines,
    };
    const block = {
      getFieldValue: () => 'jump',
      nextConnection: {targetBlock: () => next},
    };
    const code = whenPlayer.generator(block as never, javascript as never);
    expect(javascript.blockToCode).toHaveBeenCalledWith(next, false);
    expect(code).toBe(
      'whenPlayer("jump", function () {\n  playSound("synth://jump");\n});\n'
    );
  });

  it('generates an empty handler with nothing below it', () => {
    const block = {
      getFieldValue: () => 'walk',
      nextConnection: {targetBlock: () => null},
    };
    expect(whenPlayer.generator(block as never, {prefixLines} as never)).toBe(
      'whenPlayer("walk", function () {\n});\n'
    );
  });
});
