import {TheaterSignalType, STATUS_MESSAGE_PREFIX} from './constants';
import javalabMsg from '@cdo/javalab/locale';
import {getStore} from '../redux';
import {appendOutputLog, appendNewlineToConsoleLog} from './javalabRedux';

export default class Theater {
  constructor() {
    this.canvas = null;
    this.context = null;
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
      // TODO: Remove these message types once javabuilder is updated to
      // no longer use them.
      case TheaterSignalType.VISUAL: {
        const imageString = 'data:image/gif;base64,' + data.detail.image;
        this.getImgElement().src = imageString;
        break;
      }
      case TheaterSignalType.AUDIO: {
        const audioString = 'data:audio/wav;base64,' + data.detail.audio;
        this.getAudioElement().src = audioString;
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
    getStore().dispatch(appendNewlineToConsoleLog());
    getStore().dispatch(
      appendOutputLog(
        `${STATUS_MESSAGE_PREFIX} ${javalabMsg.programCompleted()}`
      )
    );
    getStore().dispatch(appendNewlineToConsoleLog());
  }
}
