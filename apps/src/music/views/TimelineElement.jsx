import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import moduleStyles from './timeline.module.scss';
import {useSelector} from 'react-redux';

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
  selectedBlockId,
  onBlockSelected
}) => {
  const isPlaying = useSelector(state => state.music.isPlaying);
  const currentPlayheadPosition = useSelector(
    state => state.music.currentPlayheadPosition
  );
  const isInsideRandom = skipContext?.insideRandom;
  const isSkipSound = isPlaying && skipContext?.skipSound;

  const isCurrentlyPlaying =
    !isSkipSound &&
    currentPlayheadPosition !== 0 &&
    currentPlayheadPosition >= when &&
    currentPlayheadPosition < when + eventData.length;

  const isBlockSelected = eventData.blockId === selectedBlockId;

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
        isSkipSound && moduleStyles.timelineElementSkipSound,
        isBlockSelected && moduleStyles.timelineElementBlockSelected,
        onBlockSelected && !isPlaying && moduleStyles.timelineElementClickable
      )}
      style={{
        width: barWidth * eventData.length,
        height,
        top,
        left
      }}
      onClick={event => {
        if (onBlockSelected && !isPlaying) {
          onBlockSelected(eventData.blockId);
        }
        event.stopPropagation();
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
  selectedBlockId: PropTypes.string,
  onBlockSelected: PropTypes.func
};

export default TimelineElement;
