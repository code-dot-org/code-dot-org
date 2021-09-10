import {PlaygroundSignalType} from './constants';
import {assets as assetsApi} from '@cdo/apps/clientApi';

export default class Playground {
  constructor(onOutputMessage, onNewlineMessage, onInputMessage) {
    this.onOutputMessage = onOutputMessage;
    this.onNewlineMessage = onNewlineMessage;
    this.onInputMessage = onInputMessage;
    this.images = {};
    this.imagesData = {};
  }

  handleSignal(data) {
    switch (data.value) {
      case PlaygroundSignalType.ADD_ITEM: {
        this.generateNewItem(data.detail);
        break;
      }
      case PlaygroundSignalType.ADD_CLICKABLE_ITEM: {
        this.generateNewClickableItem(data.detail);
        break;
      }
      case PlaygroundSignalType.CHANGED_ITEM: {
        this.changeImage(data.detail);
        break;
      }
      case PlaygroundSignalType.PLAY_SOUND: {
        this.playSound(data.detail);
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
    // for now do nothing here
  }

  playSound(soundData) {
    const soundUrl = assetsApi.basePath(soundData.filename);
    this.getAudioElement().src = soundUrl + this.getCacheBustSuffix();
  }

  generateNewItem(imageData) {
    const image = this.setUpImage(imageData);
    this.getPlaygroundElement().appendChild(image);
  }

  generateNewClickableItem(clickableItemData) {
    this.imagesData[clickableItemData.id] = clickableItemData;
    const image = this.setUpImage(clickableItemData);
    image.addEventListener('click', () =>
      this.handleImageClick(clickableItemData.id)
    );
    this.getPlaygroundElement().appendChild(image);
  }

  changeImage(imageData) {
    const id = imageData.id;
    let image = document.getElementById(id);
    let originalData = this.imagesData[id];
    this.imagesData[id] = {...originalData, ...imageData};
    this.styleImage(image, this.imagesData[id]);
  }

  setUpImage(imageData) {
    const image = document.createElement('img');
    this.styleImage(image, imageData);
    image.style.zIndex = imageData.index;
    return image;
  }

  styleImage(image, imageData) {
    const x = imageData.x * 2;
    const y = imageData.y * 2;
    const width = imageData.width * 2;
    const height = imageData.height * 2;
    image.src = assetsApi.basePath(imageData.filename);
    image.style.width = width + 'px';
    image.style.height = height + 'px';
    image.id = imageData.id;
    image.style.position = 'absolute';
    this.setImageMargins(image, x, y, width, height);
  }

  handleImageClick(imageId) {
    console.log('in handle image click');
    this.onInputMessage('PLAYGROUND', imageId);
  }

  getPixelValue(configValue) {
    return configValue + 'px';
  }

  getAdjustedDimension(originalDimension, coordinate) {
    return Math.min(originalDimension, 800 - coordinate);
  }

  getClipPath(dimension, coordinate) {
    return dimension + coordinate > 800
      ? `${dimension + coordinate - 800}px`
      : 0;
  }

  setImageMargins(image, x, y, width, height) {
    image.style.marginTop = this.getPixelValue(y);
    image.style.marginLeft = this.getPixelValue(x);
    this.setClipPath(image, x, y, width, height);
  }

  setClipPath(image, x, y, width, height) {
    image.style.clipPath = `inset(0 ${this.getClipPath(
      width,
      x
    )} ${this.getClipPath(height, y)} 0)`;
  }

  getCacheBustSuffix() {
    return '?=' + new Date().getTime();
  }
}
