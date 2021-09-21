import {PlaygroundSignalType} from './constants';

export default class Playground {
  constructor(onOutputMessage, onNewlineMessage, onJavabuilderMessage) {
    this.onOutputMessage = onOutputMessage;
    this.onNewlineMessage = onNewlineMessage;
    this.onJavabuilderMessage = onJavabuilderMessage;
    this.isGameRunning = false;
    this.isGameOver = false;
  }

  handleSignal(data) {
    switch (data.value) {
      case PlaygroundSignalType.RUN:
        this.isGameRunning = true;
        break;
      case PlaygroundSignalType.EXIT:
        this.isGameRunning = false;
        this.isGameOver = true;
        break;
      case PlaygroundSignalType.ADD_CLICKABLE_ITEM:
        this.addClickableItem(data.detail);
        break;
      case PlaygroundSignalType.ADD_IMAGE_ITEM:
        this.addImageItem(data.detail);
        break;
      case PlaygroundSignalType.ADD_TEXT_ITEM:
        this.addTextItem(data.detail);
        break;
      case PlaygroundSignalType.CHANGE_ITEM:
        this.changeItem(data.detail);
        break;
      case PlaygroundSignalType.PLAY_SOUND:
        this.playSound(data.detail);
        break;
      case PlaygroundSignalType.REMOVE_ITEM:
        this.removeItem(data.detail);
        break;
      case PlaygroundSignalType.SET_BACKGROUND_IMAGE:
        this.setBackgroundImage(data.detail);
        break;
    }
  }

  addClickableItem(itemData) {
    if (this.isGameOver) {
      // can't add new items if the game is over
      return;
    }
  }

  addImageItem(itemData) {
    if (this.isGameOver) {
      // can't add new items if the game is over
      return;
    }
  }

  addTextItem(itemData) {
    if (this.isGameOver) {
      // can't add new items if the game is over
      return;
    }
  }

  removeItem(itemData) {
    if (this.isGameOver) {
      // can't remove items if game is over
      return;
    }
  }

  changeItem(itemData) {
    if (this.isGameOver) {
      // can't change items if game is over
      return;
    }
  }

  playSound(soundData) {
    if (this.isGameOver) {
      // can't play sound if game is over
      return;
    }
  }

  setBackgroundImage(backgroundData) {
    if (this.isGameOver) {
      // can't set background if game is over
      return;
    }
  }

  reset() {
    this.isGameOver = false;
    this.isGameRunning = false;
  }

  // TODO: Call this from click handler on new clickable items
  handleImageClick(imageId) {
    if (this.isGameOver || !this.isGameRunning) {
      // can only handle click events if game is not over and game is running
      return;
    }
  }
}
