import MD5 from 'crypto-js/md5';
import PropTypes from 'prop-types';
import Radium from 'radium';
import React from 'react';
import {connect} from 'react-redux';
import trackEvent from '../../util/trackEvent';
import color from '../../util/color';
import firehoseClient from '@cdo/apps/lib/util/firehose';

// TODO (elijah): have these constants shared w/dashboard
const VOICES = {
  en_us: {
    VOICE: 'sharon22k',
    SPEED: 180,
    SHAPE: 100
  },
  es_es: {
    VOICE: 'ines22k',
    SPEED: 180,
    SHAPE: 100
  },
  es_mx: {
    VOICE: 'rosa22k',
    SPEED: 180,
    SHAPE: 100
  },
  it_it: {
    VOICE: 'vittorio22k',
    SPEED: 180,
    SHAPE: 100
  },
  pt_br: {
    VOICE: 'marcia22k',
    SPEED: 180,
    SHAPE: 100
  }
};

const TTS_URL = 'https://tts.code.org';

// pulled from the example here https://developers.google.com/web/updates/2018/11/web-audio-autoplay
const AUDIO_ENABLING_DOM_EVENTS = [
  'click',
  'contextmenu',
  'auxclick',
  'dblclick',
  'mousedown',
  'mouseup',
  'pointerup',
  'touchend',
  'keydown',
  'keyup'
];

class InlineAudio extends React.Component {
  static propTypes = {
    assetUrl: PropTypes.func.isRequired,
    locale: PropTypes.string,
    textToSpeechEnabled: PropTypes.bool,
    src: PropTypes.string,
    message: PropTypes.string,
    style: PropTypes.object,
    ttsAutoplayEnabled: PropTypes.bool,

    // when we need to wait for DOM event to trigger audio autoplay
    // this is the element ID that we'll be listening to
    autoplayTriggerElementId: PropTypes.string,

    // Provided by redux
    // To Log TTS usage
    puzzleNumber: PropTypes.number,
    userId: PropTypes.number,
    isOnCSFPuzzle: PropTypes.bool
  };

  state = {
    audio: undefined,
    playing: false,
    error: false,
    hover: false,
    loaded: false,
    autoplayed: false
  };

  constructor(props) {
    super(props);
    this.autoplayAudio = this.autoplayAudio.bind(this);
    this.autoplayTriggerElement = null;
  }

  componentDidMount() {
    this.getAudioElement();
    if (this.props.ttsAutoplayEnabled && !this.state.autoplayed) {
      const {autoplayTriggerElementId} = this.props;
      this.autoplayTriggerElement = autoplayTriggerElementId
        ? document.getElementById(autoplayTriggerElementId)
        : document;

      this.playAudio();
    }
  }

  componentWillUpdate(nextProps) {
    const audioTargetWillChange =
      this.props.src !== nextProps.src ||
      this.props.message !== nextProps.message;

    if (audioTargetWillChange) {
      // unload current Audio object
      const audio = this.state.audio;
      if (audio) {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      }

      // remove reference to existing Audio object, so a new one will be
      // created next time we try to play. Also clear the playing and error
      // states, since we are essentially starting fresh.
      this.setState({
        audio: undefined,
        playing: false,
        error: false
      });
    }
  }

  getAudioElement() {
    if (this.state.audio) {
      return this.state.audio;
    }

    const src = this.getAudioSrc();
    const audio = new Audio(src);
    // iOS Safari does not automatically attempt to load the audio source,
    // so we need to manually load.
    audio.load();

    audio.addEventListener('canplay', () => {
      this.setState({loaded: true});
    });

    audio.addEventListener('ended', e => {
      this.setState({
        playing: false,
        autoplayed: this.props.ttsAutoplayEnabled
      });
    });

    audio.addEventListener('error', e => {
      // e is an instance of a MediaError object
      trackEvent('InlineAudio', 'error', e.target.error.code);
      this.setState({
        playing: false,
        error: true
      });
    });

    this.setState({audio});
    trackEvent('InlineAudio', 'getAudioElement', src);
    return audio;
  }

  isLocaleSupported() {
    return VOICES.hasOwnProperty(this.props.locale);
  }

  getAudioSrc() {
    if (this.props.src) {
      return this.props.src;
    } else if (this.props.message && VOICES[this.props.locale]) {
      const voice = VOICES[this.props.locale];
      const voicePath = `${voice.VOICE}/${voice.SPEED}/${voice.SHAPE}`;

      const message = this.props.message.replace('"???"', 'the question marks');
      const hash = MD5(message).toString();
      const contentPath = `${hash}/${encodeURIComponent(message)}.mp3`;

      return `${TTS_URL}/${voicePath}/${contentPath}`;
    }
  }

  toggleAudio = () => {
    this.state.playing ? this.pauseAudio() : this.playAudio();
  };

  recordPlayEvent() {
    firehoseClient.putRecord({
      study: 'tts-play',
      study_group: 'v1',
      event: 'play',
      data_string: this.props.src,
      data_json: JSON.stringify({
        userId: this.props.userId,
        puzzleNumber: this.props.puzzleNumber,
        src: this.props.src,
        csfStyleInstructions: this.props.isOnCSFPuzzle
      })
    });
  }

  // adds event listeners to the DOM which trigger audio
  // when a significant enough user interaction has happened
  addAudioAutoplayTrigger() {
    AUDIO_ENABLING_DOM_EVENTS.forEach(event => {
      this.autoplayTriggerElement.addEventListener(event, this.autoplayAudio);
    });
  }

  removeAudioAutoplayTrigger() {
    AUDIO_ENABLING_DOM_EVENTS.forEach(event => {
      this.autoplayTriggerElement.removeEventListener(
        event,
        this.autoplayAudio
      );
    });
  }

  playAudio() {
    return this.getAudioElement()
      .play()
      .then(() => {
        this.setState({playing: true});
        this.recordPlayEvent();
      })
      .catch(err => {
        const shouldAutoPlay =
          this.props.ttsAutoplayEnabled && !this.state.autoplayed;

        // there wasn't significant enough user interaction to play audio automatically
        // for more information about this issue on Chrome, see
        // https://developers.google.com/web/updates/2017/09/autoplay-policy-changes
        if (err instanceof DOMException && shouldAutoPlay) {
          this.addAudioAutoplayTrigger();
        } else {
          throw err;
        }
      });
  }

  autoplayAudio() {
    this.playAudio().then(() => this.removeAudioAutoplayTrigger());
  }

  pauseAudio() {
    this.getAudioElement().pause();
    this.setState({playing: false});
  }

  toggleHover = () => {
    this.setState({hover: !this.state.hover});
  };

  render() {
    if (
      this.props.textToSpeechEnabled &&
      !this.state.error &&
      this.state.loaded &&
      this.isLocaleSupported() &&
      this.getAudioSrc()
    ) {
      return (
        <div
          className="inline-audio"
          style={[styles.wrapper, this.props.style && this.props.style.wrapper]}
          onMouseOver={this.toggleHover}
          onMouseOut={this.toggleHover}
          onClick={this.toggleAudio}
        >
          <div
            style={[
              styles.button,
              styles.volumeButton,
              this.props.style && this.props.style.button,
              this.state.hover && styles.hover
            ]}
            id="volume"
          >
            <i
              className={'fa fa-volume-up'}
              style={[
                styles.buttonImg,
                this.props.style && this.props.style.buttonImg
              ]}
            />
          </div>
          <div
            className="playPause"
            style={[
              styles.button,
              styles.playPauseButton,
              this.props.style && this.props.style.button,
              this.state.hover && styles.hover
            ]}
          >
            <i
              className={this.state.playing ? 'fa fa-pause' : 'fa fa-play'}
              style={[
                styles.buttonImg,
                this.props.style && this.props.style.buttonImg
              ]}
            />
          </div>
        </div>
      );
    }
    return null;
  }
}

const styles = {
  error: {
    display: 'inline-block',
    marginLeft: 10,
    marginBottom: 0,
    padding: '5px 10px'
  },

  wrapper: {
    marginLeft: '3px',
    marginRight: '3px'
  },

  button: {
    cursor: 'pointer',
    float: 'left',
    backgroundColor: color.lightest_purple,
    border: 'none',
    outline: 'none',
    width: 33,
    boxSizing: 'border-box'
  },

  volumeButton: {
    borderRadius: '4px 0px 0px 4px'
  },

  playPauseButton: {
    borderRadius: '0px 4px 4px 0px'
  },

  buttonImg: {
    opacity: 1,
    float: 'left',
    paddingRight: 8,
    paddingLeft: 8,
    color: '#4d575f'
  },

  hover: {
    backgroundColor: color.cyan
  }
};

InlineAudio.defaultProps = {
  ttsAutoplayEnabled: false
};

export const StatelessInlineAudio = Radium(InlineAudio);
export default connect(function propsFromStore(state) {
  return {
    assetUrl: state.pageConstants.assetUrl,
    textToSpeechEnabled:
      state.pageConstants.textToSpeechEnabled || state.pageConstants.isK1,
    locale: state.pageConstants.locale,
    userId: state.pageConstants.userId,
    puzzleNumber: state.pageConstants.puzzleNumber,
    isOnCSFPuzzle: !state.instructions.noInstructionsWhenCollapsed,
    ttsAutoplayEnabled: state.sectionData.section.ttsAutoplayEnabled
  };
})(StatelessInlineAudio);
