import React, {PropTypes} from 'react';
import Radium from 'radium';
import * as color from "../../util/color";

const styles = {
  root: {
    float: 'left',
    width: 215,
    height: 35,
    cursor: 'pointer',
    margin: 5,
    padding: 6,
    border: 'solid 0px',
    borderRadius: 5
  },
  selected: {
    backgroundColor: color.lighter_purple
  },
  notSelected: {
    backgroundColor: color.white
  },
  icon: {
    float: 'left',
    padding: '6px 10px 6px 2px'
  },
  metadata: {
    float: 'left',
    width: 175,
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  soundName: {
    fontSize: 14
  },
  time: {
    color: color.charcoal,
    fontSize: 11
  }
};

/**
 * Component for a single sound tile in the Sound Library.
 * Used in App Lab and Game Lab
 */
export default Radium(class SoundListEntry extends React.Component {
  static propTypes = {
    assetChosen: PropTypes.func.isRequired,
    soundMetadata: PropTypes.object.isRequired,
    isSelected: PropTypes.bool.isRequired,
    soundsRegistry: PropTypes.object.isRequired
  };

  state = {isPlaying: false};

  componentWillReceiveProps(nextProps) {
    if (!nextProps.isSelected) {
      this.setState({isPlaying: false});
    }
  }

  clickSoundControl = () => {
    if (this.state.isPlaying) {
      this.props.soundsRegistry.stopAllAudio();
      this.setState({isPlaying: false});
    } else {
      this.setState({isPlaying: true});
      this.props.soundsRegistry.playURL(
        this.props.soundMetadata.sourceUrl, {
          onEnded: () => this.setState({isPlaying: false})
        }
      );
    }
  };

  render() {
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

// Adapted from: http://stackoverflow.com/questions/6312993/javascript-seconds-to-time-string-with-format-hhmmss
// Convert a number, numSeconds, into a string formatted as MM:SS or "Less than 1 second"
// if the time is 0 seconds
const getTimeString = function (numSeconds) {
  const sec_num = parseInt(numSeconds, 10);
  const hours   = Math.floor(sec_num / 3600);
  let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  let seconds = sec_num - (hours * 3600) - (minutes * 60);

  if (seconds < 1) {
    return 'Less than 1 second';
  }

  if (minutes < 10) {
    minutes = "0"+minutes;
  }
  if (seconds < 10) {
    seconds = "0"+seconds;
  }
  return minutes+':'+seconds;
};
