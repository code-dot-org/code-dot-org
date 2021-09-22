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
    this.imageData = {};
    this.textData = {};

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
    this.addImageHelper(itemData, true);
  }

  addImageItem(itemData) {
    this.addImageHelper(itemData, false);
  }

  addImageHelper(itemData, isClickable) {
    // ignore request if the game is over or if the item already exists
    if (this.isGameOver || this.imageData[itemData.id]) {
      // can't add new items if the game is over
      return;
    }
    this.imageData[itemData.id] = itemData;
    const image = this.setUpImage(itemData);
    if (isClickable) {
      image.addEventListener('click', () => this.handleImageClick(itemData.id));
    }
    this.getPlaygroundElement().appendChild(image);
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
    if (this.imageData[itemData.id]) {
      delete this.imageData[itemData.id];
      const item = document.getElementById(itemData.id);
      item.remove();
    }
    // TODO: handle text deletion
  }

  changeItem(itemData) {
    if (this.isGameOver) {
      // can't change items if game is over
      return;
    }
    if (this.imageData[itemData.id]) {
      this.changeImageItem(itemData);
    }
    // TODO: handle text changes
  }

  changeImageItem(itemData) {
    const id = itemData.id;
    let image = document.getElementById(id);
    if (image) {
      let originalData = this.imageData[id];
      this.imageData[id] = {...originalData, ...itemData};
      this.styleImage(image, this.imageData[id]);
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
    const playground = this.getPlaygroundElement();
    while (playground.lastElementChild) {
      playground.removeChild(playground.lastElementChild);
    }
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

  getPlaygroundElement() {
    return document.getElementById('playground');
  }

  setUpImage(imageData) {
    const image = document.createElement('img');
    this.styleImage(image, imageData);
    image.style.zIndex = imageData.index;
    return image;
  }

  changeImage(imageData) {
    const id = imageData.id;
    let image = document.getElementById(id);
    // if we can't find the image, ignore this request
    if (image) {
      let originalData = this.imageData[id];
      this.imageData[id] = {...originalData, ...imageData};
      this.styleImage(image, this.imageData[id]);
    }
  }

  styleImage(image, imageData) {
    // coordinates come to us in a 400x400 image size,
    // but we use 800x800 on the frontend to allow for higher
    // resolution screens. Therefore we need to scale up the
    // coordinates by 2.
    const x = imageData.x * 2;
    const y = imageData.y * 2;
    const width = imageData.width * 2;
    const height = imageData.height * 2;
    image.src = this.getUrl(imageData.filename);
    image.style.width = width + 'px';
    image.style.height = height + 'px';
    image.id = imageData.id;
    image.style.position = 'absolute';
    this.setImageMargins(image, x, y, width, height);
  }

  getPixelValue(configValue) {
    return configValue + 'px';
  }

  setImageMargins(image, x, y, width, height) {
    image.style.marginTop = this.getPixelValue(y);
    image.style.marginLeft = this.getPixelValue(x);
    this.setClipPath(image, x, y, width, height);
  }

  // If the image would go outside of the 800x800 box we put playground
  // into, cut it off at the appropriate dimension. This will crop any images
  // that go outside of the box, which is our expected behavior.
  setClipPath(image, x, y, width, height) {
    image.style.clipPath = `inset(0 ${this.getClipPath(
      width,
      x
    )} ${this.getClipPath(height, y)} 0)`;
  }

  getClipPath(dimension, coordinate) {
    return dimension + coordinate > 800
      ? `${dimension + coordinate - 800}px`
      : 0;
  }

  resetBackgroundElement() {
    const backgroundElement = this.getBackgroundElement();
    backgroundElement.onerror = undefined;
    backgroundElement.src = undefined;
    backgroundElement.style.opacity = 0.0;
  }
}
