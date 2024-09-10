import classNames from 'classnames';
import React from 'react';
import {useDispatch} from 'react-redux';

import {PlaybackEvent} from '../player/interfaces/PlaybackEvent';
import {SoundEvent} from '../player/interfaces/SoundEvent';
import {selectBlockId} from '../redux/musicRedux';
import SoundStyle from '../utils/SoundStyle';

import {useMusicSelector} from './types';

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
  const isPlaying = useMusicSelector(state => state.music.isPlaying);
  const selectedBlockId = useMusicSelector(
    state => state.music.selectedBlockId
  );
  const dispatch = useDispatch();
  const currentPlayheadPosition = useMusicSelector(
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

  const soundType =
    eventData.type === 'sound'
      ? (eventData as SoundEvent).soundType
      : eventData.type;

  return (
    <div
      className={classNames(
        'timeline-element',
        moduleStyles.timelineElement,
        SoundStyle[soundType]?.classNameBackground,
        SoundStyle[soundType]?.classNameBorder,
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
