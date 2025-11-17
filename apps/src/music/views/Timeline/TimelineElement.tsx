import classNames from 'classnames';
import React from 'react';

import {isChordEvent} from '@cdo/apps/music/player/interfaces/ChordEvent';
import {isInstrumentEvent} from '@cdo/apps/music/player/interfaces/InstrumentEvent';
import {PlaybackEvent} from '@cdo/apps/music/player/interfaces/PlaybackEvent';
import {isSoundEvent} from '@cdo/apps/music/player/interfaces/SoundEvent';
import SoundStyle from '@cdo/apps/music/utils/SoundStyle';

import {useTimelineContext} from './TimelineContext';

import moduleStyles from './timeline.module.scss';

export const TimelineElementClass = 'timeline-element';

interface TimelineElementProps {
  eventData: PlaybackEvent;
  barWidth: number;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  height: number;
  top: number;
  left: number;
}

/**
 * Renders a single element (sound) in the timeline
 */
const TimelineElement: React.FunctionComponent<TimelineElementProps> = ({
  eventData,
  barWidth,
  onKeyDown,
  height,
  top,
  left,
}) => {
  const {isPlaying, selectedBlockId, currentPlayheadPosition, selectBlockId} =
    useTimelineContext();
  const isInsideRandom = eventData.skipContext?.insideRandom;
  const isSkipSound = isPlaying && eventData.skipContext?.skipSound;
  const isThinBorder = height <= 4;

  const isCurrentlyPlaying =
    isPlaying &&
    !isSkipSound &&
    currentPlayheadPosition !== 0 &&
    currentPlayheadPosition >= eventData.when &&
    currentPlayheadPosition < eventData.when + eventData.length;

  const isBlockSelected = eventData.blockId === selectedBlockId;

  const soundType = isSoundEvent(eventData)
    ? eventData.soundType
    : isChordEvent(eventData)
    ? eventData.type
    : isInstrumentEvent(eventData)
    ? eventData.instrumentType
    : 'beat';

  // The format of an id is "soundType/soundName" so parsing out the soundName
  const friendlyLabel = eventData.id.split('/').pop();

  return (
    <button
      tabIndex={-1}
      type="button"
      onKeyDown={onKeyDown}
      aria-label={friendlyLabel}
      className={classNames(
        TimelineElementClass,
        moduleStyles.timelineElement,
        SoundStyle[soundType]?.classNameBackground,
        SoundStyle[soundType]?.classNameBorder,
        isCurrentlyPlaying && moduleStyles.timelineElementPlaying,
        isInsideRandom && moduleStyles.timelineElementInsideRandom,
        isSkipSound && moduleStyles.timelineElementSkipSound,
        isBlockSelected && moduleStyles.timelineElementBlockSelected,
        !isPlaying && moduleStyles.timelineElementClickable,
        isThinBorder && moduleStyles.timelineElementThinBorder
      )}
      style={{
        width: barWidth * eventData.length,
        height,
        top,
        left,
      }}
      onClick={event => {
        selectBlockId?.(eventData.blockId);
        event.stopPropagation();
      }}
    >
      &nbsp;
    </button>
  );
};

export default TimelineElement;
