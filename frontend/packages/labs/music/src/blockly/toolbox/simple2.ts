import type {ToolboxCategory} from '@code-dot-org/blockly-workspace';
import {Blockly} from '@code-dot-org/blockly-workspace';

import {BlockTypes} from '../blockTypes';
import {
  FIELD_EFFECTS_NAME,
  FIELD_EFFECTS_VALUE,
  DEFAULT_EFFECT_VALUE,
} from '../constants';

const toolbox: ToolboxCategory[] = [
  {
    name: 'Sounds',
    blocks: [
      BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION_SIMPLE2,
      BlockTypes.PLAY_PATTERN_AT_CURRENT_LOCATION_SIMPLE2,
      BlockTypes.PLAY_PATTERN_AI_AT_CURRENT_LOCATION_SIMPLE2,
      BlockTypes.PLAY_TUNE_AT_CURRENT_LOCATION_SIMPLE2,
      BlockTypes.PLAY_CHORD_AT_CURRENT_LOCATION_SIMPLE2,
      BlockTypes.PLAY_REST_AT_CURRENT_LOCATION_SIMPLE2,
    ],
  },
  {
    name: 'Control',
    blocks: [
      BlockTypes.TRIGGERED_AT_SIMPLE2,
      BlockTypes.PLAY_SOUNDS_TOGETHER,
      BlockTypes.PLAY_SOUNDS_SEQUENTIAL,
      BlockTypes.PLAY_SOUNDS_RANDOM,
      BlockTypes.REPEAT_SIMPLE2,
    ],
  },
  {
    name: 'Effects',
    blocks: [
      {
        kind: 'block',
        type: BlockTypes.SET_EFFECT_AT_CURRENT_LOCATION_SIMPLE2,
        fields: {
          [FIELD_EFFECTS_NAME]: 'volume',
          [FIELD_EFFECTS_VALUE]: DEFAULT_EFFECT_VALUE,
        },
      },
      {
        kind: 'block',
        type: BlockTypes.SET_EFFECT_AT_CURRENT_LOCATION_SIMPLE2,
        fields: {
          [FIELD_EFFECTS_NAME]: 'filter',
          [FIELD_EFFECTS_VALUE]: DEFAULT_EFFECT_VALUE,
        },
      },
      {
        kind: 'block',
        type: BlockTypes.SET_EFFECT_AT_CURRENT_LOCATION_SIMPLE2,
        fields: {
          [FIELD_EFFECTS_NAME]: 'delay',
          [FIELD_EFFECTS_VALUE]: DEFAULT_EFFECT_VALUE,
        },
      },
    ],
  },
  {
    name: 'Functions',
    blocks: [
      {
        // Function define block
        kind: 'block',
        type: BlockTypes.FUNCTION_DEFINITION,
        fields: {
          NAME: 'my function',
        },
      },
    ],
    key: 'musicLabFunctions',
    onLoad: (workspace: Blockly.WorkspaceSvg) => {
      // Gather existing functions and create function call blocks
      console.log(workspace);
      console.log(Blockly.Procedures.allProcedures(workspace));
      console.log(
        workspace
          .getAllBlocks()
          .filter(block => block.type === BlockTypes.FUNCTION_DEFINITION),
      );
      return workspace
        .getAllBlocks()
        .filter(block => block.type === BlockTypes.FUNCTION_DEFINITION)
        .map(block => ({
          kind: 'block',
          type: BlockTypes.FUNCTION_CALL,
          fields: {
            NAME: block.getFieldValue('NAME'),
          },
        }));
    },
  },
];

export default toolbox;
