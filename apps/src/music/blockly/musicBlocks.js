import {playSound, playSoundNextMeasure} from './blocks/samples';
import {ifEvenThen, loopFromTo} from './blocks/control';
import {arithmetic, number, random, round} from './blocks/math';
import {variablesGet, variablesSet} from './blocks/variables';
import {triggeredAt, whenRun} from './blocks/events';

// All blocks
const blockList = [
  whenRun,
  triggeredAt,
  playSound,
  playSoundNextMeasure,
  loopFromTo,
  ifEvenThen,
  number,
  round,
  arithmetic,
  random,
  variablesSet,
  variablesGet
];

const MUSIC_BLOCKS = {};

// Construct mapping of BlockType -> block data
for (let block of blockList) {
  MUSIC_BLOCKS[block.definition.type] = block;
}

export {MUSIC_BLOCKS};
