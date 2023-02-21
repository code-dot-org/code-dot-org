import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import {PlayerUtilsContext} from '../context';
import TimelineElement from './TimelineElement';

/**
 * Renders timeline events for the simple2 model.
 */
const TimelineSimple2Events = ({
  currentPlayheadPosition,
  barWidth,
  eventVerticalSpace,
  getEventHeight
}) => {
  const playerUtils = useContext(PlayerUtilsContext);
  const soundEvents = playerUtils.getSoundEvents();

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
  for (const songEvent of soundEvents) {
    const id = songEvent.functionContext.name + ' ' + songEvent.id;
    if (currentUniqueSounds.indexOf(id) === -1) {
      currentUniqueSounds.push(id);
    }
  }

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
    const length = playerUtils.getLengthForId(soundId);
    const positionLeft = soundEvent.when;
    const positionRight = positionLeft + length;
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
        positionBottom: positionBottom
      });
    } else {
      const item = uniqueFunctionExtents[uniqueFunctionIndex];
      uniqueFunctionExtents[uniqueFunctionIndex] = {
        id: item.id,
        positionLeft: Math.min(item.positionLeft, positionLeft),
        positionRight: Math.max(item.positionRight, positionRight),
        positionTop: Math.min(item.positionTop, positionTop),
        positionBottom: Math.max(item.positionBottom, positionBottom)
      };
    }
  }

  return (
    <div style={{position: 'relative'}}>
      <div style={{position: 'absolute'}}>
        {uniqueFunctionExtents.map((uniqueFunction, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              backgroundColor: 'rgba(115 115 115 / 0.7)',
              borderRadius: 8,
              left: (uniqueFunction.positionLeft - 1) * barWidth,
              width:
                (uniqueFunction.positionRight - uniqueFunction.positionLeft) *
                  barWidth -
                4,
              top: 20 + uniqueFunction.positionTop,
              height:
                uniqueFunction.positionBottom - uniqueFunction.positionTop - 3
            }}
          >
            &nbsp;
          </div>
        ))}
      </div>
      <div style={{position: 'absolute'}}>
        {soundEvents.map((eventData, index) => (
          <TimelineElement
            key={index}
            soundId={eventData.id}
            barWidth={barWidth}
            height={
              getEventHeight(currentUniqueSounds.length) -
              eventVerticalSpace -
              1
            }
            top={
              20 +
              getVerticalOffsetForEventId(
                eventData.functionContext.name + ' ' + eventData.id
              )
            }
            left={barWidth * (eventData.when - 1)}
            when={eventData.when}
            currentPlayheadPosition={currentPlayheadPosition}
          />
        ))}
      </div>
    </div>
  );
};

TimelineSimple2Events.propTypes = {
  currentPlayheadPosition: PropTypes.number.isRequired,
  barWidth: PropTypes.number.isRequired,
  eventVerticalSpace: PropTypes.number.isRequired,
  getEventHeight: PropTypes.func.isRequired
};

export default TimelineSimple2Events;
