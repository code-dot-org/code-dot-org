import * as BlocklyCore from 'blockly/core';

import {PluginType, type FieldPlugin} from '@code-dot-org/blockly/plugins';

import {type MusicProjectOption} from '../redux/spriteLab2Redux';
import store from '../redux/store';

export const FIELD_MUSIC_PROJECT_DROPDOWN_TYPE =
  'field_spritelab2_music_project';

// Options: [song name, channel], from the once-per-level list. A
// placeholder for a saved song the list cannot offer keeps that block's
// value valid, so it is listed only on the field already holding it, never
// offered as a new choice. Blockly binds the generator to the field.
function musicProjectMenuOptions(
  this: BlocklyCore.Field | undefined,
): [string, string][] {
  const projects: MusicProjectOption[] =
    store.getState().spriteLab2?.musicProjects || [];
  const own = this?.getValue?.();
  const offered = projects.filter(p => !p.unavailable || p.channel === own);
  if (offered.length === 0) {
    return [['no songs yet', '']];
  }
  return offered.map(p => [p.name, p.channel]);
}

export class MusicProjectDropdown extends BlocklyCore.FieldDropdown {
  static fromJson() {
    return new MusicProjectDropdown(musicProjectMenuOptions);
  }
}

export const MUSIC_PROJECT_DROPDOWN_FIELD: FieldPlugin = {
  type: PluginType.Field,
  name: FIELD_MUSIC_PROJECT_DROPDOWN_TYPE,
  field: MusicProjectDropdown,
};
