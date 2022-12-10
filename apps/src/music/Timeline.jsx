import PropTypes from 'prop-types';
import React from 'react';

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

    this.previousUniqueSounds = null;
  }

  getEventHeight = () => {
    const numUniqueSounds = this.getUniqueSounds().length;
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

  getUniqueSounds = () => {
    // Each unique sound gets its own row (and therefore color).
    // If a sound was showing previously, then we'll attempt to keep
    // it in the same row, though we won't have empty rows.

    // First, generate a list of all unique sounds.
    const uniqueSounds = [];
    for (const songEvent of this.props.songData.events) {
      const id = songEvent.id;
      if (uniqueSounds.indexOf(id) === -1) {
        uniqueSounds.push(id);
      }
    }

    // This is the actual output.  It will be the same length as uniqueSounds.
    // Fill it with undefined entries.
    let outputSounds = new Array(uniqueSounds.length).fill(undefined);

    // If we have a previous output from this function, then we'll attempt
    // to keep those entries in the same rows as they were before.
    if (this.previousUniqueSounds) {
      // For each of those previous entries...
      for (let i = 0; i < this.previousUniqueSounds.length; i++) {
        // ...if it's still in use...
        if (uniqueSounds.indexOf(this.previousUniqueSounds[i]) !== -1) {
          // ... put it back in that row.
          outputSounds[i] = this.previousUniqueSounds[i];
        }
      }

      // For each of our known current sounds...
      for (let j = 0; j < uniqueSounds.length; j++) {
        // ... if it's not yet in a row...
        if (outputSounds.indexOf(uniqueSounds[j]) === -1) {
          // ...then put it in the first row available.
          let row = outputSounds.findIndex(x => x === undefined);
          outputSounds[row] = uniqueSounds[j];

          // (One scenario where this helps is when a sound is renamed.
          // The new  entry will replace the old one in the same row.)
        }
      }

      // Remove empty rows.
      outputSounds = outputSounds.filter(s => {
        return s !== undefined;
      });
    } else {
      outputSounds = uniqueSounds;
    }

    // Remember this set for next time.
    this.previousUniqueSounds = outputSounds;

    return outputSounds;
  };

  getUniqueIndexForEventId = id => {
    return this.getUniqueSounds().indexOf(id);
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
