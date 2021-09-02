import {TheaterSignalType, STATUS_MESSAGE_PREFIX} from './constants';
import javalabMsg from '@cdo/javalab/locale';

export default class Theater {
  constructor(onOutputMessage, onNewlineMessage) {
    this.canvas = null;
    this.context = null;
    this.onOutputMessage = onOutputMessage;
    this.onNewlineMessage = onNewlineMessage;
  }

  handleSignal(data) {
    switch (data.value) {
      case TheaterSignalType.AUDIO_URL: {
        this.getAudioElement().src = data.detail.url;
        break;
      }
      case TheaterSignalType.VISUAL_URL: {
        this.getImgElement().src = data.detail.url;
        break;
      }
      default:
        break;
    }
  }

  reset() {
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
