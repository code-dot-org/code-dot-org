import {PlaygroundSignalType} from './constants';
import {assets, starterAssets} from '@cdo/apps/clientApi';
import javalabMsg from '@cdo/javalab/locale';

export default class Playground {
  constructor(
    onOutputMessage,
    onNewlineMessage,
    onJavabuilderMessage,
    levelName,
    // Only used for testing
    starterAssetsApi,
    assetsApi
  ) {
    this.onOutputMessage = onOutputMessage;
    this.onNewlineMessage = onNewlineMessage;
    this.onJavabuilderMessage = onJavabuilderMessage;
    this.isGameRunning = false;
    this.isGameOver = false;
    this.levelName = levelName;
    this.starterAssetFilenames = [];

    // Assigned only for testing; should use imports from clientApi normally
    this.starterAssetsApi = starterAssetsApi || starterAssets;
    this.assetsApi = assetsApi || assets;

    this.starterAssetsApi.getStarterAssets(
      levelName,
      this.onStarterAssetsReceived,
      () => {}
    );
  }

  onStarterAssetsReceived = result => {
    const response = JSON.parse(result.response);
    response.starter_assets.forEach(asset => {
      this.starterAssetFilenames.push(asset.filename);
    });
  };

  onFileLoadError = filename => {
    this.onOutputMessage(javalabMsg.fileLoadError({filename}));
    this.onNewlineMessage();
  };

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

    const filename = backgroundData.filename;

    const backgroundElement = this.getBackgroundElement();
    backgroundElement.onerror = () => {
      this.onFileLoadError(filename);
    };
    backgroundElement.src = this.getUrl(filename);
    backgroundElement.style.opacity = 1.0;
  }

  reset() {
    this.isGameOver = false;
    this.isGameRunning = false;
    this.resetBackgroundElement();
  }

  // TODO: Call this from click handler on new clickable items
  handleImageClick(imageId) {
    if (this.isGameOver || !this.isGameRunning) {
      // can only handle click events if game is not over and game is running
      return;
    }
  }

  getUrl(filename) {
    if (this.starterAssetFilenames.includes(filename)) {
      return this.starterAssetsApi
        .withLevelName(this.levelName)
        .basePath(filename);
    } else {
      return this.assetsApi.basePath(filename);
    }
  }

  getBackgroundElement() {
    return document.getElementById('playground-background');
  }

  resetBackgroundElement() {
    const backgroundElement = this.getBackgroundElement();
    backgroundElement.onerror = undefined;
    backgroundElement.src = undefined;
    backgroundElement.style.opacity = 0.0;
  }
}
