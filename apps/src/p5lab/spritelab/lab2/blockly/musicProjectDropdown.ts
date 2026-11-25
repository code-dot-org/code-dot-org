import * as BlocklyCore from 'blockly/core';

import {BLOCK_LABELS} from '@cdo/apps/blockly/utils/localization/blockDefinitions';
import {translateFilled} from '@cdo/apps/localization/templates';
import {getStore} from '@cdo/apps/redux';

import {MusicProjectOption} from '../redux/spriteLab2Redux';

export const FIELD_MUSIC_PROJECT_DROPDOWN_TYPE =
  'field_spritelab2_music_project';

// Options: [song name, channel], from the once-per-level list. A
// placeholder for a saved song the list cannot offer keeps that block's
// value valid, so it is listed only on the field already holding it, never
// offered as a new choice. Blockly binds the generator to the field.
function musicProjectMenuOptions(
  this: BlocklyCore.Field | undefined
): [string, string][] {
  const projects: MusicProjectOption[] =
    getStore().getState().spriteLab2?.musicProjects || [];
  const own = this?.getValue?.();
  const offered = projects.filter(p => !p.unavailable || p.channel === own);
  if (offered.length === 0) {
    return [[translateFilled('no songs yet', {}, BLOCK_LABELS), '']];
  }
  return offered.map(p => [p.name, p.channel]);
}

export class MusicProjectDropdown extends BlocklyCore.FieldDropdown {
  static fromJson(_options: BlocklyCore.FieldConfig) {
    return new MusicProjectDropdown(musicProjectMenuOptions);
  }
}
