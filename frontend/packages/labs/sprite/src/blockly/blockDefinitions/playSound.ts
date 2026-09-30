import * as BlocklyCore from 'blockly/core';

import {PluginType, type FieldPlugin} from '@code-dot-org/blockly/plugins';

import {playSound} from '../../audio/sounds';
import {BlockStyles} from '../constants';
import {type BlockJson, type GeneratorFunction} from '../types';

export const PLAY_SOUND_BLOCK_TYPE = 'spritelab2_playSound';
export const FIELD_SOUND_DROPDOWN_TYPE = 'field_spritelab2_sound';

// Values are the sound:// URLs the playSound command resolves.
export const PLAY_SOUND_OPTIONS: [string, string][] = [
  ['pop', 'sound://category_pop/bubble_pop_cluster_airy_1.mp3'],
  ['boing', 'sound://category_digital/boing_2.mp3'],
  ['jump', 'sound://category_digital/jump_7.mp3'],
  ['coin', 'sound://category_collect/retro_game_coin_pickup_1.mp3'],
  ['win', 'sound://category_achievements/melodic_win_1.mp3'],
  [
    'twinkle',
    'sound://category_bell/vibrant_game_bell_twinkle_positive_touch_1.mp3',
  ],
  ['magic spell', 'sound://category_projectile/retro_game_magic_spell_6.mp3'],
  ['select', 'sound://category_retro/retro_game_ui_select_6.mp3'],
  ['tap', 'sound://category_tap/vibrant_positive_tap_1.mp3'],
  ['button', 'sound://category_app/app_button_1.mp3'],
  ['crunch', 'sound://category_collect/clicky_crunch.mp3'],
  ['alien ship', 'sound://category_whoosh/alien_ship_flyby_whoosh_3_slow.mp3'],
  ['harp', 'sound://category_instrumental/harpe_pluck_1.mp3'],
  ['cat', 'sound://category_animals/cat.mp3'],
  ['dog', 'sound://category_animals/dog.mp3'],
];

/**
 * The sound dropdown. Picking from the open menu plays the sound once, the
 * same way the block does at run time; a value set any other way (a saved
 * block loading) stays silent.
 */
export class SoundDropdown extends BlocklyCore.FieldDropdown {
  static fromJson() {
    return new SoundDropdown(PLAY_SOUND_OPTIONS);
  }

  protected override onItemSelected_(
    menu: BlocklyCore.Menu,
    menuItem: BlocklyCore.MenuItem,
  ) {
    super.onItemSelected_(menu, menuItem);
    const url = this.getValue();
    if (url) {
      playSound(url);
    }
  }
}

export const SOUND_DROPDOWN_FIELD: FieldPlugin = {
  type: PluginType.Field,
  name: FIELD_SOUND_DROPDOWN_TYPE,
  field: SoundDropdown,
};

const definition: BlockJson = {
  type: PLAY_SOUND_BLOCK_TYPE,
  message0: 'play sound %1',
  args0: [{type: SOUND_DROPDOWN_FIELD, name: 'SOUND'}],
  previousStatement: true,
  nextStatement: true,
  style: BlockStyles.DEFAULT,
  tooltip: 'Play a short sound once. Music keeps playing.',
};

const generator: GeneratorFunction = block =>
  `playSound(${JSON.stringify(block.getFieldValue('SOUND'))});\n`;

export default {definition, generator};
