import type {BlockModeType} from './constants';
import type Generator from './Generator';
import {Sequencers} from './Generator';
import type {FunctionEvents} from './player/interfaces/FunctionEvents';
import type {PlaybackEvent} from './player/interfaces/PlaybackEvent';
import Simple2Sequencer from './player/sequencer/Simple2Sequencer';

export type PlaybackExecutionData = {
  playbackEvents: PlaybackEvent[];
  orderedFunctions: FunctionEvents[];
  lastMeasure: number;
};

export type ExecutionErrorHandler = (error: Error) => void;

export const emptyPlaybackData = (): PlaybackExecutionData => ({
  playbackEvents: [],
  orderedFunctions: [],
  lastMeasure: 0,
});

/** A hook that throws still yields whatever it sequenced before throwing. */
export function callUserGeneratedCode(
  fn: (...args: unknown[]) => void,
  args: unknown[],
  blockMode: BlockModeType,
  onError: ExecutionErrorHandler,
): PlaybackExecutionData {
  const sequencer = Sequencers[blockMode];
  sequencer.clear();
  try {
    fn(...args);
  } catch (e) {
    onError(e as Error);
  }

  return {
    playbackEvents: sequencer.getPlaybackEvents(),
    orderedFunctions:
      sequencer instanceof Simple2Sequencer
        ? sequencer.getOrderedFunctions()
        : [],
    lastMeasure: sequencer.getLastMeasure(),
  };
}

export function mergePlaybackData(
  currentData: PlaybackExecutionData,
  newData: PlaybackExecutionData,
) {
  currentData.playbackEvents.push(...newData.playbackEvents);
  currentData.orderedFunctions.push(...newData.orderedFunctions);
  currentData.lastMeasure = Math.max(
    currentData.lastMeasure,
    newData.lastMeasure,
  );
}

/** The part of a song that plays without any trigger being pressed. */
export function executeWhenRun(
  generator: Generator,
  blockMode: BlockModeType,
  onError: ExecutionErrorHandler,
): PlaybackExecutionData {
  const data = emptyPlaybackData();
  const hook = generator.hooks.whenRunButton;
  if (hook) {
    mergePlaybackData(
      data,
      callUserGeneratedCode(hook, [0], blockMode, onError),
    );
  }
  return data;
}
