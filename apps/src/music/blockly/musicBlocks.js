import {playSample, playSound, sample} from './blocks/samples';
import {forLoop, loopFromTo} from './blocks/control';
import {arithmetic, number, random, round} from './blocks/math';
import {variablesGet, variablesSet} from './blocks/variables';
import {triggeredAt, whenRun} from './blocks/events';
import {simpleIf, logicCompare} from './blocks/logic';

// All blocks
const blockList = [
  whenRun,
  triggeredAt,
  playSound,
  playSample,
  sample,
  loopFromTo,
  forLoop,
  number,
  round,
  arithmetic,
  random,
  variablesSet,
  variablesGet,
  simpleIf,
  logicCompare
];

const MUSIC_BLOCKS = {};

// Construct mapping of BlockType -> block data
for (let block of blockList) {
  MUSIC_BLOCKS[block.definition.type] = block;
}

export {MUSIC_BLOCKS};
