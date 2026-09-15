import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

export const PLAY_SOUND_BLOCK_TYPE = 'spritelab2_playSound';

// A short list with broad appeal, drawn from the legacy sound library. The
// legacy block offers all 1,582 sounds through a picker dialog; this one
// trades that range for a menu a student can scan. Values are the same
// sound:// URLs the legacy playSound command resolves.
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

const definition: BlockJson = {
  type: PLAY_SOUND_BLOCK_TYPE,
  message0: 'play sound %1',
  args0: [{type: 'field_dropdown', name: 'SOUND', options: PLAY_SOUND_OPTIONS}],
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.DEFAULT,
  tooltip: 'Play a short sound once. Music keeps playing.',
};

const generator: GeneratorFunction = block =>
  `playSound(${JSON.stringify(block.getFieldValue('SOUND'))});\n`;

export default {definition, generator};
