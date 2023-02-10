import PropTypes from 'prop-types';
import React, {useRef, useContext} from 'react';
import UniqueSounds from '../utils/UniqueSounds';
import {PlayerUtilsContext} from '../context';
import TimelineElement from './TimelineElement';

/**
 * Renders timeline events, organized by unique sample ID.
 */
const TimelineSampleEvents = ({
  barWidth,
  eventVerticalSpace,
  getEventHeight,
  currentMeasure
}) => {
  const playerUtils = useContext(PlayerUtilsContext);
  const soundEvents = playerUtils.getSoundEvents();

  const uniqueSoundsRef = useRef(new UniqueSounds());
  // Let's cache the value of getUniqueSounds() so that the various helpers
  // we call during render don't need to recalculate it.  This also ensures
  // that we recalculate unique sounds, even when there are no entries to
  // render.
  const currentUniqueSounds = uniqueSoundsRef.current.getUniqueSounds(
    soundEvents
  );

  const getVerticalOffsetForEventId = id => {
    return (
      getUniqueIndexForEventId(id) * getEventHeight(currentUniqueSounds.length)
    );
  };

  const getUniqueIndexForEventId = id => {
    return currentUniqueSounds.indexOf(id);
  };

  const isCurrentlyPlaying = (when, length) => {
    const currentMeasureExact = playerUtils.getCurrentMeasureExact();

    return (
      currentMeasureExact !== -1 &&
      currentMeasureExact >= when &&
      currentMeasureExact < when + length
    );
  };

  return (
    <>
      {soundEvents.map((eventData, index) => (
        <TimelineElement
          key={index}
          soundId={eventData.id}
          barWidth={barWidth}
          height={
            getEventHeight(currentUniqueSounds.length) - eventVerticalSpace
          }
          top={20 + getVerticalOffsetForEventId(eventData.id)}
          left={barWidth * eventData.when}
          isCurrentlyPlaying={isCurrentlyPlaying(
            eventData.when,
            playerUtils.getLengthForId(eventData.id)
          )}
        />
      ))}
    </>
  );
};

TimelineSampleEvents.propTypes = {
  currentMeasure: PropTypes.number.isRequired,
  barWidth: PropTypes.number.isRequired,
  eventVerticalSpace: PropTypes.number.isRequired,
  getEventHeight: PropTypes.func.isRequired
};

export default TimelineSampleEvents;
