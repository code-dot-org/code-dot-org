import {
  newTrackAtMeasure,
  newTrackAtStart,
  playSound,
  playSoundAtCurrentLocation,
  playSoundInTrack,
  restInTrack,
  setCurrentLocationNextMeasure
} from './blocks/samples';
import {forLoop} from './blocks/control';
import {whenRun, triggeredAt, triggeredAtSimple} from './blocks/events';

// All blocks
const blockList = [
  whenRun,
  triggeredAt,
  triggeredAtSimple,
  playSound,
  playSoundAtCurrentLocation,
  setCurrentLocationNextMeasure,
  forLoop,
  newTrackAtStart,
  newTrackAtMeasure,
  playSoundInTrack,
  restInTrack
];

const MUSIC_BLOCKS = {};

// Construct mapping of BlockType -> block data
for (let block of blockList) {
  MUSIC_BLOCKS[block.definition.type] = block;
}

export {MUSIC_BLOCKS};
