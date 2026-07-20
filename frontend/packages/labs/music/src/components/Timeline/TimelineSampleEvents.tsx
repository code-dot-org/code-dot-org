import React, {useState} from 'react';

import type {PlaybackEvent} from '../../player/interfaces/PlaybackEvent';
import {useAppSelector} from '../../redux/store';
import UniqueSounds from '../../utils/UniqueSounds';

import TimelineElement from './TimelineElement';

export interface TimelineSampleEventsProps {
  paddingOffset: number;
  barWidth: number;
  getEventHeight: (soundCount: number) => number;
  getEventVerticalSpace: (eventHeight: number) => number;
}

/**
 * Renders timeline events, organized by unique sample ID.
 */
const TimelineSampleEvents: React.FunctionComponent<
  TimelineSampleEventsProps
> = ({paddingOffset, barWidth, getEventHeight, getEventVerticalSpace}) => {
  const soundEvents = useAppSelector(state => state.music.playbackEvents);

  // Use useState with lazy initializer to create the UniqueSounds instance once.
  // This preserves its internal state (previousUniqueSounds) across renders.
  const [uniqueSounds] = useState(() => new UniqueSounds());
  // Cache the value of getUniqueSounds() so that the various helpers
  // we call during render don't need to recalculate it. This also ensures
  // that we recalculate unique sounds, even when there are no entries to
  // render.
  const currentUniqueSounds = uniqueSounds.getUniqueSounds(soundEvents);

  const getVerticalOffsetForEventId = (id: string) => {
    return (
      getUniqueIndexForEventId(id) * getEventHeight(currentUniqueSounds.length)
    );
  };

  const getUniqueIndexForEventId = (id: string) => {
    return currentUniqueSounds.indexOf(id);
  };

  const eventHeight = getEventHeight(currentUniqueSounds.length);
  const eventVerticalSpace = getEventVerticalSpace(eventHeight);

  return (
    <>
      {soundEvents.map((eventData: PlaybackEvent, index: number) => (
        <TimelineElement
          key={index}
          eventData={eventData}
          barWidth={barWidth}
          height={eventHeight - eventVerticalSpace}
          top={32 + getVerticalOffsetForEventId(eventData.id)}
          left={paddingOffset + barWidth * (eventData.when - 1)}
        />
      ))}
    </>
  );
};

export default TimelineSampleEvents;
