import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import {PlayingContext} from '../context';
import classNames from 'classnames';
import moduleStyles from './timeline.module.scss';

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
  const playingContext = useContext(PlayingContext);

  const isInsideRandom = skipContext?.insideRandom;
  const isSkipSound = playingContext.isPlaying && skipContext?.skipSound;

  const isCurrentlyPlaying =
    !isSkipSound &&
    currentPlayheadPosition !== 0 &&
    currentPlayheadPosition >= when &&
    currentPlayheadPosition < when + eventData.length;

  const colorType =
    eventData.type === 'sound' ? eventData.soundType : eventData.type;
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
        width: barWidth * eventData.length,
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
