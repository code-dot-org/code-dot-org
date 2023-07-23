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

  // NEW
  const currentUniqueSounds2 = [];
  orderedFunctions.forEach(orderedFunction => {
    const functionName = orderedFunction.name;
    orderedFunction.playbackEvents.forEach(playbackEvent => {
      const id = functionName + ' ' + playbackEvent.id;
      if (currentUniqueSounds2.indexOf(id) === -1) {
        currentUniqueSounds2.push(id);
      }
    });
  });

  // OLD
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

  // For each function, determine its extents.
  const uniqueFunctionExtents2 = {};
  orderedFunctions.forEach(orderedFunction => {
    const uniqueFunctionId =
      orderedFunction.name + orderedFunction.uniqueInvocationId;

    const bounds = getFunctionBounds(orderedFunction);
    uniqueFunctionExtents2[uniqueFunctionId] = bounds;
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

  const uniqueFunctionExtents2Array = [];
  Object.keys(uniqueFunctionExtents2).forEach(key => {
    uniqueFunctionExtents2Array.push(uniqueFunctionExtents2[key]);
  });

  // Next, go through all sound events, and for each unique function that
  // is involved, adjust the boundaries of timeline space if necessary.
  // The outcome is an array of functions that generate sounds, with the
  // timeline boundaries for each.
  // Each timeline boundary has left/right position in measures, and
  // top/bottom position in pixels.
  const uniqueFunctionExtents = [];
  for (const soundEvent of soundEvents) {
    const soundId = soundEvent.id;
    const functionName = soundEvent.functionContext.name;
    const positionLeft = soundEvent.when;
    const positionRight = positionLeft + soundEvent.length;
    const positionTop = getVerticalOffsetForEventId(
      functionName + ' ' + soundId
    );
    const positionBottom =
      positionTop + getEventHeight(currentUniqueSounds.length);

    const uniqueFunctionIndex = uniqueFunctionExtents.findIndex(
      item =>
        item.id === functionName + soundEvent.functionContext.uniqueInvocationId
    );
    if (uniqueFunctionIndex === -1) {
      uniqueFunctionExtents.push({
        id: functionName + soundEvent.functionContext.uniqueInvocationId,
        positionLeft: positionLeft,
        positionRight: positionRight,
        positionTop: positionTop,
        positionBottom: positionBottom,
      });
    } else {
      const item = uniqueFunctionExtents[uniqueFunctionIndex];
      uniqueFunctionExtents[uniqueFunctionIndex] = {
        id: item.id,
        positionLeft: Math.min(item.positionLeft, positionLeft),
        positionRight: Math.max(item.positionRight, positionRight),
        positionTop: Math.min(item.positionTop, positionTop),
        positionBottom: Math.max(item.positionBottom, positionBottom),
      };
    }
  }

  return (
    <div id="timeline-events">
      <div id="timeline-events-funtion-extents">
        {uniqueFunctionExtents2Array.map((uniqueFunction, index) => (
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
