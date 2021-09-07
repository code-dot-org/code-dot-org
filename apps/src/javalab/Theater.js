import {TheaterSignalType, STATUS_MESSAGE_PREFIX} from './constants';
import javalabMsg from '@cdo/javalab/locale';

export default class Theater {
  constructor(onOutputMessage, onNewlineMessage) {
    this.canvas = null;
    this.context = null;
    this.onOutputMessage = onOutputMessage;
    this.onNewlineMessage = onNewlineMessage;
    this.loadEventsFinished = 0;
  }

  handleSignal(data) {
    switch (data.value) {
      case TheaterSignalType.AUDIO_URL: {
        // Wait for the audio to load before starting playback
        this.getAudioElement().src =
          data.detail.url + this.getCacheBustSuffix();
        this.getAudioElement().oncanplaythrough = () => this.startPlayback();
        break;
      }
      case TheaterSignalType.VISUAL_URL: {
        // Preload the image. Once it's ready, start the playback
        this.getImgElement().src = data.detail.url + this.getCacheBustSuffix();
        this.getImgElement().onload = () => this.startPlayback();
        break;
      }
      default:
        break;
    }
  }

  startPlayback() {
    this.loadEventsFinished++;
    // We expect exactly 2 responses from Javabuilder. One for audio and one for video.
    // Wait for both to respond and load before starting playback.
    if (this.loadEventsFinished > 1) {
      this.getImgElement().style.visibility = 'visible';
      this.getAudioElement().play();
    }
  }

  reset() {
    this.loadEventsFinished = 0;
    this.getImgElement().style.visibility = 'hidden';
    this.getAudioElement().src = '';
  }

  getImgElement() {
    return document.getElementById('theater');
  }

  getAudioElement() {
    return document.getElementById('theater-audio');
  }

  onClose() {
    this.onNewlineMessage();
    this.onOutputMessage(
      `${STATUS_MESSAGE_PREFIX} ${javalabMsg.programCompleted()}`
    );
    this.onNewlineMessage();
  }

  getCacheBustSuffix() {
    return '?=' + new Date().getTime();
  }
}
