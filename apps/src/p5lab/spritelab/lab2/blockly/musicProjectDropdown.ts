import * as BlocklyCore from 'blockly/core';

import {getStore} from '@cdo/apps/redux';

import {MusicProjectOption} from '../redux/spriteLab2Redux';

export const FIELD_MUSIC_PROJECT_DROPDOWN_TYPE =
  'field_spritelab2_music_project';

// Options: [song name, channel]. The list is fetched once per level; a song
// made while the lab is open shows up on the next visit. A placeholder for
// a saved song the list cannot offer exists to validate that block's value,
// so it is listed only on the field already holding it — never offered as a
// new choice. Blockly binds the generator to the field.
function musicProjectMenuOptions(
  this: BlocklyCore.Field | undefined
): [string, string][] {
  const projects: MusicProjectOption[] =
    getStore().getState().spriteLab2?.musicProjects || [];
  const own = this?.getValue?.();
  const offered = projects.filter(p => !p.unavailable || p.channel === own);
  if (offered.length === 0) {
    return [['no songs yet', '']];
  }
  return offered.map(p => [p.name, p.channel]);
}

export class MusicProjectDropdown extends BlocklyCore.FieldDropdown {
  static fromJson(_options: BlocklyCore.FieldConfig) {
    return new MusicProjectDropdown(musicProjectMenuOptions);
  }
}
