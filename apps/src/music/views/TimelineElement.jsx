import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import moduleStyles from './timeline.module.scss';
import {useDispatch, useSelector} from 'react-redux';
import {selectBlockId} from '../redux/musicRedux';

// TODO: Unify type constants and colors with those SoundPanel.jsx
const typeToColorClass = {
  beat: moduleStyles.timelineElementPurple,
  bass: moduleStyles.timelineElementBlue,
  lead: moduleStyles.timelineElementGreen,
  fx: moduleStyles.timelineElementYellow,
  pattern: moduleStyles.timelineElementPattern,
  chord: moduleStyles.timelineElementChord,
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
}) => {
  const isPlaying = useSelector(state => state.music.isPlaying);
  const selectedBlockId = useSelector(state => state.music.selectedBlockId);
  const dispatch = useDispatch();
  const currentPlayheadPosition = useSelector(
    state => state.music.currentPlayheadPosition
  );
  const isInsideRandom = skipContext?.insideRandom;
  const isSkipSound = isPlaying && skipContext?.skipSound;

  const isCurrentlyPlaying =
    isPlaying &&
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
        'timeline-element',
        moduleStyles.timelineElement,
        colorClass,
        isCurrentlyPlaying && moduleStyles.timelineElementPlaying,
        isInsideRandom && moduleStyles.timelineElementInsideRandom,
        isSkipSound && moduleStyles.timelineElementSkipSound,
        isBlockSelected && moduleStyles.timelineElementBlockSelected,
        !isPlaying && moduleStyles.timelineElementClickable
      )}
      style={{
        width: barWidth * eventData.length,
        height,
        top,
        left,
      }}
      onClick={event => {
        dispatch(selectBlockId(eventData.blockId));
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
};

export default TimelineElement;
