import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import {PlayerUtilsContext} from '../context';
import classNames from 'classnames';
import moduleStyles from './timeline.module.scss';

// TODO: Unify type constants and colors with those SoundPanel.jsx
const typeToColorClass = {
  beat: moduleStyles.timelineElementPurple,
  bass: moduleStyles.timelineElementBlue,
  lead: moduleStyles.timelineElementGreen,
  fx: moduleStyles.timelineElementYellow
};

/**
 * Renders a single element (sound) in the timeline
 */
const TimelineElement = ({
  soundId,
  barWidth,
  height,
  top,
  left,
  when,
  currentMeasure
}) => {
  const playerUtils = useContext(PlayerUtilsContext);

  const length = playerUtils.getLengthForId(soundId);

  const isCurrentlyPlaying =
    currentMeasure !== -1 &&
    currentMeasure >= when &&
    currentMeasure < when + length;

  return (
    <div
      className={classNames(
        moduleStyles.timelineElement,
        typeToColorClass[playerUtils.getTypeForId(soundId)],
        isCurrentlyPlaying && moduleStyles.timelineElementPlaying
      )}
      style={{
        width: barWidth * length - 4,
        height,
        top,
        left
      }}
    >
      &nbsp;
    </div>
  );
};

TimelineElement.propTypes = {
  soundId: PropTypes.string.isRequired,
  barWidth: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  top: PropTypes.number.isRequired,
  left: PropTypes.number.isRequired,
  when: PropTypes.number.isRequired,
  currentMeasure: PropTypes.number.isRequired
};

export default TimelineElement;
