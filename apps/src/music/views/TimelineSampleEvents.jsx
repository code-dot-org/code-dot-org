import PropTypes from 'prop-types';
import React, {useRef} from 'react';
import {useSelector} from 'react-redux';

import UniqueSounds from '../utils/UniqueSounds';

import TimelineElement from './TimelineElement';

/**
 * Renders timeline events, organized by unique sample ID.
 */
const TimelineSampleEvents = ({
  paddingOffset,
  barWidth,
  eventVerticalSpace,
  getEventHeight,
}) => {
  const soundEvents = useSelector(state => state.music.playbackEvents);

  const uniqueSoundsRef = useRef(new UniqueSounds());
  // Let's cache the value of getUniqueSounds() so that the various helpers
  // we call during render don't need to recalculate it.  This also ensures
  // that we recalculate unique sounds, even when there are no entries to
  // render.
  const currentUniqueSounds =
    uniqueSoundsRef.current.getUniqueSounds(soundEvents);

  const getVerticalOffsetForEventId = id => {
    return (
      getUniqueIndexForEventId(id) * getEventHeight(currentUniqueSounds.length)
    );
  };

  const getUniqueIndexForEventId = id => {
    return currentUniqueSounds.indexOf(id);
  };

  return (
    <>
      {soundEvents.map((eventData, index) => (
        <TimelineElement
          key={index}
          eventData={eventData}
          barWidth={barWidth}
          height={
            getEventHeight(currentUniqueSounds.length) - eventVerticalSpace
          }
          top={32 + getVerticalOffsetForEventId(eventData.id)}
          left={paddingOffset + barWidth * (eventData.when - 1)}
          when={eventData.when}
        />
      ))}
    </>
  );
};

TimelineSampleEvents.propTypes = {
  paddingOffset: PropTypes.number.isRequired,
  barWidth: PropTypes.number.isRequired,
  eventVerticalSpace: PropTypes.number.isRequired,
  getEventHeight: PropTypes.func.isRequired,
};

export default TimelineSampleEvents;
