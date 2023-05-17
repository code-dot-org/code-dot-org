import MD5 from 'crypto-js/md5';
import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {connect} from 'react-redux';
import trackEvent from '../../util/trackEvent';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import moduleStyles from './inline-audio.module.scss';
import classNames from 'classnames';

// TODO (elijah): have these constants shared w/dashboard
const VOICES = {
  en_us: {
    VOICE: 'sharon22k',
    SPEED: 180,
    SHAPE: 100,
  },
  es_es: {
    VOICE: 'ines22k',
    SPEED: 180,
    SHAPE: 100,
  },
  es_mx: {
    VOICE: 'rosa22k',
    SPEED: 180,
    SHAPE: 100,
  },
  it_it: {
    VOICE: 'vittorio22k',
    SPEED: 180,
    SHAPE: 100,
  },
  pt_br: {
    VOICE: 'marcia22k',
    SPEED: 180,
    SHAPE: 100,
  },
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
  'keyup',
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
    isRoundedVolumeIcon: PropTypes.bool,
    // TODO: [Phase 2] This is a switch for legacy styles needed to revert Javalab rebranding changes.
    //  once we update Javalab to new styles we'll need to remove this prop and all of it's usage
    //  more info here: https://github.com/code-dot-org/code-dot-org/pull/50924
    isLegacyStyles: PropTypes.bool,

    // when we need to wait for DOM event to trigger audio autoplay
    // this is the element ID that we'll be listening to
    autoplayTriggerElementId: PropTypes.string,

    // Provided by redux
    // To Log TTS usage
    puzzleNumber: PropTypes.number,
    userId: PropTypes.number,
    isOnCSFPuzzle: PropTypes.bool,
  };

  state = {
    audio: undefined,
    playing: false,
    error: false,
    loaded: false,
    autoplayed: false,
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

  UNSAFE_componentWillUpdate(nextProps) {
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
        error: false,
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
        autoplayed: this.props.ttsAutoplayEnabled,
      });
    });

    audio.addEventListener('error', e => {
      // e is an instance of a MediaError object
      trackEvent('InlineAudio', 'error', e.target.error.code);
      this.setState({
        playing: false,
        error: true,
      });
    });

    this.setState({audio});
    trackEvent('InlineAudio', 'getAudioElement', src);
    return audio;
  }

  isLocaleSupported() {
    return Object.prototype.hasOwnProperty.call(VOICES, this.props.locale);
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
        csfStyleInstructions: this.props.isOnCSFPuzzle,
      }),
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

  render() {
    const {isRoundedVolumeIcon, isLegacyStyles} = this.props;

    if (
      this.props.textToSpeechEnabled &&
      !this.state.error &&
      this.state.loaded &&
      this.isLocaleSupported() &&
      this.getAudioSrc()
    ) {
      return (
        <button
          className={classNames(
            'inline-audio',
            moduleStyles.inlineAudioButton,
            isLegacyStyles && moduleStyles.inlineAudioButtonLegacy
          )}
          style={this.props.style && this.props.style.wrapper}
          onClick={this.toggleAudio}
          type="button"
        >
          <div
            style={[this.props.style && this.props.style.button]}
            className={classNames(
              moduleStyles.iconWrapper,
              isRoundedVolumeIcon
                ? moduleStyles.iconWrapperVolumeRounded
                : moduleStyles.iconWrapperVolume
            )}
            id="volume"
          >
            <i
              className={classNames(
                'fa fa-volume-up',
                moduleStyles.buttonImg,
                moduleStyles.buttonImgVolume
              )}
              style={[this.props.style && this.props.style.buttonImg]}
            />
          </div>
          <div
            className={classNames(
              'playPause',
              moduleStyles.iconWrapper,
              moduleStyles.iconWrapperPlayPause
            )}
            style={[this.props.style && this.props.style.button]}
          >
            <i
              className={classNames(
                this.state.playing ? 'fa fa-pause' : 'fa fa-play',
                moduleStyles.buttonImg
              )}
              style={[this.props.style && this.props.style.buttonImg]}
            />
          </div>
        </button>
      );
    }
    return null;
  }
}

InlineAudio.defaultProps = {
  ttsAutoplayEnabled: false,
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
    ttsAutoplayEnabled: state.instructions.ttsAutoplayEnabledForLevel,
  };
})(StatelessInlineAudio);
