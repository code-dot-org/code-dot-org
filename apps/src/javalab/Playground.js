import {PlaygroundSignalType, STATUS_MESSAGE_PREFIX} from './constants';
import javalabMsg from '@cdo/javalab/locale';

export default class Playground {
  constructor(onOutputMessage, onNewlineMessage, sendMessage) {
    this.canvas = null;
    this.context = null;
    this.isRunning = false;
    this.onOutputMessage = onOutputMessage;
    this.onNewlineMessage = onNewlineMessage;
    this.sendMessage = sendMessage;
  }

  handleSignal(data) {
    switch (data.value) {
      case PlaygroundSignalType.RUN: {
        this.isRunning = true;
        break;
      }
      case PlaygroundSignalType.EXIT: {
        this.isRunning = false;
        this.setAudio(data.detail.audioUrl, data.detail.audio);
        break;
      }
      case PlaygroundSignalType.UPDATE: {
        const {imageUrl, image, audioUrl, audio} = data.detail;
        if (imageUrl) {
          this.getImgElement().src = imageUrl;
        } else {
          // TODO remove this branch once Javabuilder stops sending encoded strings
          const imageString = 'data:image/jpeg;base64,' + image;
          this.getImgElement().src = imageString;
        }

        this.setAudio(audioUrl, audio);
        break;
      }
      default:
        break;
    }
  }

  setAudio(audioUrl, audio) {
    if (audioUrl) {
      this.getAudioElement().src = audioUrl;
    } else {
      const audioString = 'data:audio/wav;base64,' + audio;
      this.getAudioElement().src = audioString;
    }
  }

  onPlaygroundClicked(x, y) {
    if (!this.isRunning) {
      return;
    }

    this.sendMessage(JSON.stringify({x, y}));
  }

  reset() {
    this.getImgElement().src = '';
    this.getAudioElement().src = '';
  }

  getImgElement() {
    return document.getElementById('playground');
  }

  getAudioElement() {
    return document.getElementById('playground-audio');
  }

  onClose() {
    this.onNewlineMessage();
    this.onOutputMessage(
      `${STATUS_MESSAGE_PREFIX} ${javalabMsg.programCompleted()}`
    );
    this.onNewlineMessage();
  }
}
