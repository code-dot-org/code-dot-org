import PropTypes from 'prop-types';
import React, {useRef, useContext} from 'react';
import UniqueSounds from '../utils/UniqueSounds';
import {PlayerUtilsContext} from '../context';
import TimelineElement from './TimelineElement';

/**
 * Renders timeline events, organized by unique track ID & unique sample ID.
 */
const TimelineSimple2Events = ({
  currentPlayheadPosition,
  barWidth,
  eventVerticalSpace,
  getEventHeight
}) => {
  const playerUtils = useContext(PlayerUtilsContext);
  const soundEvents = playerUtils.getSoundEvents();

  const uniqueSoundsRef = useRef(new UniqueSounds());
  // Let's cache the value of getUniqueSounds() so that the various helpers
  // we call during render don't need to recalculate it.  This also ensures
  // that we recalculate unique sounds, even when there are no entries to
  // render.
  const currentUniqueSounds = uniqueSoundsRef.current.getUniqueSounds(
    soundEvents,
    false
  );

  const getVerticalOffsetForEventId = id => {
    return (
      getUniqueIndexForEventId(id) * getEventHeight(currentUniqueSounds.length)
    );
  };

  const getUniqueIndexForEventId = id => {
    return currentUniqueSounds.indexOf(id);
  };

  // As we encounter a function name, record its boundaries.
  const uniqueFunctionExtents = [];

  // As we encounter a function name, record its boundaries.
  for (const soundEvent of soundEvents) {
    const id = soundEvent.id;
    const trackId = soundEvent.trackId;
    const length = playerUtils.getLengthForId(id);
    const positionLeft = soundEvent.when;
    const positionRight = positionLeft + length;
    const positionTop = getVerticalOffsetForEventId(trackId + ' ' + id);
    const positionBottom =
      positionTop + getEventHeight(currentUniqueSounds.length);

    const uniqueFunctionIndex = uniqueFunctionExtents.findIndex(
      x => x.trackId === trackId + soundEvent.functionInstance
    );
    if (uniqueFunctionIndex === -1) {
      uniqueFunctionExtents.push({
        trackId: trackId + soundEvent.functionInstance,
        minPosition: positionLeft,
        maxPosition: positionRight,
        positionTop: positionTop,
        positionBottom: positionBottom
      });
    } else {
      const item = uniqueFunctionExtents[uniqueFunctionIndex];
      uniqueFunctionExtents[uniqueFunctionIndex] = {
        trackId: item.trackId,
        minPosition: Math.min(item.minPosition, positionLeft),
        maxPosition: Math.max(item.maxPosition, positionRight),
        positionTop: Math.min(item.positionTop, positionTop),
        positionBottom: Math.max(item.positionBottom, positionBottom)
      };
    }
  }

  console.log('uniqueFunctionExtents', uniqueFunctionExtents);

  return (
    <div style={{position: 'relative'}}>
      <div style={{position: 'absolute'}}>
        {uniqueFunctionExtents.map((uniqueFunction, index) => (
          <div
            style={{
              position: 'absolute',
              backgroundColor: 'rgba(38 129 153 / 0.7)', // 'rgba(80 153 24 / 0.7)',
              borderRadius: 8,
              left: (uniqueFunction.minPosition - 1) * barWidth,
              width:
                (uniqueFunction.maxPosition - uniqueFunction.minPosition) *
                  barWidth -
                4,
              top: 20 + uniqueFunction.positionTop - 1,
              height:
                uniqueFunction.positionBottom - uniqueFunction.positionTop - 2
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
                eventData.trackId + ' ' + eventData.id
              )
            }
            left={barWidth * (eventData.when - 1)}
            when={eventData.when}
            trackId={eventData.trackId}
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
