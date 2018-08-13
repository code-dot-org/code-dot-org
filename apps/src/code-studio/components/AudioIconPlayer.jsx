import React, {PropTypes} from 'react';
import {styles} from "./AssetThumbnail";

export default class AudioIconPlayer extends React.Component {
  static propTypes = {
    src: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    const audio = new Audio(this.props.src);

    this.state = {
      isPlaying: false,
      audio: audio
    };
  }

  componentDidMount() {
    this.state.audio.addEventListener('ended', () => {
      this.setState({isPlaying: false});
    });
  }

  clickSoundControl = () => {
    if (this.state.isPlaying) {
      this.setState({isPlaying: false});
      this.state.audio.pause();
    } else {
      this.setState({isPlaying: true});
      this.state.audio.play();
    }
  };

  render() {
    const playIcon = this.state.isPlaying ? 'fa-pause-circle' : 'fa-play-circle';

    return (
      <i onClick={this.clickSoundControl} className={'fa '+ playIcon +' fa-4x'} style={styles.audioIcon} />
    );
  }
}
