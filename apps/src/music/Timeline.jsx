import PropTypes from 'prop-types';
import React from 'react';
import UniqueSounds from './utils/UniqueSounds';

const barWidth = 60;

export default class Timeline extends React.Component {
  static propTypes = {
    isPlaying: PropTypes.bool.isRequired,
    songData: PropTypes.object.isRequired,
    currentAudioElapsedTime: PropTypes.number.isRequired,
    convertMeasureToSeconds: PropTypes.func.isRequired,
    currentMeasure: PropTypes.number.isRequired,
    sounds: PropTypes.array
  };

  constructor(props) {
    super(props);

    this.uniqueSounds = new UniqueSounds();
  }

  getEventHeight = () => {
    const numUniqueSounds = this.currentUniqueSounds.length;
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

  getUniqueIndexForEventId = id => {
    return this.currentUniqueSounds.indexOf(id);
  };

  getVerticalOffsetForEventId = id => {
    return this.getUniqueIndexForEventId(id) * this.getEventHeight();
  };

  getColorsForEventId = id => {
    const colors = [
      {background: 'purple', border: 'lightpink'},
      {background: 'blue', border: 'lightblue'},
      {background: 'green', border: 'lightgreen'},
      {background: 'yellow', border: 'brown'}
    ];

    return colors[this.getUniqueIndexForEventId(id) % 4];
  };

  getLengthForId = id => {
    const splitId = id.split('/');
    const path = splitId[0];
    const src = splitId[1];

    const folder = this.props.sounds.find(folder => folder.path === path);
    const sound = folder.sounds.find(sound => sound.src === src);

    return sound.length;
  };

  render() {
    const {
      isPlaying,
      songData,
      currentAudioElapsedTime,
      convertMeasureToSeconds,
      currentMeasure
    } = this.props;

    const playHeadOffset = isPlaying
      ? (currentAudioElapsedTime * barWidth) / convertMeasureToSeconds(1)
      : null;

    // Leave some vertical space between each event block.
    const eventVerticalSpace = 2;

    // Let's cache the value of getUniqueSounds() so that the various helpers
    // we call during render don't need to recalculate it.  This also ensures
    // that we recalculate unique sounds, even when there are no entries to
    // render.
    this.currentUniqueSounds = this.uniqueSounds.getUniqueSounds(
      this.props.songData.events
    );

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
            {songData.events.map((eventData, index) => {
              return (
                <div
                  key={index}
                  style={{
                    width: barWidth * this.getLengthForId(eventData.id) - 4,
                    position: 'absolute',
                    boxSizing: 'border-box',
                    left: barWidth * eventData.when,
                    top: 20 + this.getVerticalOffsetForEventId(eventData.id),
                    backgroundColor: this.getColorsForEventId(eventData.id)
                      .background,
                    border:
                      'solid 2px ' +
                      this.getColorsForEventId(eventData.id).border,
                    borderRadius: 8,
                    height: this.getEventHeight() - eventVerticalSpace
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
  }
}
