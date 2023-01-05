import PropTypes from 'prop-types';
import React from 'react';
import moduleStyles from './timeline.module.scss';
import classNames from 'classnames';
import TimelineSampleEvents from './TimelineSampleEvents';

const barWidth = 60;
const numMeasures = 30;
// Leave some vertical space between each event block.
const eventVerticalSpace = 2;

const Timeline = ({
  isPlaying,
  songData,
  currentAudioElapsedTime,
  convertMeasureToSeconds,
  currentMeasure,
  sounds
}) => {
  const getLengthForId = id => {
    const splitId = id.split('/');
    const path = splitId[0];
    const src = splitId[1];

    const folder = sounds.find(folder => folder.path === path);
    const sound = folder.sounds.find(sound => sound.src === src);

    return sound.length;
  };

  const playHeadOffset = isPlaying
    ? (currentAudioElapsedTime * barWidth) / convertMeasureToSeconds(1)
    : null;

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
          <TimelineSampleEvents
            songData={songData}
            barWidth={barWidth}
            eventVerticalSpace={eventVerticalSpace}
            getLengthForId={getLengthForId}
          />
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
  songData: PropTypes.object.isRequired,
  currentAudioElapsedTime: PropTypes.number.isRequired,
  convertMeasureToSeconds: PropTypes.func.isRequired,
  currentMeasure: PropTypes.number.isRequired,
  sounds: PropTypes.array
};

export default Timeline;
