import {TheaterSignalType} from './constants';

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
}
