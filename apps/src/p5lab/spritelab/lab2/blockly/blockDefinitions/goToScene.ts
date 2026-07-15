import * as BlocklyCore from 'blockly/core';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';
import {getStore} from '@cdo/apps/redux';

export const GO_TO_SCENE_BLOCK_TYPE = 'spritelab2_goToScene';
export const FIELD_SCENE_DROPDOWN_TYPE = 'field_spritelab2_scene';

// Dropdown options: [friendly name, scene id]. The id is the saved value.
// Reads the redux mirror so the menu stays current as scenes are added.
function sceneMenuOptions(): [string, string][] {
  const scenes = getStore().getState().spriteLab2?.scenes || [];
  if (scenes.length === 0) {
    return [['no scenes', '']];
  }
  return scenes.map((s: {id: string; name: string}) => [s.name, s.id]);
}

// Registered field type (see setup.ts) so the JSON definition gets a dropdown
// with dynamic options.
export class SceneDropdown extends BlocklyCore.FieldDropdown {
  static fromJson(_options: BlocklyCore.FieldConfig) {
    return new SceneDropdown(sceneMenuOptions);
  }
}

const definition: BlockJson = {
  type: GO_TO_SCENE_BLOCK_TYPE,
  message0: 'go to scene %1',
  args0: [{type: FIELD_SCENE_DROPDOWN_TYPE, name: 'SCENE'}],
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.DEFAULT,
  tooltip:
    'Stop this scene and start the chosen one. Its "when run" code runs ' +
    'after a quick fade from black.',
};

const generator: GeneratorFunction = block =>
  `goToScene(${JSON.stringify(block.getFieldValue('SCENE'))});\n`;

export default {definition, generator};
