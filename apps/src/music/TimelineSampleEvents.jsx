import PropTypes from 'prop-types';
import React, {useRef, useContext} from 'react';
import moduleStyles from './timeline.module.scss';
import classNames from 'classnames';
import UniqueSounds from './utils/UniqueSounds';
import {PlayerUtilsContext} from './context';

/**
 * Renders timeline events, organized by unique sample ID.
 */
const TimelineSampleEvents = ({
  barWidth,
  eventVerticalSpace,
  getLengthForId,
  getEventHeight,
  colorClasses
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

  return (
    <>
      {soundEvents.map((eventData, index) => {
        return (
          <div
            key={index}
            className={classNames(
              moduleStyles.timelineElement,
              colorClasses[
                getUniqueIndexForEventId(eventData.id) % colorClasses.length
              ]
            )}
            style={{
              width: barWidth * getLengthForId(eventData.id) - 4,
              left: barWidth * eventData.when,
              top: 20 + getVerticalOffsetForEventId(eventData.id),
              height:
                getEventHeight(currentUniqueSounds.length) - eventVerticalSpace
            }}
          >
            &nbsp;
          </div>
        );
      })}
    </>
  );
};

TimelineSampleEvents.propTypes = {
  barWidth: PropTypes.number.isRequired,
  eventVerticalSpace: PropTypes.number.isRequired,
  getLengthForId: PropTypes.func.isRequired,
  getEventHeight: PropTypes.func.isRequired,
  colorClasses: PropTypes.array.isRequired
};

export default TimelineSampleEvents;
