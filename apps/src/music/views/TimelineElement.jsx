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
  fx: moduleStyles.timelineElementYellow,
  active: moduleStyles.timelineElementWhite
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
  isCurrentlyPlaying
}) => {
  const playerUtils = useContext(PlayerUtilsContext);

  return (
    <div
      className={classNames(
        moduleStyles.timelineElement,
        typeToColorClass[playerUtils.getTypeForId(soundId)],
        isCurrentlyPlaying && moduleStyles.timelineElementPlaying
      )}
      style={{
        width: barWidth * playerUtils.getLengthForId(soundId) - 4,
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
  top: PropTypes.number,
  left: PropTypes.number,
  isCurrentlyPlaying: PropTypes.bool
};

export default TimelineElement;
