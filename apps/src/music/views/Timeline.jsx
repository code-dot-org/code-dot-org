import React from 'react';
import moduleStyles from './timeline.module.scss';
import classNames from 'classnames';
import TimelineSampleEvents from './TimelineSampleEvents';
import TimelineTrackEvents from './TimelineTrackEvents';
import TimelineSimple2Events from './TimelineSimple2Events';
import {getBlockMode} from '../appConfig';
import {BlockMode} from '../constants';
import {useDispatch, useSelector} from 'react-redux';
import {clearSelectedBlockId} from '../redux/musicRedux';

const barWidth = 60;
const minNumMeasures = 30;
// Leave some vertical space between each event block.
const eventVerticalSpace = 2;
// A little room on the left.
const paddingOffset = 10;

/**
 * Renders the music playback timeline.
 */
const Timeline = () => {
  const isPlaying = useSelector(state => state.music.isPlaying);
  const dispatch = useDispatch();
  const currentPlayheadPosition = useSelector(
    state => state.music.currentPlayheadPosition
  );
  const measuresToDisplay = Math.max(
    minNumMeasures,
    useSelector(state => state.music.lastMeasure)
  );

  const getEventHeight = (numUniqueRows, availableHeight = 110) => {
    // While we might not actually have this many rows to show,
    // we will limit each row's height to the size that would allow
    // this many to be shown at once.
    const minVisible = 5;

    const maxVisible = 10;

    // We might not actually have this many rows to show, but
    // we will size the bars so that this many rows would show.
    const numSoundsToShow = Math.max(
      Math.min(numUniqueRows, maxVisible),
      minVisible
    );

    return Math.floor(availableHeight / numSoundsToShow);
  };

  const playHeadOffsetInPixels = isPlaying
    ? (currentPlayheadPosition - 1) * barWidth
    : null;

  const timelineElementProps = {
    paddingOffset,
    barWidth,
    eventVerticalSpace,
    getEventHeight,
  };

  // Generate an array containing measure numbers from 1..measuresToDisplay.
  const arrayOfMeasures = Array.from(
    {length: measuresToDisplay},
    (_, i) => i + 1
  );

  return (
    <div
      id="timeline"
      className={moduleStyles.timeline}
      onClick={() => dispatch(clearSelectedBlockId())}
    >
      <div
        id="timeline-measures-background"
        className={classNames(
          moduleStyles.measuresBackground,
          moduleStyles.fullWidthOverlay
        )}
        style={{width: paddingOffset + measuresToDisplay * barWidth}}
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
                    moduleStyles.barNumberCurrent
                )}
              >
                {measure}
              </div>
              <div
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
        {getBlockMode() === BlockMode.TRACKS ? (
          <TimelineTrackEvents {...timelineElementProps} />
        ) : getBlockMode() === BlockMode.SIMPLE2 ? (
          <TimelineSimple2Events {...timelineElementProps} />
        ) : (
          <TimelineSampleEvents {...timelineElementProps} />
        )}
      </div>

      <div id="timeline-playhead" className={moduleStyles.fullWidthOverlay}>
        {playHeadOffsetInPixels !== null && (
          <div
            className={moduleStyles.playhead}
            style={{left: paddingOffset + playHeadOffsetInPixels}}
          >
            &nbsp;
          </div>
        )}
      </div>
    </div>
  );
};

Timeline.propTypes = {};

export default Timeline;
