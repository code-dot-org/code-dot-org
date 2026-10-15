import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  IconButton as MuiIconButton,
  Typography as MuiTypography,
} from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './SoundListEntry.module.scss';

/**
 * Component for a single sound tile in the Sound Library.
 * Used in App Lab and Game Lab
 */
class SoundListEntry extends React.Component {
  static propTypes = {
    assetChosen: PropTypes.func.isRequired,
    soundMetadata: PropTypes.object.isRequired,
    isSelected: PropTypes.bool.isRequired,
    soundsRegistry: PropTypes.object.isRequired,
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
      this.props.soundsRegistry.unmuteURLs();
      this.props.soundsRegistry.playURL(this.props.soundMetadata.sourceUrl, {
        onEnded: () => {
          if (this._isMounted) {
            this.setState({isPlaying: false});
          }
          this.props.soundsRegistry.muteURLs();
        },
      });
    }
  };

  render() {
    const selectedClass = this.props.isSelected
      ? styles.selected
      : styles.notSelected;
    const playIcon = this.state.isPlaying ? 'circle-pause' : 'circle-play';

    return (
      <div
        className={classNames(styles.root, selectedClass)}
        title={this.props.soundMetadata.name}
        onClick={this.props.assetChosen.bind(null, this.props.soundMetadata)}
      >
        <div className={styles.icon}>
          <MuiIconButton
            size="small"
            onClick={this.clickSoundControl}
            aria-label={this.state.isPlaying ? 'Pause sound' : 'Play sound'}
            sx={{'& i': {fontSize: '1.5rem', width: 'auto'}}}
          >
            <FontAwesomeV6Icon iconName={playIcon} iconStyle="solid" />
          </MuiIconButton>
        </div>
        <div className={styles.metadata}>
          <MuiTypography
            variant="body3"
            component="span"
            sx={{lineHeight: 1.2}}
          >
            {this.props.soundMetadata.name + '.mp3'}
          </MuiTypography>
          <br />
          <MuiTypography
            variant="body4"
            component="span"
            className={styles.time}
            sx={{lineHeight: 1.2}}
          >
            {getTimeString(this.props.soundMetadata.time)}
          </MuiTypography>
        </div>
      </div>
    );
  }
}

export default SoundListEntry;

// Adapted from: http://stackoverflow.com/questions/6312993/javascript-seconds-to-time-string-with-format-hhmmss
// Convert a number, numSeconds, into a string formatted as MM:SS or "Less than 1 second"
// if the time is 0 seconds
const getTimeString = function (numSeconds) {
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
