import {BlockTypes} from './blockTypes';
import {playSound} from './blocks/samples';
import {ifEvenThen, loopFromTo} from './blocks/control';
import {number} from './blocks/math';
import {variablesGet, variablesSet} from './blocks/variables';
import {whenRun, whenTrigger} from './blocks/events';

export const ALL_BLOCKS = {
  [BlockTypes.WHEN_RUN]: whenRun,
  [BlockTypes.WHEN_TRIGGER]: whenTrigger,
  [BlockTypes.PLAY_SOUND]: playSound,
  [BlockTypes.LOOP_FROM_TO]: loopFromTo,
  [BlockTypes.IF_EVEN_THEN]: ifEvenThen,
  [BlockTypes.NUMBER]: number,
  [BlockTypes.VARIABLES_GET]: variablesGet,
  [BlockTypes.VARIABLES_SET]: variablesSet
};
