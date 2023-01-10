import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import moduleStyles from './timeline.module.scss';
import classNames from 'classnames';
import TimelineSampleEvents from './TimelineSampleEvents';
import {PlayerUtilsContext} from './context';
import appConfig from './appConfig';
import TimelineTrackEvents from './TimelineTrackEvents';

const barWidth = 60;
const numMeasures = 30;
// Leave some vertical space between each event block.
const eventVerticalSpace = 2;

const colorClasses = [
  moduleStyles.timelineElementPurple,
  moduleStyles.timelineElementBlue,
  moduleStyles.timelineElementGreen,
  moduleStyles.timelineElementYellow
];

const Timeline = ({isPlaying, currentAudioElapsedTime, sounds}) => {
  const playerUtils = useContext(PlayerUtilsContext);
  const currentMeasure = playerUtils.getCurrentMeasure();

  const getLengthForId = id => {
    const splitId = id.split('/');
    const path = splitId[0];
    const src = splitId[1];

    const folder = sounds.find(folder => folder.path === path);
    const sound = folder.sounds.find(sound => sound.src === src);

    return sound.length;
  };

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

  const playHeadOffset = isPlaying
    ? (currentAudioElapsedTime * barWidth) /
      playerUtils.convertMeasureToSeconds(1)
    : null;

  const timelineElementProps = {
    barWidth,
    eventVerticalSpace,
    getLengthForId,
    getEventHeight,
    colorClasses
  };

  return (
    <div id="timeline" className={moduleStyles.wrapper}>
      <div className={moduleStyles.container}>
        <div className={moduleStyles.fullWidthOverlay}>
          {[...Array(numMeasures).keys()].map((measure, index) => {
            return (
              <div
                key={index}
                className={moduleStyles.barLineContainer}
                style={{left: measure * barWidth}}
              >
                <div
                  className={classNames(
                    moduleStyles.barLine,
                    measure === currentMeasure && moduleStyles.barLineCurrent
                  )}
                />
                <div className={moduleStyles.barNumber}>{measure + 1}</div>
              </div>
            );
          })}
        </div>

        <div className={moduleStyles.soundsArea}>
          {appConfig.getValue('blocks') === 'tracks' ? (
            <TimelineTrackEvents {...timelineElementProps} />
          ) : (
            <TimelineSampleEvents {...timelineElementProps} />
          )}
        </div>

        <div className={moduleStyles.fullWidthOverlay}>
          {playHeadOffset !== null && (
            <div
              className={moduleStyles.playhead}
              style={{left: playHeadOffset}}
            >
              &nbsp;
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Timeline.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  currentAudioElapsedTime: PropTypes.number.isRequired,
  sounds: PropTypes.array
};

export default Timeline;
