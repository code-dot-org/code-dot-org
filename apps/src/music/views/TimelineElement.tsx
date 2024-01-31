import React from 'react';
import classNames from 'classnames';
import moduleStyles from './timeline.module.scss';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import {MusicState, selectBlockId} from '../redux/musicRedux';
import {SoundEvent} from '../player/interfaces/SoundEvent';
import {PlaybackEvent} from '../player/interfaces/PlaybackEvent';
import {SoundType} from '../player/MusicLibrary';

// TODO: Unify type constants and colors with those SoundPanel.jsx
const typeToColorClass: {[key in SoundType | PlaybackEvent['type']]?: string} =
  {
    beat: moduleStyles.timelineElementPurple,
    bass: moduleStyles.timelineElementBlue,
    lead: moduleStyles.timelineElementGreen,
    fx: moduleStyles.timelineElementYellow,
    pattern: moduleStyles.timelineElementPattern,
    chord: moduleStyles.timelineElementChord,
  };

interface TimelineElementProps {
  eventData: PlaybackEvent;
  barWidth: number;
  height: number;
  top: number;
  left: number;
}

const useTypedSelector: TypedUseSelectorHook<{music: MusicState}> = useSelector;

/**
 * Renders a single element (sound) in the timeline
 */
const TimelineElement: React.FunctionComponent<TimelineElementProps> = ({
  eventData,
  barWidth,
  height,
  top,
  left,
}) => {
  const isPlaying = useTypedSelector(state => state.music.isPlaying);
  const selectedBlockId = useTypedSelector(
    state => state.music.selectedBlockId
  );
  const dispatch = useDispatch();
  const currentPlayheadPosition = useTypedSelector(
    state => state.music.currentPlayheadPosition
  );
  const isInsideRandom = eventData.skipContext?.insideRandom;
  const isSkipSound = isPlaying && eventData.skipContext?.skipSound;

  const isCurrentlyPlaying =
    isPlaying &&
    !isSkipSound &&
    currentPlayheadPosition !== 0 &&
    currentPlayheadPosition >= eventData.when &&
    currentPlayheadPosition < eventData.when + eventData.length;

  const isBlockSelected = eventData.blockId === selectedBlockId;

  const colorType =
    eventData.type === 'sound'
      ? (eventData as SoundEvent).soundType
      : eventData.type;
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

export default TimelineElement;
