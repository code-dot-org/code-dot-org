import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import {PlayerUtilsContext, PlayingContext} from '../context';
import classNames from 'classnames';
import moduleStyles from './timeline.module.scss';
import {DEFAULT_PATTERN_LENGTH} from '../constants';

// TODO: Unify type constants and colors with those SoundPanel.jsx
const typeToColorClass = {
  beat: moduleStyles.timelineElementPurple,
  bass: moduleStyles.timelineElementBlue,
  lead: moduleStyles.timelineElementGreen,
  fx: moduleStyles.timelineElementYellow,
  pattern: moduleStyles.timelineElementPink,
  chord: moduleStyles.timelineElementOrange
};

/**
 * Renders a single element (sound) in the timeline
 */
const TimelineElement = ({
  eventData,
  barWidth,
  height,
  top,
  left,
  when,
  skipContext,
  currentPlayheadPosition
}) => {
  const playerUtils = useContext(PlayerUtilsContext);
  const playingContext = useContext(PlayingContext);

  // TODO: Add length as field on PlaybackEvent to prevent duplicated lookup logic
  const length =
    eventData.type === 'pattern' || eventData.type === 'chord'
      ? DEFAULT_PATTERN_LENGTH
      : playerUtils.getLengthForId(eventData.id);

  const isInsideRandom = skipContext?.insideRandom;
  const isSkipSound = playingContext.isPlaying && skipContext?.skipSound;

  const isCurrentlyPlaying =
    !isSkipSound &&
    currentPlayheadPosition !== 0 &&
    currentPlayheadPosition >= when &&
    currentPlayheadPosition < when + length;

  const colorType =
    eventData.type === 'pattern' || eventData.type === 'chord'
      ? eventData.type
      : playerUtils.getTypeForId(eventData.id);
  const colorClass = typeToColorClass[colorType];

  return (
    <div
      className={classNames(
        moduleStyles.timelineElement,
        colorClass,
        isCurrentlyPlaying && moduleStyles.timelineElementPlaying,
        isInsideRandom && moduleStyles.timelineElementInsideRandom,
        isSkipSound && moduleStyles.timelineElementSkipSound
      )}
      style={{
        width: barWidth * length,
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
  eventData: PropTypes.object.isRequired,
  barWidth: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  top: PropTypes.number.isRequired,
  left: PropTypes.number,
  when: PropTypes.number.isRequired,
  skipContext: PropTypes.object,
  currentPlayheadPosition: PropTypes.number.isRequired
};

export default TimelineElement;
