import React, {useCallback, useMemo} from 'react';

import AppConfig from '../appConfig';
import {FunctionEvents} from '../player/interfaces/FunctionEvents';
import {PlaybackEvent} from '../player/interfaces/PlaybackEvent';

import TimelineElement from './TimelineElement';
import {useMusicSelector} from './types';

const useOriginalTimelineLayout =
  AppConfig.getValue('timeline-original-layout') === 'true';

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
  orderedFunctions: FunctionEvents[]
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

  for (const calledFunctionId of orderedFunction.calledFunctionIds) {
    const calledFunction = orderedFunctions.find(
      orderedF => orderedF.uniqueInvocationId === calledFunctionId
    );
    if (calledFunction) {
      const extents = getFunctionExtents(
        calledFunction,
        uniqueSounds,
        orderedFunctions
      );
      if (extents) {
        left = Math.min(left, extents.left);
        right = Math.max(right, extents.right);
        top = Math.min(top, extents.top);
        bottom = Math.max(bottom, extents.bottom);
      }
    }
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
  return [...soundEvents].sort((soundEvent1, soundEvent2) => {
    if (soundEvent1.triggered && soundEvent2.triggered) {
      const soundEvent1Name = soundEvent1.functionContext?.name || '';
      const soundEvent2Name = soundEvent2.functionContext?.name || '';
      if (soundEvent1Name < soundEvent2Name) {
        return -1;
      } else if (soundEvent1 > soundEvent2) {
        return 1;
      } else {
        return 0;
      }
    } else if (soundEvent1.triggered && !soundEvent2.triggered) {
      return 1;
    } else if (!soundEvent1.triggered && soundEvent2.triggered) {
      return -1;
    } else {
      return soundEvent1.when - soundEvent2.when;
    }
  });
};

/**
 * Renders timeline events in the simple2 model.
 */
interface TimelineSimple2EventsProps {
  paddingOffset: number;
  barWidth: number;
  eventVerticalSpace: number;
  getEventHeight: (numUniqueRows: number, availableHeight?: number) => number;
}

const TimelineSimple2Events: React.FunctionComponent<
  TimelineSimple2EventsProps
> = ({paddingOffset, barWidth, eventVerticalSpace, getEventHeight}) => {
  const soundEventsOriginal = useMusicSelector(
    state => state.music.playbackEvents
  );

  // soundEventsOriginal has sounds sorted primarily by the immediate function
  // that generates them, and next by when they are played.  Unless useOriginalTimelineLayout
  // is true, then they are resorted so that all sounds played somewhere under
  // "when run" are sorted by when they are played.
  const soundEvents = useOriginalTimelineLayout
    ? soundEventsOriginal
    : getOrderedByWhenSoundEvents(soundEventsOriginal);

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

  // Next, for each function, determine the pixel extents of the sound events
  // generated, including by functions it calls.
  // The outcome is an object with each function's extents.
  // Each timeline extent has left/right position in measures, and
  // top/bottom position in rows.
  const uniqueFunctionExtentsArray = useMemo(() => {
    return orderedFunctions
      .map(orderedFunction =>
        getFunctionExtents(
          orderedFunction,
          currentUniqueSounds,
          orderedFunctions
        )
      )
      .filter(orderedFunction => orderedFunction);
  }, [orderedFunctions, currentUniqueSounds]);

  const eventHeight = useMemo(
    () => getEventHeight(currentUniqueSounds.length),
    [currentUniqueSounds.length, getEventHeight]
  );

  const getVerticalOffsetForEventId = useCallback(
    (id: string) =>
      currentUniqueSounds.indexOf(id) *
      getEventHeight(currentUniqueSounds.length),
    [currentUniqueSounds, getEventHeight]
  );

  return (
    <div id="timeline-events">
      <div id="timeline-events-function-extents">
        {uniqueFunctionExtentsArray.map((functionExtents, index) => (
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
      <div id="timeline-events-sound-events">
        {soundEvents.map((eventData, index) => (
          <TimelineElement
            key={index}
            eventData={eventData}
            barWidth={barWidth}
            height={eventHeight - eventVerticalSpace - 1}
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
    </div>
  );
};
export default TimelineSimple2Events;
