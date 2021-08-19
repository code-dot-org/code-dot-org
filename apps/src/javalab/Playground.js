import {PlaygroundSignalType, STATUS_MESSAGE_PREFIX} from './constants';
import javalabMsg from '@cdo/javalab/locale';
import {assets as assetsApi} from '@cdo/apps/clientApi';

export default class Playground {
  constructor(onOutputMessage, onNewlineMessage, onInputMessage) {
    this.onOutputMessage = onOutputMessage;
    this.onNewlineMessage = onNewlineMessage;
    this.onInputMessage = onInputMessage;
  }

  handleSignal(data) {
    switch (data.value) {
      case PlaygroundSignalType.ADD_IMAGE: {
        this.generateNewImage(data.detail);
        break;
      }
      default:
        break;
    }
  }

  reset() {
    this.getAudioElement().src = '';
    const playground = this.getPlaygroundElement();
    while (playground.lastElementChild) {
      playground.removeChild(playground.lastElementChild);
    }
  }

  getPlaygroundElement() {
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

  generateNewImage(imageData) {
    let image = document.createElement('img');
    image.src = assetsApi.basePath(imageData.filename);
    image.id = imageData.id;
    image.style.width = this.getPixelValue(imageData.width);
    image.style.height = this.getPixelValue(imageData.height);
    image.style.position = 'absolute';
    image.style.zIndex = imageData.index;
    image.style.marginTop = this.getPixelValue(imageData.y);
    image.style.marginLeft = this.getPixelValue(imageData.x);
    image.addEventListener('click', () => this.handleImageClick(imageData.id));
    this.getPlaygroundElement().appendChild(image);
  }

  handleImageClick(imageId) {
    console.log('got click event for ' + imageId);
    this.onInputMessage('PLAYGROUND', imageId);
  }

  getPixelValue(configValue) {
    return configValue * 2 + 'px';
  }
}
