import * as BlocklyCore from 'blockly/core';

import {getStore} from '@cdo/apps/redux';

import {MusicProjectOption} from '../redux/spriteLab2Redux';

export const FIELD_MUSIC_PROJECT_DROPDOWN_TYPE =
  'field_spritelab2_music_project';

// Options: [song name, channel]. The list is fetched once per level; a song
// made while the lab is open shows up on the next visit.
function musicProjectMenuOptions(): [string, string][] {
  const projects: MusicProjectOption[] =
    getStore().getState().spriteLab2?.musicProjects || [];
  if (projects.length === 0) {
    return [['no songs yet', '']];
  }
  return projects.map(p => [p.name, p.channel]);
}

export class MusicProjectDropdown extends BlocklyCore.FieldDropdown {
  static fromJson(_options: BlocklyCore.FieldConfig) {
    return new MusicProjectDropdown(musicProjectMenuOptions);
  }
}
