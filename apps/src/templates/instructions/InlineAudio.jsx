import Radium from 'radium';
import React from 'react';
import experiments from '../../experiments';

import { connect } from 'react-redux';

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
    src: React.PropTypes.string.isRequired
  },

  componentWillUpdate: function (nextProps) {
    if (this.props.src !== nextProps.src) {
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
    };
  },

  getAudioElement: function () {
    if (this.state.audio) {
      return this.state.audio;
    }

    var audio = new Audio(this.props.src);
    $(audio).on("ended", e => {
      this.setState({
        playing: false
      });
    });

    this.setState({ audio });
    return audio;
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
    if (experiments.isEnabled('tts') && this.props.src) {
      return (
        <div>
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
  }
});

export default connect(function propsFromStore(state) {
  return {
    assetUrl: state.pageConstants.assetUrl,
  };
})(Radium(InlineAudio));
