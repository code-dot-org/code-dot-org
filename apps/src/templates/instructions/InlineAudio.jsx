import MD5 from 'crypto-js/md5';
import Radium from 'radium';
import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import trackEvent from '../../util/trackEvent';
import color from '../../util/color';

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
    cursor: 'pointer',
    'float': 'left',
    backgroundColor: color.lightest_purple,
    border: 'none',
    outline: 'none',
    width: 33,
    boxSizing: 'border-box'
  },

  volumeButton: {
    borderRadius: "4px 0px 0px 4px",
    marginLeft: '3px',
  },

  playPauseButton: {
    borderRadius: "0px 4px 4px 0px",
    marginRight: '3px',
  },

  buttonImg: {
    opacity: 1,
    'float': 'left',
    paddingRight: 8,
    paddingLeft: 8,
    color: '#4d575f'
  },

  hover: {
    backgroundColor: color.cyan
  }
};

class InlineAudio extends React.Component {
  static propTypes = {
    assetUrl: PropTypes.func.isRequired,
    locale: PropTypes.string,
    textToSpeechEnabled: PropTypes.bool,
    src: PropTypes.string,
    message: PropTypes.string,
    style: PropTypes.object
  };

  state = {
    audio: undefined,
    playing: false,
    error: false,
    hover: false,
  };

  componentWillUpdate(nextProps) {
    if (this.props.src !== nextProps.src ||
        this.props.message !== nextProps.message) {
      // unload current Audio object
      const audio = this.state.audio;

      if (audio) {
        audio.src = undefined;
        audio.load();
      }

      this.setState({
        audio: undefined,
        playing: false,
      });
    }
  }

  getAudioElement() {
    if (this.state.audio) {
      return this.state.audio;
    }

    const src = this.getAudioSrc();
    const audio = new Audio(src);
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
  }

  isLocaleSupported() {
    return VOICES.hasOwnProperty(this.props.locale);
  }

  getAudioSrc() {
    if (this.props.src) {
      return this.props.src;
    }

    const voice = VOICES[this.props.locale];
    const voicePath = `${voice.VOICE}/${voice.SPEED}/${voice.SHAPE}`;

    const message = this.props.message.replace('"???"', 'the question marks');
    const hash = MD5(message).toString();
    const contentPath = `${hash}/${encodeURIComponent(message)}.mp3`;

    return `${TTS_URL}/${voicePath}/${contentPath}`;
  }

  toggleAudio = () => {
    this.state.playing ? this.pauseAudio() : this.playAudio();
  };

  playAudio() {
    this.getAudioElement().play();
    this.setState({ playing: true });
  }

  pauseAudio() {
    this.getAudioElement().pause();
    this.setState({ playing: false });
  }

  toggleHover = () => {
    this.setState({ hover: !this.state.hover });
  };

  render() {
    if (this.props.textToSpeechEnabled && !this.state.error && this.isLocaleSupported() && this.getAudioSrc()) {
      return (
        <div
          className="inline-audio"
          style={this.props.style && this.props.style.wrapper}
          onMouseOver={this.toggleHover}
          onMouseOut={this.toggleHover}
        >
          <div
            style={[styles.button, styles.volumeButton, this.props.style && this.props.style.button, this.state.hover && styles.hover]}
            id="volume"
          >
            <i
              className={"fa fa-volume-up"}
              style={[styles.buttonImg, this.props.style && this.props.style.buttonImg]}
            />
          </div>
          <div
            className="playPause"
            style={[styles.button, styles.playPauseButton, this.props.style && this.props.style.button, this.state.hover && styles.hover]}
            onClick={this.toggleAudio}
          >
            <i
              className={this.state.playing ? "fa fa-pause" : "fa fa-play"}
              style={[styles.buttonImg, this.props.style && this.props.style.buttonImg]}
            />
          </div>
        </div>
      );
    }
    return null;
  }
}

export const StatelessInlineAudio = Radium(InlineAudio);
export default connect(function propsFromStore(state) {
  return {
    assetUrl: state.pageConstants.assetUrl,
    textToSpeechEnabled: state.pageConstants.textToSpeechEnabled || state.pageConstants.isK1,
    locale: state.pageConstants.locale,
  };
})(StatelessInlineAudio);
