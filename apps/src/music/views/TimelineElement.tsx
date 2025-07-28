import classNames from 'classnames';
import React from 'react';
import {useDispatch} from 'react-redux';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {isChordEvent} from '../player/interfaces/ChordEvent';
import {isInstrumentEvent} from '../player/interfaces/InstrumentEvent';
import {PlaybackEvent} from '../player/interfaces/PlaybackEvent';
import {isSoundEvent} from '../player/interfaces/SoundEvent';
import {selectBlockId} from '../redux/musicRedux';
import SoundStyle from '../utils/SoundStyle';

import moduleStyles from './timeline.module.scss';

interface TimelineElementProps {
  eventData: PlaybackEvent;
  barWidth: number;
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
  height,
  top,
  left,
}) => {
  const isPlaying = useAppSelector(state => state.music.isPlaying);
  const selectedBlockId = useAppSelector(state => state.music.selectedBlockId);
  const dispatch = useDispatch();
  const isInsideRandom = eventData.skipContext?.insideRandom;
  const isSkipSound = isPlaying && eventData.skipContext?.skipSound;
  const isThinBorder = height <= 4;

  const isCurrentlyPlaying = useAppSelector(state => {
    const currentPlayheadPosition = state.music.currentPlayheadPosition;
    return (
      isPlaying &&
      !isSkipSound &&
      currentPlayheadPosition !== 0 &&
      currentPlayheadPosition >= eventData.when &&
      currentPlayheadPosition < eventData.when + eventData.length
    );
  });

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
      type="button"
      aria-label={friendlyLabel}
      className={classNames(
        'timeline-element',
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
        dispatch(selectBlockId(eventData.blockId));
        event.stopPropagation();
      }}
    >
      &nbsp;
    </button>
  );
};

export default TimelineElement;
