import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import * as color from '../../util/color';
import firehoseClient from '@cdo/apps/lib/util/firehose';

/**
 * Component for a single sound tile in the Sound Library.
 * Used in App Lab and Game Lab
 */
class SoundListEntry extends React.Component {
  static propTypes = {
    assetChosen: PropTypes.func.isRequired,
    soundMetadata: PropTypes.object.isRequired,
    isSelected: PropTypes.bool.isRequired,
    soundsRegistry: PropTypes.object.isRequired
  };

  state = {isPlaying: false};

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!nextProps.isSelected) {
      this.props.soundsRegistry.stopPlayingURL(
        this.props.soundMetadata.sourceUrl
      );
      this.setState({isPlaying: false});
    }
  }

  componentDidMount() {
    // Using the _isMounted pattern to prevent onEnded callbacks from soundsRegistry
    // attempting to set state in this component after it's been unmounted
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  clickSoundControl = () => {
    if (this.state.isPlaying) {
      this.props.soundsRegistry.stopAllAudio();
      this.setState({isPlaying: false});
    } else {
      this.setState({isPlaying: true});
      firehoseClient.putRecord(
        {
          study: 'sound-dialog-2',
          study_group: 'library-tab',
          event: 'play-library-sound',
          data_json: this.props.soundMetadata.sourceUrl
        },
        {includeUserId: true}
      );
      this.props.soundsRegistry.unmuteURLs();
      this.props.soundsRegistry.playURL(this.props.soundMetadata.sourceUrl, {
        onEnded: () => {
          if (this._isMounted) {
            this.setState({isPlaying: false});
          }
          this.props.soundsRegistry.muteURLs();
        }
      });
    }
  };

  render() {
    const selectedColor = this.props.isSelected
      ? styles.selected
      : styles.notSelected;
    const playIcon = this.state.isPlaying
      ? 'fa-pause-circle'
      : 'fa-play-circle';

    return (
      <div
        style={[styles.root, selectedColor]}
        title={this.props.soundMetadata.name}
        onClick={this.props.assetChosen.bind(null, this.props.soundMetadata)}
      >
        <div style={styles.icon}>
          <i
            onClick={this.clickSoundControl}
            className={'fa ' + playIcon + ' fa-2x'}
          />
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
}

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

export default Radium(SoundListEntry);

// Adapted from: http://stackoverflow.com/questions/6312993/javascript-seconds-to-time-string-with-format-hhmmss
// Convert a number, numSeconds, into a string formatted as MM:SS or "Less than 1 second"
// if the time is 0 seconds
const getTimeString = function(numSeconds) {
  const sec_num = parseInt(numSeconds, 10);
  const hours = Math.floor(sec_num / 3600);
  let minutes = Math.floor((sec_num - hours * 3600) / 60);
  let seconds = sec_num - hours * 3600 - minutes * 60;

  if (seconds < 1) {
    return 'Less than 1 second';
  }

  if (minutes < 10) {
    minutes = '0' + minutes;
  }
  if (seconds < 10) {
    seconds = '0' + seconds;
  }
  return minutes + ':' + seconds;
};
