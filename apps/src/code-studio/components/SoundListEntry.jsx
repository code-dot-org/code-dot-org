var React = require('react');
import Radium from 'radium';

/**
 * Sound entry.
 */
var SoundListEntry = React.createClass({
  propTypes: {
    assetChosen: React.PropTypes.func.isRequired,
    soundMetadata: React.PropTypes.object.isRequired,
    isSelected: React.PropTypes.bool.isRequired,
    soundsRegistry: React.PropTypes.object.isRequired
  },

  getInitialState: function () {
    return {
      isPlaying: false
    };
  },

  componentWillReceiveProps: function (nextProps) {
    if (!nextProps.isSelected) {
      this.setState({isPlaying: false});
    }
  },

  clickSoundControl: function () {
    if (this.state.isPlaying) {
      this.props.soundsRegistry.stopAllAudio();
      this.setState({isPlaying: false});
    } else {
      this.setState({isPlaying: true});
      this.props.soundsRegistry.playURL(
        this.props.soundMetadata.sourceUrl,
        { onEnded: function () {
          this.setState({isPlaying: false});
        }.bind(this)
      });
    }
  },

  render: function () {
    var columnWidth = '215px';

    var styles = {
      root: {
        float: 'left',
        width: columnWidth,
        height: '35px',
        cursor: 'pointer',
        margin: '5px',
        padding: '6px',
        border: 'solid 0px',
        borderRadius: '5px'
      },
      selected: {
        backgroundColor: '#cfc9de'
      },
      notSelected: {
        backgroundColor: '#ffffff'
      },
      icon: {
        float: 'left',
        padding: '6px 10px 6px 2px'
      },
      metadata: {
        float: 'left',
        width: '175px',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      },
      soundName: {
        fontSize: '14px'
      },
      time: {
        color: '#5b6770',
        fontSize: '11px'
      }
    };

    const selectedColor = this.props.isSelected ? styles.selected : styles.notSelected;
    const playIcon = this.state.isPlaying ? 'fa-pause-circle' : 'fa-play-circle';

    return (
      <div
        style={[styles.root, selectedColor]}
        title={this.props.soundMetadata.name}
        onClick={this.props.assetChosen.bind(null, this.props.soundMetadata)}
      >
        <div style={styles.icon}>
          <i onClick={this.clickSoundControl} className={'fa ' + playIcon + ' fa-2x'} />
        </div>
        <div style={styles.metadata}>
          <span style={styles.soundName}>
            {this.props.soundMetadata.name + '.mp3'}
          </span>
          <br />
          <span style={styles.time}>
            {getTimeString(this.props.soundMetadata.time)}
          </span>
        </div>
      </div>
    );
  }
});
module.exports = Radium(SoundListEntry);

// Adapted from: http://stackoverflow.com/questions/6312993/javascript-seconds-to-time-string-with-format-hhmmss
var getTimeString = function (numSeconds) {
  var sec_num = parseInt(numSeconds, 10);
  var hours   = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  var seconds = sec_num - (hours * 3600) - (minutes * 60);

  if (seconds < 1) {
    return 'Less than 1 second';
  }

  if (minutes < 10) {minutes = "0"+minutes;}
  if (seconds < 10) {seconds = "0"+seconds;}
  return minutes+':'+seconds;
};
