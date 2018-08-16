import React, {PropTypes} from 'react';
import {styles} from "./AssetThumbnail";

export default class AudioIconPlayer extends React.Component {
  static propTypes = {
    src: PropTypes.string.isRequired,
    soundPlayer: PropTypes.object
  };

  state = {
    isPlaying: false
  };

  clickSoundControl = () => {
    if (this.state.isPlaying) {
      this.setState({isPlaying: false});
      this.props.soundPlayer.stopPlayingURL(this.props.src);
    } else {
      this.setState({isPlaying: true});
      this.props.soundPlayer.play(this.props.src);
    }
  };

  render() {
    const playIcon = this.state.isPlaying ? 'fa-pause-circle' : 'fa-play-circle';

    return (
      <i onClick={this.clickSoundControl} className={'fa '+ playIcon +' fa-4x'} style={styles.audioIcon} />
    );
  }
}
