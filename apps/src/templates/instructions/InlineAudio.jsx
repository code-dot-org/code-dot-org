import MD5 from 'crypto-js/md5';
import Radium from 'radium';
import React from 'react';
import { connect } from 'react-redux';
import trackEvent from '../../util/trackEvent';

// TODO (elijah): have these constants shared w/dashboard
const VOICES = {
  'en_us': {
    VOICE: 'sharon22k',
    SPEED: 180,
    SHAPE: 100
  },
  'es_es': {
    VOICE: 'ines22k',
    SPEED: 180,
    SHAPE: 100,
  },
  'es_mx': {
    VOICE: 'rosa22k',
    SPEED: 180,
    SHAPE: 100,
  },
  'it_it': {
    VOICE: 'vittorio22k',
    SPEED: 180,
    SHAPE: 100,
  },
  'pt_br': {
    VOICE: 'marcia22k',
    SPEED: 180,
    SHAPE: 100,
  }
};


const TTS_URL = "https://tts.code.org";

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
    locale: React.PropTypes.string,
    textToSpeechEnabled: React.PropTypes.bool,
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

  isLocaleSupported: function () {
    return VOICES.hasOwnProperty(this.props.locale);
  },

  getAudioSrc: function () {
    if (this.props.src) {
      return this.props.src;
    }

    const voice = VOICES[this.props.locale];
    const voicePath = `${voice.VOICE}/${voice.SPEED}/${voice.SHAPE}`;

    const message = this.props.message.replace('"???"', 'the question marks');
    const hash = MD5(message).toString();
    const contentPath = `${hash}/${encodeURIComponent(message)}.mp3`;

    return `${TTS_URL}/${voicePath}/${contentPath}`;
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
    if (this.props.textToSpeechEnabled && !this.state.error && this.isLocaleSupported() && this.getAudioSrc()) {
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

export const StatelessInlineAudio = Radium(InlineAudio);
export default connect(function propsFromStore(state) {
  return {
    assetUrl: state.pageConstants.assetUrl,
    textToSpeechEnabled: state.pageConstants.textToSpeechEnabled || state.pageConstants.isK1,
    locale: state.pageConstants.locale,
  };
})(Radium(InlineAudio));
