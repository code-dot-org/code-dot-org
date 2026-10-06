import * as BlocklyCore from 'blockly/core';

import playSoundEffect, {
  EFFECT_FIELD_DEFAULTS,
  EffectOptionDropdown,
  effectOf,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/playSoundEffect';
import * as soundEffects from '@cdo/apps/p5lab/spritelab/lab2/soundEffects';

jest.mock('@cdo/apps/p5lab/spritelab/lab2/soundEffects', () => ({
  ...jest.requireActual('@cdo/apps/p5lab/spritelab/lab2/soundEffects'),
  playSoundEffect: jest.fn(),
}));

const played = soundEffects.playSoundEffect as jest.Mock;

function blockWith(values: Record<string, string | null>) {
  return {getFieldValue: (name: string) => values[name] ?? null};
}

describe('spritelab2_playSoundEffect', () => {
  // A field with a source block fires a change event on setValue; the fake
  // block is no workspace member.
  beforeEach(() => {
    played.mockClear();
    BlocklyCore.Events.disable();
  });

  afterEach(() => BlocklyCore.Events.enable());

  it('offers every option of each list as a dropdown', () => {
    const {args0} = playSoundEffect.definition as unknown as {
      args0: {name: string; options: [string, string][]}[];
    };
    expect(args0.map(arg => arg.name)).toEqual([
      'WAVE',
      'PITCH',
      'LENGTH',
      'PATTERN',
    ]);
    expect(args0[0].options.map(([, value]) => value)).toEqual([
      ...soundEffects.WAVES,
    ]);
    expect(args0[3].options.map(([, value]) => value)).toEqual([
      ...soundEffects.PATTERNS,
    ]);
  });

  it('starts in the toolbox with a sound every list offers', () => {
    expect(
      effectOf(blockWith(EFFECT_FIELD_DEFAULTS as Record<string, string>))
    ).not.toBeNull();
  });

  it('reads the four choices off a block', () => {
    expect(
      effectOf(
        blockWith({
          WAVE: 'sine',
          PITCH: 'low',
          LENGTH: 'long',
          PATTERN: 'run down',
        })
      )
    ).toEqual({
      wave: 'sine',
      pitch: 'low',
      length: 'long',
      pattern: 'run down',
    });
    expect(effectOf(blockWith({WAVE: 'sine'}))).toBeNull();
    expect(effectOf(null)).toBeNull();
  });

  it('plays the whole sound when a choice is picked from a menu, not when set', () => {
    const field = new EffectOptionDropdown([
      ['steady', 'steady'],
      ['slide up', 'slide up'],
    ]);
    const block = blockWith({
      WAVE: 'triangle',
      PITCH: 'middle',
      LENGTH: 'short',
      PATTERN: 'steady',
    });
    (field as unknown as {sourceBlock_: unknown}).sourceBlock_ = block;
    field.setValue('slide up');
    expect(played).not.toHaveBeenCalled();
    const menuItem = {getValue: () => 'steady'} as never;
    (
      field as unknown as {onItemSelected_: (m: never, i: never) => void}
    ).onItemSelected_({} as never, menuItem);
    expect(played).toHaveBeenCalledTimes(1);
    expect(played).toHaveBeenCalledWith({
      wave: 'triangle',
      pitch: 'middle',
      length: 'short',
      pattern: 'steady',
    });
  });

  it('generates a playSoundEffect call with the four choices', () => {
    const block = blockWith({
      WAVE: 'square',
      PITCH: 'high',
      LENGTH: 'short',
      PATTERN: 'slide up',
    });
    expect(playSoundEffect.generator(block as never, {} as never)).toBe(
      'playSoundEffect("square", "high", "short", "slide up");\n'
    );
  });
});
