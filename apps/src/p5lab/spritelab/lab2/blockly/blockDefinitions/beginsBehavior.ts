import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {noteImageFieldValue} from '../../imageReferences';
import {FIELD_COSTUME_TYPE} from '../imagePickerFields';

import {WALKERS_HELPER_CODE} from './walkingOnBlocks';

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

// The Oceans fish sway: one slow clock, 20 seconds a cycle, that each
// sprite joins at its own point; sideways swings 25 px at twice that rate
// and up and down 8 px at six times it, so the drift and the bob never
// line up.
export const FLOAT_CYCLE_TICKS = 1200;
export const FLOAT_SWAY_X_PX = 25;
export const FLOAT_SWAY_Y_PX = 8;
export const FLOAT_X_RATE = 2;
export const FLOAT_Y_RATE = 6;

const FLOATING_HELPER_CODE = [
  'function floating() {',
  '  return {',
  '    func: function (spriteId) {',
  "      var tick = getProp(spriteId, 'floatTick');",
  '      if (tick == undefined) {',
  '        tick = 0;',
  "        setProp(spriteId, 'floatBaseX', getProp(spriteId, 'x'));",
  "        setProp(spriteId, 'floatBaseY', getProp(spriteId, 'y'));",
  "        setProp(spriteId, 'floatPhase', (randomNumber(0, 359) * Math.PI) / 180);",
  '      }',
  '      var angle =',
  `        (tick / ${FLOAT_CYCLE_TICKS}) * 2 * Math.PI + getProp(spriteId, 'floatPhase');`,
  "      setProp(spriteId, 'x',",
  `        getProp(spriteId, 'floatBaseX') + ${FLOAT_SWAY_X_PX} * Math.sin(angle * ${FLOAT_X_RATE}));`,
  "      setProp(spriteId, 'y',",
  `        getProp(spriteId, 'floatBaseY') + ${FLOAT_SWAY_Y_PX} * Math.sin(angle * ${FLOAT_Y_RATE}));`,
  "      setProp(spriteId, 'floatTick', tick + 1);",
  '    },',
  "    name: 'floating',",
  '  };',
  '}',
].join('\n');

const helperCode = `${WALKERS_HELPER_CODE}\n${FLOATING_HELPER_CODE}`;

export default {definition, generator, helperCode};
