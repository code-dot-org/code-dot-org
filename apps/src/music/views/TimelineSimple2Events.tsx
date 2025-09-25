import React, {useCallback, useMemo, memo} from 'react';

import AppConfig from '../appConfig';
import {BlockTypes} from '../blockly/blockTypes';
import {collectBlockIdsRecursively} from '../blockly/blockUtils';
import {MAX_FUNCTION_BOUNDS_RENDER_DEPTH} from '../constants';
import {FunctionEvents} from '../player/interfaces/FunctionEvents';
import {PlaybackEvent} from '../player/interfaces/PlaybackEvent';

import TimelineElement from './TimelineElement';
import {useMusicSelector} from './types';

const timelineLayoutParam = AppConfig.getValue('timeline-layout');

/**
 * Compute the extents for the given function, given the list of unique sounds and all functions.
 * Returns null if the function doesn't generate any sound events and doesn't call any functions.
 */
interface FunctionExtents {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

const getFunctionExtents = (
  orderedFunction: FunctionEvents,
  uniqueSounds: string[],
  orderedFunctions: FunctionEvents[],
  depth: number = 0
): FunctionExtents | null => {
  let left = Number.MAX_SAFE_INTEGER,
    top = Number.MAX_SAFE_INTEGER,
    right = 0,
    bottom = 0;

  if (
    orderedFunction.playbackEvents.length === 0 &&
    orderedFunction.calledFunctionIds.length === 0
  ) {
    return null;
  }

  for (const playbackEvent of orderedFunction.playbackEvents) {
    left = Math.min(left, playbackEvent.when);
    right = Math.max(right, playbackEvent.when + playbackEvent.length);
    top = Math.min(
      top,
      uniqueSounds.indexOf(orderedFunction.name + ' ' + playbackEvent.id)
    );
    bottom = Math.max(
      bottom,
      uniqueSounds.indexOf(orderedFunction.name + ' ' + playbackEvent.id) + 1
    );
  }

  if (depth < MAX_FUNCTION_BOUNDS_RENDER_DEPTH) {
    for (const calledFunctionId of orderedFunction.calledFunctionIds) {
      const calledFunction = orderedFunctions.find(
        orderedF => orderedF.uniqueInvocationId === calledFunctionId
      );
      if (calledFunction) {
        const extents = getFunctionExtents(
          calledFunction,
          uniqueSounds,
          orderedFunctions,
          depth + 1
        );
        if (extents) {
          left = Math.min(left, extents.left);
          right = Math.max(right, extents.right);
          top = Math.min(top, extents.top);
          bottom = Math.max(bottom, extents.bottom);
        }
      }
    }
  }

  // It's possible to have a function that doesn't play any sounds, but does
  // call another function, but no events are ever emitted.  In that case, there's
  // no bound to render.
  if (left === Number.MAX_SAFE_INTEGER) {
    return null;
  }

  return {left, right, top, bottom};
};

/**
 * Renders function extents for a single function in the simple2 model.
 */
interface FunctionExtents2EventsProps {
  index: number;
  paddingOffset: number;
  barWidth: number;
  eventHeight: number;
  functionExtents: FunctionExtents | null;
}

const FunctionExtentsSimple2: React.FunctionComponent<
  FunctionExtents2EventsProps
> = ({index, paddingOffset, barWidth, eventHeight, functionExtents}) => {
  if (!functionExtents) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        backgroundColor:
          index === 0 ? 'rgba(0 0 0 / 0)' : 'rgba(255 255 255 / 0.12)',
        borderRadius: 8,
        left: paddingOffset + (functionExtents.left - 1) * barWidth,
        width: (functionExtents.right - functionExtents.left) * barWidth,
        top: 32 + functionExtents.top * eventHeight,
        height:
          (functionExtents.bottom - functionExtents.top) * eventHeight - 3,
      }}
    >
      &nbsp;
    </div>
  );
};

/**
 * Given an array of playback events, returns a copy of the array that is sorted
 * primarily by when each sound is played.
 */
const getOrderedByWhenSoundEvents = (soundEvents: PlaybackEvent[]) => {
  // This sort arranges all of the sounds played under "when run" in order of when
  // played.  Triggered sounds come after them.
  return [...soundEvents].sort((a, b) =>
    sortByTriggered(a, b, (x, y) => x.when - y.when)
  );
};

/**
 * Given an array of playback events, returns a copy of the array that is sorted
 * primarily by block order.
 */
const getOrderedByBlockSoundEvents = (soundEvents: PlaybackEvent[]) => {
  // This sort arranges all of the sounds played under "when run" in block
  // order.  Triggered sounds come after them.
  const whenRunBlock =
    Blockly.getMainWorkspace()?.getBlocksByType(
      BlockTypes.WHEN_RUN_SIMPLE2
    )[0] || null;
  const blockIdList = collectBlockIdsRecursively(whenRunBlock);

  const blockIdToOrder = new Map<string, number>();
  blockIdList.forEach((id, index) => {
    blockIdToOrder.set(id, index);
  });
  return [...soundEvents].sort((a, b) =>
    sortByTriggered(a, b, (x, y) => {
      const order1 = blockIdToOrder.get(x.blockId || '') ?? Infinity;
      const order2 = blockIdToOrder.get(y.blockId || '') ?? Infinity;
      return order1 - order2;
    })
  );
};

const sortByTriggered = function (
  a: PlaybackEvent,
  b: PlaybackEvent,
  sortFunction: (a: PlaybackEvent, b: PlaybackEvent) => number
): number {
  if (a.triggered && b.triggered) {
    const aName = a.functionContext?.name || '';
    const bName = b.functionContext?.name || '';
    return aName.localeCompare(bName);
  } else if (a.triggered && !b.triggered) {
    return 1;
  } else if (!a.triggered && b.triggered) {
    return -1;
  } else {
    return sortFunction(a, b);
  }
};

/**
 * Renders timeline events in the simple2 model.
 */
interface TimelineSimple2EventsProps {
  paddingOffset: number;
  barWidth: number;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  getEventHeight: (numUniqueRows: number, availableHeight?: number) => number;
  getEventVerticalSpace: (eventHeight: number) => number;
}

const TimelineSimple2Events: React.FunctionComponent<
  TimelineSimple2EventsProps
> = ({
  paddingOffset,
  barWidth,
  onKeyDown,
  getEventHeight,
  getEventVerticalSpace,
}) => {
  const soundEventsOriginal = useMusicSelector(
    state => state.music.playbackEvents
  );

  // soundEventsOriginal has sounds sorted primarily by the immediate function
  // that generates them, and next by when they are played.
  // If timelineLayoutParam is 'blocks', the events are reordered to follow the block layout.
  // If it's 'default' (or any invalid value) the events are resorted so that all sounds
  // played under "when run" are ordered chronologically by when they play.
  // If it's 'old', the original ordering is preserved.
  let soundEvents = soundEventsOriginal;
  if (timelineLayoutParam === 'blocks') {
    soundEvents = getOrderedByBlockSoundEvents(soundEventsOriginal);
  } else if (timelineLayoutParam !== 'old') {
    soundEvents = getOrderedByWhenSoundEvents(soundEventsOriginal);
  }

  const orderedFunctions = useMusicSelector(
    state => state.music.orderedFunctions
  );

  // Generate a list of unique sounds, with uniqueness being a combination of
  // the function name and the sound ID.
  // Let's cache the value of currentUniqueSounds so that the various helpers
  // we call during render don't need to recalculate it.  This also ensures
  // that we recalculate unique sounds, even when there are no entries to
  // render.
  const currentUniqueSounds = useMemo(() => {
    const uniqueSounds = [];
    for (const soundEvent of soundEvents) {
      const id = soundEvent.functionContext?.name + ' ' + soundEvent.id;
      if (uniqueSounds.indexOf(id) === -1) {
        uniqueSounds.push(id);
      }
    }
    return uniqueSounds;
  }, [soundEvents]);

  const eventHeight = useMemo(
    () => getEventHeight(currentUniqueSounds.length),
    [getEventHeight, currentUniqueSounds.length]
  );

  const eventVerticalSpace = useMemo(
    () => getEventVerticalSpace(eventHeight),
    [getEventVerticalSpace, eventHeight]
  );

  const getVerticalOffsetForEventId = useCallback(
    (id: string) => currentUniqueSounds.indexOf(id) * eventHeight,
    [currentUniqueSounds, eventHeight]
  );

  // For each function, determine the pixel extents of the sound events
  // generated, including by functions it calls.
  // The outcome is an object with each function's extents.
  // Each timeline extent has left/right position in measures, and
  // top/bottom position in rows.
  const uniqueFunctionExtentsArray = orderedFunctions
    .map(orderedFunction =>
      getFunctionExtents(orderedFunction, currentUniqueSounds, orderedFunctions)
    )
    .filter(orderedFunction => orderedFunction);

  const timelineFunctionExtents = (
    <div id="timeline-events-function-extents">
      {uniqueFunctionExtentsArray
        .filter(functionExtents => functionExtents)
        .map((functionExtents, index) => (
          <FunctionExtentsSimple2
            key={index}
            index={index}
            paddingOffset={paddingOffset}
            barWidth={barWidth}
            eventHeight={eventHeight}
            functionExtents={functionExtents}
          />
        ))}
    </div>
  );

  const timelineSoundEvents = (
    <div id="timeline-events-sound-events">
      {soundEvents.map((eventData, index) => (
        <TimelineElement
          key={index}
          eventData={eventData}
          barWidth={barWidth}
          onKeyDown={onKeyDown}
          height={eventHeight - eventVerticalSpace}
          top={
            32 +
            getVerticalOffsetForEventId(
              eventData.functionContext?.name + ' ' + eventData.id
            )
          }
          left={paddingOffset + barWidth * (eventData.when - 1)}
        />
      ))}
    </div>
  );

  return (
    <div id="timeline-events">
      {timelineFunctionExtents}
      {timelineSoundEvents}
    </div>
  );
};

export default memo(TimelineSimple2Events);
