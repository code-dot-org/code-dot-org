import * as BlocklyCore from 'blockly/core';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';
import {commands as audioCommands} from '@cdo/apps/lib/util/audioApi';

import {playPreset, synthPresetOf, synthSoundUrl} from '../../soundEffects';

export const PLAY_SOUND_BLOCK_TYPE = 'spritelab2_playSound';
/** The toolbox's starting sound; the list itself starts with boom. */
export const PLAY_SOUND_DEFAULT = synthSoundUrl('jump');
export const FIELD_SOUND_DROPDOWN_TYPE = 'field_spritelab2_sound';

// Synthesized sounds (synth://name, see soundEffects.ts), then sound files
// by their sound:// URLs, each group alphabetical.
export const PLAY_SOUND_OPTIONS: [string, string][] = [
  ['boom', synthSoundUrl('boom')],
  ['ding', synthSoundUrl('coin')],
  ['hop', synthSoundUrl('jump')],
  ['siren', synthSoundUrl('alarm')],
  ['wah-wah', synthSoundUrl('fail')],
  ['zap', synthSoundUrl('laser')],
  ['alien ship', 'sound://category_whoosh/alien_ship_flyby_whoosh_3_slow.mp3'],
  ['boing', 'sound://category_digital/boing_2.mp3'],
  ['button', 'sound://category_app/app_button_1.mp3'],
  ['cat', 'sound://category_animals/cat.mp3'],
  ['coin', 'sound://category_collect/retro_game_coin_pickup_1.mp3'],
  ['crunch', 'sound://category_collect/clicky_crunch.mp3'],
  ['dog', 'sound://category_animals/dog.mp3'],
  ['harp', 'sound://category_instrumental/harpe_pluck_1.mp3'],
  ['jump', 'sound://category_digital/jump_7.mp3'],
  ['magic spell', 'sound://category_projectile/retro_game_magic_spell_6.mp3'],
  ['pop', 'sound://category_pop/bubble_pop_cluster_airy_1.mp3'],
  ['select', 'sound://category_retro/retro_game_ui_select_6.mp3'],
  ['tap', 'sound://category_tap/vibrant_positive_tap_1.mp3'],
  [
    'twinkle',
    'sound://category_bell/vibrant_game_bell_twinkle_positive_touch_1.mp3',
  ],
  ['win', 'sound://category_achievements/melodic_win_1.mp3'],
];

/**
 * The sound dropdown. Picking from the open menu plays the sound once, the
 * same way the block does at run time; a value set any other way (a saved
 * block loading) stays silent.
 */
export class SoundDropdown extends BlocklyCore.FieldDropdown {
  static fromJson(_options: BlocklyCore.FieldConfig) {
    return new SoundDropdown(PLAY_SOUND_OPTIONS);
  }

  protected override onItemSelected_(
    menu: BlocklyCore.Menu,
    menuItem: BlocklyCore.MenuItem
  ) {
    super.onItemSelected_(menu, menuItem);
    const url = this.getValue();
    const preset = synthPresetOf(url);
    if (preset) {
      playPreset(preset);
    } else if (url) {
      audioCommands.playSound({url, loop: false});
    }
  }
}

const definition: BlockJson = {
  type: PLAY_SOUND_BLOCK_TYPE,
  message0: 'play sound %1',
  args0: [{type: FIELD_SOUND_DROPDOWN_TYPE, name: 'SOUND'}],
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.DEFAULT,
  tooltip: 'Play a short sound once. Music keeps playing.',
};

const generator: GeneratorFunction = block =>
  `playSound(${JSON.stringify(block.getFieldValue('SOUND'))});\n`;

export default {definition, generator};
