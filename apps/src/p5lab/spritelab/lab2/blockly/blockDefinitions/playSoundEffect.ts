import * as BlocklyCore from 'blockly/core';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {
  asSoundEffect,
  LENGTHS,
  PATTERNS,
  PITCHES,
  playSoundEffect,
  SoundEffect,
  WAVES,
} from '../../soundEffects';

export const PLAY_SOUND_EFFECT_BLOCK_TYPE = 'spritelab2_playSoundEffect';
export const FIELD_EFFECT_OPTION_TYPE = 'field_spritelab2_effect_option';

export const EFFECT_FIELDS = ['WAVE', 'PITCH', 'LENGTH', 'PATTERN'] as const;

/** The toolbox's starting choices: a jump. */
export const EFFECT_FIELD_DEFAULTS: Record<
  (typeof EFFECT_FIELDS)[number],
  string
> = {WAVE: 'square', PITCH: 'high', LENGTH: 'short', PATTERN: 'slide up'};

/** The block's four choices as an effect, or null while any is unset. */
export function effectOf(
  block: {getFieldValue(name: string): string | null} | null
): SoundEffect | null {
  if (!block) {
    return null;
  }
  const [wave, pitch, length, pattern] = EFFECT_FIELDS.map(name =>
    block.getFieldValue(name)
  );
  return asSoundEffect(wave, pitch, length, pattern);
}

/**
 * One of the block's dropdowns. Picking from the open menu plays the
 * block's whole sound once, the same way the block does at run time; a
 * value set any other way (a saved block loading) stays silent.
 */
export class EffectOptionDropdown extends BlocklyCore.FieldDropdown {
  static fromJson(options: BlocklyCore.FieldDropdownFromJsonConfig) {
    if (!options.options) {
      throw new Error(`${FIELD_EFFECT_OPTION_TYPE} needs options`);
    }
    return new EffectOptionDropdown(options.options, undefined, options);
  }

  protected override onItemSelected_(
    menu: BlocklyCore.Menu,
    menuItem: BlocklyCore.MenuItem
  ) {
    super.onItemSelected_(menu, menuItem);
    const effect = effectOf(this.getSourceBlock());
    if (effect) {
      playSoundEffect(effect);
    }
  }
}

const options = (values: readonly string[]): [string, string][] =>
  values.map(value => [value, value]);

const definition: BlockJson = {
  type: PLAY_SOUND_EFFECT_BLOCK_TYPE,
  message0: 'play sound effect %1 %2 %3 %4',
  // Cast: ArgumentJson ties `options` to type 'field_dropdown'.
  args0: [
    {type: FIELD_EFFECT_OPTION_TYPE, name: 'WAVE', options: options(WAVES)},
    {type: FIELD_EFFECT_OPTION_TYPE, name: 'PITCH', options: options(PITCHES)},
    {
      type: FIELD_EFFECT_OPTION_TYPE,
      name: 'LENGTH',
      options: options(LENGTHS),
    },
    {
      type: FIELD_EFFECT_OPTION_TYPE,
      name: 'PATTERN',
      options: options(PATTERNS),
    },
  ] as BlockJson['args0'],
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.DEFAULT,
  tooltip:
    'Make up a short sound: pick the wave, how high, how long, and how it ' +
    'moves.',
};

const generator: GeneratorFunction = block =>
  `playSoundEffect(${EFFECT_FIELDS.map(name =>
    JSON.stringify(block.getFieldValue(name))
  ).join(', ')});\n`;

export default {definition, generator};
