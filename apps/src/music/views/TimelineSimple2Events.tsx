import React, {useCallback, useMemo} from 'react';
import TimelineElement from './TimelineElement';
import {useMusicSelector} from './types';
import {FunctionEvents} from '../player/interfaces/FunctionEvents';

/**
 * Compute the bounds for the given function, given the list of unique sounds and all functions.
 */
const getFunctionBounds = (
  orderedFunction: FunctionEvents,
  uniqueSounds: string[],
  orderedFunctions: FunctionEvents[]
) => {
  let left = Number.MAX_SAFE_INTEGER,
    top = Number.MAX_SAFE_INTEGER,
    right = 0,
    bottom = 0;

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
      const bounds = getFunctionBounds(
        calledFunction,
        uniqueSounds,
        orderedFunctions
      );
      left = Math.min(left, bounds.left);
      right = Math.max(right, bounds.right);
      top = Math.min(top, bounds.top);
      bottom = Math.max(bottom, bounds.bottom);
    }
  }

  return {left, right, top, bottom};
};

interface TimelineSimple2EventsProps {
  paddingOffset: number;
  barWidth: number;
  eventVerticalSpace: number;
  getEventHeight: (numUniqueRows: number, availableHeight?: number) => number;
}

/**
 * Renders timeline events for the simple2 model.
 */
const TimelineSimple2Events: React.FunctionComponent<
  TimelineSimple2EventsProps
> = ({paddingOffset, barWidth, eventVerticalSpace, getEventHeight}) => {
  const soundEvents = useMusicSelector(state => state.music.playbackEvents);
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

  // Next, for each function, determine the boundaries of the sound events
  // generated, including by functions it calls.
  // The outcome is an object with each function's boundaries.
  // Each timeline boundary has left/right position in measures, and
  // top/bottom position in rows.
  const uniqueFunctionExtentsArray = useMemo(() => {
    return orderedFunctions.map(orderedFunction =>
      getFunctionBounds(orderedFunction, currentUniqueSounds, orderedFunctions)
    );
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
        {uniqueFunctionExtentsArray.map((uniqueFunction, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              backgroundColor:
                index === 0 ? 'rgba(0 0 0 / 0)' : 'rgba(255 255 255 / 0.12)',
              borderRadius: 8,
              left: paddingOffset + (uniqueFunction.left - 1) * barWidth,
              width: (uniqueFunction.right - uniqueFunction.left) * barWidth,
              top: 32 + uniqueFunction.top * eventHeight,
              height:
                (uniqueFunction.bottom - uniqueFunction.top) * eventHeight - 3,
            }}
          >
            &nbsp;
          </div>
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
