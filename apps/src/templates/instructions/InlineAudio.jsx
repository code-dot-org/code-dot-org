/* global CryptoJS, trackEvent */

import Radium from 'radium';
import React from 'react';

import { connect } from 'react-redux';

const TTS_URL = "https://tts.code.org/sharon22k/180/100";

const styles = {
  error: {
    display: 'inline-block',
    marginLeft: 10,
    marginBottom: 0,
    padding: '5px 10px'
  },

  button: {
    'float': 'left',
    border: 'none',
    height: 32,
    margin: 0,
    outline: 'none',
    padding: 8,
    width: 33,
    boxSizing: 'border-box'
  },

  volumeButton: {
    background: "#7664A0",
    borderRadius: "100px 0px 0px 100px",
  },

  playPauseButton: {
    background: "#A69BC1",
    borderRadius: "0px 100px 100px 0px",
  },

  buttonImg: {
    opacity: 1,
    'float': 'left'
  }
};

const InlineAudio = React.createClass({
  propTypes: {
    assetUrl: React.PropTypes.func.isRequired,
    isK1: React.PropTypes.bool,
    src: React.PropTypes.string,
    message: React.PropTypes.string
  },

  componentWillUpdate: function (nextProps) {
    if (this.props.src !== nextProps.src ||
        this.props.message !== nextProps.message) {
      // unload current Audio object
      var audio = this.state.audio;
      audio.src = undefined;
      audio.load();

      this.setState({
        audio: undefined,
        playing: false,
      });
    }
  },

  getInitialState: function () {
    return {
      audio: undefined,
      playing: false,
      error: false,
    };
  },

  getAudioElement: function () {
    if (this.state.audio) {
      return this.state.audio;
    }

    var src = this.getAudioSrc();
    var audio = new Audio(src);
    audio.addEventListener("ended", e => {
      this.setState({
        playing: false
      });
    });

    audio.addEventListener("error", e => {
      // e is an instance of a MediaError object
      trackEvent('InlineAudio', 'error', e.target.error.code);
      this.setState({
        playing: false,
        error: true
      });
    });

    this.setState({ audio });
    trackEvent('InlineAudio', 'getAudioElement', src);
    return audio;
  },

  getAudioSrc: function () {
    if (this.props.src) {
      return this.props.src;
    }

    let hash = CryptoJS.MD5(this.props.message).toString(CryptoJS.enc.Base64);
    let ttsUrl = `${TTS_URL}/${hash}/${encodeURIComponent(this.props.message)}.mp3`;
    return ttsUrl;
  },

  toggleAudio: function () {
    this.state.playing ? this.pauseAudio() : this.playAudio();
  },

  playAudio: function () {
    this.getAudioElement().play();
    this.setState({ playing: true });
  },

  pauseAudio: function () {
    this.getAudioElement().pause();
    this.setState({ playing: false });
  },

  render: function () {
    if (this.props.isK1 && !this.state.error && this.getAudioSrc()) {
      return (
        <div className="inline-audio">
          <div style={[styles.button, styles.volumeButton]}>
            <img style={styles.buttonImg} src={this.props.assetUrl("media/common_images/volume.png")} />
          </div>
          <button style={[styles.button, styles.playPauseButton]} onClick={this.toggleAudio}>
            <img
              style={styles.buttonImg}
              src={this.state.playing ?
                this.props.assetUrl("media/common_images/pause.png") :
                this.props.assetUrl("media/common_images/play.png")}
            />
          </button>
        </div>
      );
    }

    return null;
  }
});

export default connect(function propsFromStore(state) {
  return {
    assetUrl: state.pageConstants.assetUrl,
    isK1: state.pageConstants.isK1,
  };
})(Radium(InlineAudio));
