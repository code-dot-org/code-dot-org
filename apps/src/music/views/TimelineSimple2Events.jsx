import PropTypes from 'prop-types';
import React from 'react';
import {useSelector} from 'react-redux';
import TimelineElement from './TimelineElement';

/**
 * Renders timeline events for the simple2 model.
 */
const TimelineSimple2Events = ({
  paddingOffset,
  barWidth,
  eventVerticalSpace,
  getEventHeight,
}) => {
  const soundEvents = useSelector(state => state.music.playbackEvents);
  const orderedFunctions = useSelector(state => state.music.orderedFunctions);

  const getVerticalOffsetForEventId = id => {
    return (
      getUniqueIndexForEventId(id) * getEventHeight(currentUniqueSounds.length)
    );
  };

  const getUniqueIndexForEventId = id => {
    return currentUniqueSounds.indexOf(id);
  };

  // Generate a list of unique sounds, with uniqueness being a combination of
  // the function name and the sound ID.
  // Let's cache the value of currentUniqueSounds so that the various helpers
  // we call during render don't need to recalculate it.  This also ensures
  // that we recalculate unique sounds, even when there are no entries to
  // render.
  const currentUniqueSounds = [];
  for (const soundEvent of soundEvents) {
    const id = soundEvent.functionContext.name + ' ' + soundEvent.id;
    if (currentUniqueSounds.indexOf(id) === -1) {
      currentUniqueSounds.push(id);
    }
  }

  // Next, for each function, determine the boundaries of the sound events
  // generated, including by functions it calls.
  // The outcome is an object with each function's boundaries.
  // Each timeline boundary has left/right position in measures, and
  // top/bottom position in pixels.
  const uniqueFunctionExtents = {};
  orderedFunctions.forEach(orderedFunction => {
    const uniqueFunctionId =
      orderedFunction.name + orderedFunction.uniqueInvocationId;

    const bounds = getFunctionBounds(orderedFunction);
    uniqueFunctionExtents[uniqueFunctionId] = bounds;
  });

  function getFunctionBounds(orderedFunction) {
    let left = 100000,
      top = 100000,
      right = 0,
      bottom = 0;

    orderedFunction.playbackEvents.forEach(playbackEvent => {
      left = Math.min(left, playbackEvent.when);
      right = Math.max(right, playbackEvent.when + playbackEvent.length);
      top = Math.min(
        top,
        getVerticalOffsetForEventId(
          orderedFunction.name + ' ' + playbackEvent.id
        )
      );
      bottom = Math.max(
        bottom,
        getVerticalOffsetForEventId(
          orderedFunction.name + ' ' + playbackEvent.id
        ) + getEventHeight(currentUniqueSounds.length)
      );
    });

    orderedFunction.calledFunctionIds.forEach(calledFunctionId => {
      const calledFunction = orderedFunctions.find(
        orderedF => orderedF.uniqueInvocationId === calledFunctionId
      );
      const bounds = getFunctionBounds(calledFunction);
      left = Math.min(left, bounds.left);
      right = Math.max(right, bounds.right);
      top = Math.min(top, bounds.top);
      bottom = Math.max(bottom, bounds.bottom);
    });

    return {left, right, top, bottom};
  }

  const uniqueFunctionExtentsArray = [];
  Object.keys(uniqueFunctionExtents).forEach(key => {
    uniqueFunctionExtentsArray.push(uniqueFunctionExtents[key]);
  });

  return (
    <div id="timeline-events">
      <div id="timeline-events-funtion-extents">
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
              top: 32 + uniqueFunction.top,
              height: uniqueFunction.bottom - uniqueFunction.top - 3,
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
            height={
              getEventHeight(currentUniqueSounds.length) -
              eventVerticalSpace -
              1
            }
            top={
              32 +
              getVerticalOffsetForEventId(
                eventData.functionContext.name + ' ' + eventData.id
              )
            }
            left={paddingOffset + barWidth * (eventData.when - 1)}
            when={eventData.when}
            skipContext={eventData.skipContext}
          />
        ))}
      </div>
    </div>
  );
};

TimelineSimple2Events.propTypes = {
  paddingOffset: PropTypes.number.isRequired,
  barWidth: PropTypes.number.isRequired,
  eventVerticalSpace: PropTypes.number.isRequired,
  getEventHeight: PropTypes.func.isRequired,
};

export default TimelineSimple2Events;
