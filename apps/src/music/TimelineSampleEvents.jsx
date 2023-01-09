import PropTypes from 'prop-types';
import React, {useRef} from 'react';
import moduleStyles from './timeline.module.scss';
import classNames from 'classnames';
import UniqueSounds from './utils/UniqueSounds';

const colorClasses = [
  moduleStyles.timelineElementPurple,
  moduleStyles.timelineElementBlue,
  moduleStyles.timelineElementGreen,
  moduleStyles.timelineElementYellow
];

/**
 * Renders timeline events, organized by unique sample ID.
 */
const TimelineSampleEvents = ({
  songData,
  barWidth,
  eventVerticalSpace,
  getLengthForId
}) => {
  const uniqueSoundsRef = useRef(new UniqueSounds());
  // Let's cache the value of getUniqueSounds() so that the various helpers
  // we call during render don't need to recalculate it.  This also ensures
  // that we recalculate unique sounds, even when there are no entries to
  // render.
  const currentUniqueSounds = uniqueSoundsRef.current.getUniqueSounds(
    songData.events
  );

  const getVerticalOffsetForEventId = id => {
    return getUniqueIndexForEventId(id) * getEventHeight();
  };

  const getUniqueIndexForEventId = id => {
    return currentUniqueSounds.indexOf(id);
  };

  const getEventHeight = () => {
    const numUniqueSounds = currentUniqueSounds.length;
    const actualHeight = 110;

    // While we might not actually have this many rows to show,
    // we will limit each row's height to the size that would allow
    // this many to be shown at once.
    const minVisible = 5;

    const maxVisible = 10;

    // We might not actually have this many rows to show, but
    // we will size the bars so that this many rows would show.
    const numSoundsToShow = Math.max(
      Math.min(numUniqueSounds, maxVisible),
      minVisible
    );

    return Math.floor(actualHeight / numSoundsToShow);
  };

  return (
    <>
      {songData.events.map((eventData, index) => {
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
              height: getEventHeight() - eventVerticalSpace
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
  songData: PropTypes.object.isRequired,
  barWidth: PropTypes.number.isRequired,
  eventVerticalSpace: PropTypes.number.isRequired,
  getLengthForId: PropTypes.func.isRequired
};

export default TimelineSampleEvents;
