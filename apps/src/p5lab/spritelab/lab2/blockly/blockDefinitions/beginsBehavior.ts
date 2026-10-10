import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {noteImageFieldValue} from '../../imageReferences';
import {FIELD_COSTUME_TYPE} from '../imagePickerFields';

export const BEGINS_BEHAVIOR_BLOCK_TYPE = 'spritelab2_beginsBehavior';

/** The dropdown's behaviours: label, and the helper that makes one. */
export const BEHAVIOR_OPTIONS: [string, string][] = [
  ['patrolling left and right on blocks', 'patrollingOnBlocks'],
  ['wandering on blocks', 'wanderingOnBlocks'],
  ['following the player', 'followingPlayerOnBlocks'],
  ['floating', 'floating'],
];

/** "[sprite] begins [behaviour]" in one block, the behaviour chosen from a
    dropdown rather than plugged in as a value block. */
const definition: BlockJson = {
  type: BEGINS_BEHAVIOR_BLOCK_TYPE,
  message0: '%1 begins %2',
  args0: [
    {type: FIELD_COSTUME_TYPE, name: 'SPRITE'},
    {type: 'field_dropdown', name: 'BEHAVIOR', options: BEHAVIOR_OPTIONS},
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.DEFAULT,
  tooltip: 'Give a sprite something to do on its own.',
};

const generator: GeneratorFunction = block =>
  `addBehaviorSimple({costume: ${noteImageFieldValue(
    block.getFieldValue('SPRITE')
  )}}, ${block.getFieldValue('BEHAVIOR')}());\n`;

// A bob about the sprite's resting height, after the Oceans fish: an
// eight pixel swing over about three seconds, each sprite starting at its
// own point in the wave so neighbours do not bob in step.
export const FLOAT_SWING_PX = 8;
export const FLOAT_PERIOD_TICKS = 180;

const helperCode = [
  'function floating() {',
  '  return {',
  '    func: function (spriteId) {',
  "      var tick = getProp(spriteId, 'floatTick');",
  '      if (tick == undefined) {',
  '        tick = 0;',
  "        setProp(spriteId, 'floatBaseY', getProp(spriteId, 'y'));",
  "        setProp(spriteId, 'floatPhase', (randomNumber(0, 359) * Math.PI) / 180);",
  '      }',
  '      var angle =',
  `        (tick / ${FLOAT_PERIOD_TICKS}) * 2 * Math.PI + getProp(spriteId, 'floatPhase');`,
  "      setProp(spriteId, 'y',",
  `        getProp(spriteId, 'floatBaseY') + ${FLOAT_SWING_PX} * Math.sin(angle));`,
  "      setProp(spriteId, 'floatTick', tick + 1);",
  '    },',
  "    name: 'floating',",
  '  };',
  '}',
].join('\n');

export default {definition, generator, helperCode};
