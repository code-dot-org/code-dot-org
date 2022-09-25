import PropTypes from 'prop-types';
import React from 'react';

const barWidth = 60;

export default class Timeline extends React.Component {
  static propTypes = {
    currentGroup: PropTypes.object,
    isPlaying: PropTypes.bool.isRequired,
    playTrigger: PropTypes.func.isRequired,
    songData: PropTypes.object.isRequired,
    currentAudioElapsedTime: PropTypes.number.isRequired,
    convertMeasureToSeconds: PropTypes.func.isRequired,
    baseUrl: PropTypes.string.isRequired,
    currentMeasure: PropTypes.number.isRequired
  };

  getVerticalOffsetForEventId = id => {
    if (id.indexOf('lead') !== -1) {
      return 0;
    } else if (id.indexOf('bass') !== -1) {
      return 6;
    } else if (id.indexOf('drum') !== -1) {
      return 12;
    } else {
      return 0;
    }
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

  render() {
    const {
      currentGroup,
      isPlaying,
      playTrigger,
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
          height: 100,
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
          backgroundSize: '100% 200%'
        }}
      >
        <div style={{float: 'left'}}>
          Timeline
          <br />
          <br />
        </div>
        {isPlaying && (
          <div style={{float: 'right'}}>
            <button
              type="button"
              onClick={() => playTrigger()}
              style={{padding: 2, fontSize: 10, margin: 0}}
            >
              trigger
            </button>
          </div>
        )}
        <div
          style={{
            width: '100%',
            overflow: 'hidden',
            height: 50,
            position: 'relative'
          }}
        >
          <div style={{width: 900}}>
            {songData.events.map((eventData, index) => {
              return (
                <div
                  key={index}
                  style={{
                    width: barWidth * 2,
                    _borderLeft: '1px white solid',
                    position: 'absolute',
                    left: barWidth * eventData.when,
                    top: 12 + this.getVerticalOffsetForEventId(eventData.id)
                  }}
                >
                  <img
                    src={this.getWaveformImage(eventData.id)}
                    style={{width: barWidth * 2, paddingRight: 20}}
                  />
                </div>
              );
            })}
          </div>

          <div style={{width: 900, position: 'absolute', top: 0, left: 0}}>
            {playHeadOffset !== null && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: playHeadOffset,
                  width: 1,
                  height: 40,
                  borderLeft: '3px yellow solid'
                }}
              >
                &nbsp;
              </div>
            )}
          </div>

          <div style={{width: 900, position: 'absolute', top: 0, left: 0}}>
            {[...Array(30).keys()].map((measure, index) => {
              return (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: measure * barWidth,
                    width: 1,
                    height: 40,
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
        </div>
      </div>
    );
  }
}
