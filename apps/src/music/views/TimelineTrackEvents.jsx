import PropTypes from 'prop-types';
import classNames from 'classnames';
import React, {useContext, useMemo} from 'react';
import {PlayerUtilsContext} from '../context';
import moduleStyles from './timeline.module.scss';

const TimelineTrackEvents = ({
  barWidth,
  eventVerticalSpace,
  getEventHeight,
  colorClasses,
  getLengthForId
}) => {
  const playerUtils = useContext(PlayerUtilsContext);
  const soundEvents = playerUtils.getSoundEvents();
  const tracksMetadata = playerUtils.getTracksMetadata();

  const organizeSoundsByTracks = (soundEvents, tracksMetadata) => {
    const tracksToSounds = {};

    soundEvents.forEach(event => {
      if (!event.trackId) {
        console.warn(`No track found for event ${event.id}`);
      } else {
        if (!tracksToSounds[event.trackId]) {
          tracksToSounds[event.trackId] = {
            name: tracksMetadata[event.trackId].name,
            sounds: []
          };
        }

        tracksToSounds[event.trackId].sounds.push(event);
      }
    });

    return tracksToSounds;
  };

  const tracksToSounds = useMemo(
    () => organizeSoundsByTracks(soundEvents, tracksMetadata),
    [soundEvents, tracksMetadata]
  );

  const numTracks = Object.keys(tracksToSounds).length;
  // Available height is 110 - number of track titles times track title height (18px)
  const eventHeight =
    getEventHeight(numTracks, 110 - numTracks * 18) - eventVerticalSpace;

  return (
    <div className={moduleStyles.tracksContainer}>
      {Object.keys(tracksToSounds).map((trackId, index) => {
        const colorClass = colorClasses[index % 4];
        return (
          <div className={moduleStyles.trackRowContainer} key={index}>
            <div className={moduleStyles.trackName}>
              {tracksToSounds[trackId].name}
            </div>
            <div style={{height: eventHeight}}>
              {tracksToSounds[trackId].sounds.map((eventData, index) => {
                return (
                  <div
                    key={index}
                    className={classNames(
                      moduleStyles.timelineElement,
                      colorClass
                    )}
                    style={{
                      width: barWidth * getLengthForId(eventData.id) - 4,
                      left: barWidth * eventData.when,
                      height: eventHeight
                    }}
                  >
                    &nbsp;
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

TimelineTrackEvents.propTypes = {
  barWidth: PropTypes.number.isRequired,
  eventVerticalSpace: PropTypes.number.isRequired,
  getLengthForId: PropTypes.func.isRequired,
  colorClasses: PropTypes.array.isRequired,
  getEventHeight: PropTypes.func.isRequired
};

export default TimelineTrackEvents;
