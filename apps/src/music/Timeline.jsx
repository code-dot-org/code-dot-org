import PropTypes from 'prop-types';
import React from 'react';

const barWidth = 60;

export default class Timeline extends React.Component {
  static propTypes = {
    currentGroup: PropTypes.object,
    isPlaying: PropTypes.bool.isRequired,
    songData: PropTypes.object.isRequired,
    currentAudioElapsedTime: PropTypes.number.isRequired,
    convertMeasureToSeconds: PropTypes.func.isRequired,
    baseUrl: PropTypes.string.isRequired,
    currentMeasure: PropTypes.number.isRequired,
    sounds: PropTypes.array.isRequired
  };

  getUniqueIndexForEventId = id => {
    // Each unique sound gets its own color/row.
    const uniqueSounds = [];
    for (const songEvent of this.props.songData.events) {
      const id = songEvent.id;
      if (uniqueSounds.indexOf(id) === -1) {
        uniqueSounds.push(id);
      }
    }

    return uniqueSounds.indexOf(id);
  };

  getVerticalOffsetForEventId = id => {
    return this.getUniqueIndexForEventId(id) * 24;
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

  getWaveformImage = id => {
    const filenameToImgUrl = {
      waveform_lead: require('@cdo/static/music/waveform-lead.png'),
      waveform_bass: require('@cdo/static/music/waveform-bass.png'),
      waveform_drum: require('@cdo/static/music/waveform-drum.png')
    };

    return (
      filenameToImgUrl['waveform_' + id] || filenameToImgUrl['waveform_lead']
    );
  };

  getLengthForId = id => {
    console.log(id, this.props.sounds);
    const splitId = id.split('/');
    const path = splitId[0];
    const src = splitId[1];

    const folder = this.props.sounds.find(folder => folder.path === path);
    const sound = folder.sounds.find(sound => sound.src === src);

    return sound.length;
  };

  render() {
    const {
      currentGroup,
      isPlaying,
      songData,
      currentAudioElapsedTime,
      convertMeasureToSeconds,
      baseUrl,
      currentMeasure
    } = this.props;

    const playHeadOffset = isPlaying
      ? (currentAudioElapsedTime * barWidth) / convertMeasureToSeconds(1)
      : null;

    return (
      <div
        style={{
          backgroundColor: '#222',
          height: 140,
          width: '100%',
          borderRadius: 4,
          padding: 10,
          boxSizing: 'border-box',
          backgroundImage:
            currentGroup &&
            `url("${baseUrl +
              currentGroup.path +
              '/' +
              currentGroup.themeImageSrc}")`,
          backgroundSize: '100% 200%',
          position: 'absolute',
          bottom: 0
        }}
      >
        <div
          style={{
            width: '100%',
            overflow: 'hidden',
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
                    height: '100%',
                    borderLeft:
                      measure === currentMeasure
                        ? '2px #888 solid'
                        : '2px #444 solid',
                    color: measure === currentMeasure ? '#ddd' : '#888',
                    paddingLeft: 5
                  }}
                >
                  {measure + 1}
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
                    width: barWidth * this.getLengthForId(eventData.id),
                    _borderLeft: '1px white solid',
                    position: 'absolute',
                    left: barWidth * eventData.when,
                    top: 20 + this.getVerticalOffsetForEventId(eventData.id),
                    backgroundColor: this.getColorsForEventId(eventData.id)
                      .background,
                    border:
                      'solid 2px ' +
                      this.getColorsForEventId(eventData.id).border,
                    borderRadius: 8,
                    height: 18
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
