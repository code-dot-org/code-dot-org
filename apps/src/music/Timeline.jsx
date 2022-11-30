import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

const barWidth = 60;

const Timeline = ({
  isPlaying,
  convertMeasureToSeconds,
  currentMeasure,
  sounds,
  // populated by Redux
  soundEvents,
  currentAudioElapsedTime
}) => {
  const getEventHeight = () => {
    const numUniqueSounds = getUniqueSounds().length;
    const actualHeight = 110;

    // While we might not actually have this many rows to show,
    // we will limit each row's height to the size that would allow
    // this many to be shown at once.
    const minVisible = 5;

    const maxVisible = 10;

    // We might not actually have this many rows to show, but
    // we will size the bars so that this many rows would show.
    const numSoundsToShow = Math.max(
      Math.min(numUniqueSounds, maxVisible),
      minVisible
    );

    return Math.floor(actualHeight / numSoundsToShow);
  };

  const getUniqueSounds = () => {
    // Each unique sound gets its own color/row.
    const uniqueSounds = [];
    for (const songEvent of soundEvents) {
      const id = songEvent.id;
      if (uniqueSounds.indexOf(id) === -1) {
        uniqueSounds.push(id);
      }
    }
    return uniqueSounds;
  };

  const getUniqueIndexForEventId = id => {
    return getUniqueSounds().indexOf(id);
  };

  const getVerticalOffsetForEventId = id => {
    return getUniqueIndexForEventId(id) * getEventHeight();
  };

  const getColorsForEventId = id => {
    const colors = [
      {background: 'purple', border: 'lightpink'},
      {background: 'blue', border: 'lightblue'},
      {background: 'green', border: 'lightgreen'},
      {background: 'yellow', border: 'brown'}
    ];

    return colors[getUniqueIndexForEventId(id) % 4];
  };

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

  // Leave some vertical space between each event block.
  const eventVerticalSpace = 2;

  return (
    <div
      id="timeline"
      style={{
        backgroundColor: '#222',
        width: '100%',
        height: '100%',
        borderRadius: 4,
        backgroundSize: '100% 200%',
        padding: 10,
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          overflowY: 'hidden',
          height: '100%',
          position: 'relative'
        }}
      >
        <div
          style={{
            width: 900,
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
          {[...Array(30).keys()].map((measure, index) => {
            return (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: measure * barWidth,
                  width: 1,
                  height: '100%'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 20,
                    bottom: 0,
                    borderLeft:
                      measure === currentMeasure
                        ? '2px #888 solid'
                        : '2px #444 solid',
                    color: measure === currentMeasure ? '#ddd' : '#888'
                  }}
                />
                <div style={{paddingLeft: 6}}>{measure + 1}</div>
              </div>
            );
          })}
        </div>

        <div style={{width: 900, height: '100%'}}>
          {soundEvents.map((eventData, index) => {
            return (
              <div
                key={index}
                style={{
                  width: barWidth * getLengthForId(eventData.id) - 4,
                  position: 'absolute',
                  boxSizing: 'border-box',
                  left: barWidth * eventData.when,
                  top: 20 + getVerticalOffsetForEventId(eventData.id),
                  backgroundColor: getColorsForEventId(eventData.id).background,
                  border:
                    'solid 2px ' + getColorsForEventId(eventData.id).border,
                  borderRadius: 8,
                  height: getEventHeight() - eventVerticalSpace
                }}
              >
                &nbsp;
              </div>
            );
          })}
        </div>

        <div
          style={{
            width: 900,
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
          {playHeadOffset !== null && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: playHeadOffset,
                width: 1,
                height: '100%',
                borderLeft: '3px yellow solid'
              }}
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
  convertMeasureToSeconds: PropTypes.func.isRequired,
  currentMeasure: PropTypes.number.isRequired,
  soundEvents: PropTypes.array.isRequired,
  sounds: PropTypes.array
};

export default connect(state => ({
  currentAudioElapsedTime: state.music.currentAudioElapsedTime,
  soundEvents: state.music.soundEvents
}))(Timeline);
