import {TheaterSignalType, STATUS_MESSAGE_PREFIX} from './constants';
import javalabMsg from '@cdo/javalab/locale';

export default class Theater {
  constructor(onOutputMessage, onNewlineMessage) {
    this.canvas = null;
    this.context = null;
    this.onOutputMessage = onOutputMessage;
    this.onNewlineMessage = onNewlineMessage;
    this.signalsReceived = 0;
    this.audioResponse = null;
    this.visualResponse = null;
  }

  handleSignal(data) {
    switch (data.value) {
      case TheaterSignalType.AUDIO_URL: {
        this.audioResponse = data.detail.url;
        this.startPlayback();
        break;
      }
      case TheaterSignalType.VISUAL_URL: {
        this.visualResponse = data.detail.url;
        this.startPlayback();
        break;
      }
      default:
        break;
    }
  }

  startPlayback() {
    this.signalsReceived++;
    // We expect exactly 2 responses from Javabuilder. One for audio and one for video.
    // Wait for both before starting playback.
    if (this.signalsReceived > 1) {
      this.getAudioElement().src = this.audioResponse;
      this.getImgElement().src = this.visualResponse;
    }
  }

  reset() {
    this.signalsReceived = 0;
    this.getImgElement().src = '';
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
}
