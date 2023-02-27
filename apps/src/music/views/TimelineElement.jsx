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
  skipContext,
  currentPlayheadPosition
}) => {
  const playerUtils = useContext(PlayerUtilsContext);

  const length = playerUtils.getLengthForId(soundId);

  const isCurrentlyPlaying =
    currentPlayheadPosition !== 0 &&
    currentPlayheadPosition >= when &&
    currentPlayheadPosition < when + length;

  const isMaybeSkipping = skipContext?.maybeSkipSound;
  const isSkipping = skipContext?.skipSound;

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
        left,
        ...(isMaybeSkipping && {borderColor: '#a1a1a1'}),
        ...(playerUtils.getIsExecutingPlay() &&
          isSkipping && {backgroundColor: '#808080'})
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
  left: PropTypes.number,
  when: PropTypes.number.isRequired,
  skipContext: PropTypes.object,
  currentPlayheadPosition: PropTypes.number.isRequired
};

export default TimelineElement;
