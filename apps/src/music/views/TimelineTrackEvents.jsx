import PropTypes from 'prop-types';
import React, {useContext, useMemo} from 'react';
import {PlayerUtilsContext} from '../context';
import moduleStyles from './timeline.module.scss';
import TimelineElement from './TimelineElement';

const TimelineTrackEvents = ({
  currentPlayheadPosition,
  barWidth,
  eventVerticalSpace,
  getEventHeight
}) => {
  const playerUtils = useContext(PlayerUtilsContext);
  // useMemo() compares dependency using Object.is() comparison, which won't work correctly
  // for arrays and objects, as it will consider object/arrays with different contents the same
  // if they are the same object/array reference. These values are relatively small and simple
  // so convert to JSON strings to get around this.
  const soundEventsJson = JSON.stringify(playerUtils.getPlaybackEvents());
  const tracksMetadataJson = JSON.stringify(playerUtils.getTracksMetadata());

  const organizeSoundsByTracks = (soundEventsJson, tracksMetadataJson) => {
    const soundEvents = JSON.parse(soundEventsJson);
    const tracksMetadata = JSON.parse(tracksMetadataJson);
    const tracksToSounds = {};

    soundEvents.forEach(event => {
      if (!event.trackId) {
        console.warn(`No track found for event ${event.id}`);
      } else {
        if (!tracksToSounds[event.trackId]) {
          tracksToSounds[event.trackId] = {
            name: tracksMetadata[event.trackId].name,
            soundsByTime: {},
            maxConcurrentSounds:
              tracksMetadata[event.trackId].maxConcurrentSounds
          };
        }

        const trackData = tracksToSounds[event.trackId];
        if (!trackData.soundsByTime[event.when]) {
          trackData.soundsByTime[event.when] = [];
        }

        trackData.soundsByTime[event.when].push(event);
      }
    });

    return tracksToSounds;
  };

  const tracksToSounds = useMemo(
    () => organizeSoundsByTracks(soundEventsJson, tracksMetadataJson),
    [soundEventsJson, tracksMetadataJson]
  );

  const numTracks = Object.keys(tracksToSounds).length;
  // Available height is 110 - number of track titles times track title height (18px)
  const singleElementHeight =
    getEventHeight(numTracks, 110 - numTracks * 18) - eventVerticalSpace;

  return (
    <div className={moduleStyles.tracksContainer}>
      {Object.keys(tracksToSounds).map((trackId, index) => {
        const currentTrackData = tracksToSounds[trackId];
        const trackElementsHeight =
          singleElementHeight * currentTrackData.maxConcurrentSounds;

        return (
          <div className={moduleStyles.trackRowContainer} key={index}>
            <div className={moduleStyles.trackName}>
              {currentTrackData.name}
            </div>
            <div style={{height: trackElementsHeight, position: 'relative'}}>
              {Object.keys(currentTrackData.soundsByTime).map((when, index) => (
                <div
                  style={{position: 'relative', left: barWidth * (when - 1)}}
                  key={index}
                >
                  {currentTrackData.soundsByTime[when].map(
                    (eventData, index) => (
                      <TimelineElement
                        key={index}
                        eventData={eventData}
                        barWidth={barWidth}
                        height={singleElementHeight}
                        top={index * singleElementHeight}
                        when={eventData.when}
                        currentPlayheadPosition={currentPlayheadPosition}
                      />
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

TimelineTrackEvents.propTypes = {
  currentPlayheadPosition: PropTypes.number.isRequired,
  barWidth: PropTypes.number.isRequired,
  eventVerticalSpace: PropTypes.number.isRequired,
  getEventHeight: PropTypes.func.isRequired
};

export default TimelineTrackEvents;
