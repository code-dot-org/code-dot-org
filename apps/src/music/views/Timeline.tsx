import classNames from 'classnames';
import React, {
  memo,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {isPredictResponseSubmitted} from '@cdo/apps/lab2/redux/predictLevelRedux';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import appConfig from '../appConfig';
import {BlockMode, MIN_NUM_MEASURES} from '../constants';
import musicI18n from '../locale';
import {
  clearSelectedBlockId,
  getBlockMode,
  setStartingPlayheadPosition,
} from '../redux/musicRedux';

import usePlaybackUpdate from './hooks/usePlaybackUpdate';
import {TimelineElementClass} from './TimelineElement';
import TimelineSampleEvents from './TimelineSampleEvents';
import TimelineSimple2Events from './TimelineSimple2Events';
import {useMusicSelector} from './types';

import moduleStyles from './timeline.module.scss';

// The width of one measure.
const barWidth = 60;
// A little room on the left.
const paddingOffset = 10;
// Start scrolling the playhead when it's more than this percentage of the way across the timeline area.
const playheadScrollThreshold = 0.75;
// How many extra measures to show at the end.
const extraMeasures = 8;

interface TimelineProps {
  allowChangeStartingPlayheadPosition?: boolean;
  isPredictLevel?: boolean;
}

/**
 * Renders the music playback timeline.
 */
const Timeline: React.FunctionComponent<TimelineProps> = ({
  allowChangeStartingPlayheadPosition,
  isPredictLevel,
}) => {
  const isPlaying = useMusicSelector(state => state.music.isPlaying);

  const blockMode = useSelector(getBlockMode);
  const dispatch = useDispatch();
  const currentPlayheadPosition = useMusicSelector(
    state => state.music.currentPlayheadPosition
  );
  const startingPlayheadPosition = useMusicSelector(
    state => state.music.startingPlayheadPosition
  );

  const canChangeStartingPlayheadPosition =
    (allowChangeStartingPlayheadPosition ||
      appConfig.getValue('allow-change-starting-playhead-position') ===
        'true') &&
    !isPlaying;
  const measuresToDisplay =
    Math.max(
      MIN_NUM_MEASURES,
      useMusicSelector(state => state.music.lastMeasure)
    ) + extraMeasures;
  const loopEnabled = useMusicSelector(state => state.music.loopEnabled);
  const loopStart = useMusicSelector(state => state.music.loopStart);
  const loopEnd = useMusicSelector(state => state.music.loopEnd);
  const playheadRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const positionToUse = isPlaying
    ? currentPlayheadPosition
    : startingPlayheadPosition;
  const playHeadOffsetInPixels = (positionToUse - 1) * barWidth;

  // The height of the primary timeline area for drawing events.  This is the height of each measure's
  // vertical bar.
  const [availableHeight, setAvailableHeight] = useState(0);

  // Get the height that each event should occupy.  This is inclusive of empty vertical space at the bottom.
  const getEventHeight = useCallback(
    (numUniqueRows: number) => {
      // While we might not actually have this many rows to show,
      // we will limit each row's height to the size that would allow
      // this many to be shown at once.
      const minVisible = 5;

      const maxVisible = 45;

      // We might not actually have this many rows to show, but
      // we will size the bars so that this many rows would show.
      const numSoundsToShow = Math.max(
        Math.min(numUniqueRows, maxVisible),
        minVisible
      );

      return Math.floor(availableHeight / numSoundsToShow);
    },
    [availableHeight]
  );

  // How how much of the event height should be left as empty vertical space at the bottom.
  const getEventVerticalSpace = useCallback((eventHeight: number) => {
    return eventHeight > 8 ? 3 : eventHeight > 6 ? 2 : 1;
  }, []);

  const timelineElements = Array.from(
    document.querySelectorAll<HTMLElement>(`.${TimelineElementClass}`)
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      const currentIndex = timelineElements.indexOf(event.currentTarget);
      // For arrow keys, prevent scroll action and move focus accordingly, looping at start and end
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % timelineElements.length;
        timelineElements[nextIndex].focus();
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        const previousIndex =
          (currentIndex - 1 + timelineElements.length) %
          timelineElements.length;
        timelineElements[previousIndex].focus();
      } else if (event.key === 'Escape') {
        // Move focus back to the timeline container
        const timelineContainer = document.getElementById('timeline');
        if (timelineContainer) {
          timelineContainer.focus();
        }
      } else if (event.key === 'Tab') {
        // Prevent default tab behavior to avoid moving focus out of the timeline
        event.preventDefault();
      }
    },
    [timelineElements]
  );

  const enterExitTimeline = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      // Focus the first element if it exists
      if (timelineElements.length > 0) {
        timelineElements[0].focus();
      }
    }
    if (event.key === 'Tab') {
      // If tab is pressed, we know they are moving on to the next tabbable object
      (event.currentTarget as HTMLElement).blur();
    }
  };

  const timelineElementProps = {
    paddingOffset,
    barWidth,
    onKeyDown,
    getEventHeight,
    getEventVerticalSpace,
  };

  // Generate an array containing measure numbers from 1..measuresToDisplay.
  const arrayOfMeasures = Array.from(
    {length: measuresToDisplay},
    (_, i) => i + 1
  );

  const onMeasuresBackgroundClick = useCallback(
    (event: MouseEvent) => {
      if (!canChangeStartingPlayheadPosition) {
        return;
      }
      const offset =
        event.clientX -
        (event.target as Element).getBoundingClientRect().x -
        paddingOffset;
      const exactMeasure = offset / barWidth + 1;
      // Round measure to the nearest beat (1/4 note).
      const roundedMeasure = Math.round(exactMeasure * 4) / 4;
      dispatch(setStartingPlayheadPosition(roundedMeasure));
    },
    [dispatch, canChangeStartingPlayheadPosition]
  );

  const onMeasureNumberClick = useCallback(
    (measureNumber: number) => {
      if (!canChangeStartingPlayheadPosition) {
        return;
      }
      dispatch(setStartingPlayheadPosition(measureNumber));
    },
    [dispatch, canChangeStartingPlayheadPosition]
  );

  const onTimelineClick = useCallback(() => {
    dispatch(clearSelectedBlockId());
  }, [dispatch]);

  const scrollPlayheadForward = useCallback(() => {
    if (!timelineRef.current || !playheadRef.current) {
      return;
    }
    const playheadOffset =
      playheadRef.current.getBoundingClientRect().left -
      timelineRef.current.getBoundingClientRect().left;
    const scrollThreshold =
      timelineRef.current.clientWidth * playheadScrollThreshold;
    if (playheadOffset > scrollThreshold) {
      timelineRef.current.scrollBy(playheadOffset - scrollThreshold, 0);
    }
  }, [playheadRef]);

  const scrollToPlayhead = useCallback(() => {
    playheadRef.current?.scrollIntoView();
  }, [playheadRef]);

  usePlaybackUpdate(scrollPlayheadForward, scrollToPlayhead, scrollToPlayhead);
  const predictResponseSubmitted = useAppSelector(isPredictResponseSubmitted);
  const canPopulateTimeline = !isPredictLevel || predictResponseSubmitted;

  const firstBarLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!firstBarLineRef.current) {
      return;
    }
    const resizeObserver = new ResizeObserver(() => {
      setAvailableHeight(firstBarLineRef.current?.offsetHeight || 0);
    });
    resizeObserver.observe(firstBarLineRef?.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      id="timeline"
      aria-label={musicI18n.timelineContainer()}
      className={classNames(
        moduleStyles.timeline,
        isPlaying && moduleStyles.timelinePlaying
      )}
      onClick={onTimelineClick}
      onKeyDown={enterExitTimeline}
      ref={timelineRef}
      tabIndex={0} // eslint-disable-line jsx-a11y/no-noninteractive-tabindex
    >
      <div
        id="timeline-measures-background"
        className={classNames(
          moduleStyles.measuresBackground,
          moduleStyles.fullWidthOverlay,
          canChangeStartingPlayheadPosition &&
            moduleStyles.measuresBackgroundClickable
        )}
        style={{width: paddingOffset + measuresToDisplay * barWidth}}
        onClick={onMeasuresBackgroundClick}
      >
        &nbsp;
      </div>
      <div id="timeline-measures" className={moduleStyles.fullWidthOverlay}>
        {arrayOfMeasures.map((measure, index) => {
          return (
            <div
              key={index}
              className={moduleStyles.barLineContainer}
              style={{left: paddingOffset + index * barWidth}}
            >
              <div
                className={classNames(
                  moduleStyles.barNumber,
                  measure === Math.floor(currentPlayheadPosition) &&
                    moduleStyles.barNumberCurrent,
                  canChangeStartingPlayheadPosition &&
                    moduleStyles.barNumberClickable
                )}
                onClick={() => onMeasureNumberClick(measure)}
              >
                {measure}
              </div>
              <div
                id={index === 0 ? 'timeline-first-barline' : undefined}
                ref={index === 0 ? firstBarLineRef : undefined}
                className={classNames(
                  moduleStyles.barLine,
                  measure === Math.floor(currentPlayheadPosition) &&
                    moduleStyles.barLineCurrent
                )}
              />
            </div>
          );
        })}
      </div>

      <div id="timeline-soundsarea" className={moduleStyles.soundsArea}>
        {canPopulateTimeline &&
          (blockMode === BlockMode.SIMPLE2 ? (
            <TimelineSimple2Events {...timelineElementProps} />
          ) : (
            <TimelineSampleEvents {...timelineElementProps} />
          ))}
      </div>

      <div id="timeline-playhead" className={moduleStyles.fullWidthOverlay}>
        <div
          className={classNames(
            moduleStyles.playhead,
            isPlaying && moduleStyles.playheadPlaying
          )}
          style={{left: paddingOffset + playHeadOffsetInPixels}}
          ref={playheadRef}
        >
          &nbsp;
        </div>
      </div>
      {loopEnabled && <LoopMarkers loopStart={loopStart} loopEnd={loopEnd} />}
    </div>
  );
};

const LoopMarkers: React.FunctionComponent<{
  loopStart: number;
  loopEnd: number;
}> = ({loopStart, loopEnd}) => {
  const startOffset = (loopStart - 1) * barWidth;
  const endOffset = (loopEnd - 1) * barWidth;

  return (
    <>
      <div id="timeline-playhead" className={moduleStyles.fullWidthOverlay}>
        <div
          className={classNames(
            moduleStyles.playhead,
            moduleStyles.playheadLoop
          )}
          style={{left: paddingOffset + startOffset}}
        >
          &nbsp;
        </div>
      </div>
      <div id="timeline-playhead" className={moduleStyles.fullWidthOverlay}>
        <div
          className={classNames(
            moduleStyles.playhead,
            moduleStyles.playheadLoop
          )}
          style={{left: paddingOffset + endOffset}}
        >
          &nbsp;
        </div>
      </div>
    </>
  );
};

export default memo(Timeline);
