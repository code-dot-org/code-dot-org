import {
  PlaygroundSignalType,
  PlaygroundItemType,
  WebSocketMessageType,
  STATUS_MESSAGE_PREFIX
} from '../constants';
import {assets, starterAssets} from '@cdo/apps/clientApi';
import javalabMsg from '@cdo/javalab/locale';
import {getStore} from '../../redux';
import {
  addItemData,
  removeItemData,
  changeItemData,
  setItemData,
  getItemIds
} from './playgroundRedux';
import color from '@cdo/apps/util/color';

const DEFAULT_BACKGROUND_COLOR = color.white;
// Amount of time in ms after a click to re-enable click events
// (in case an UPDATE_COMPLETE message is never received)
export const REENABLE_CLICK_EVENTS_TIMEOUT_MS = 1500;

export default class Playground {
  constructor(
    onOutputMessage,
    onNewlineMessage,
    onJavabuilderMessage,
    levelName,
    setIsProgramRunning,
    // Only used for testing
    starterAssetsApi,
    assetsApi
  ) {
    this.onOutputMessage = onOutputMessage;
    this.onNewlineMessage = onNewlineMessage;
    this.onJavabuilderMessage = onJavabuilderMessage;
    this.levelName = levelName;
    this.setIsProgramRunning = setIsProgramRunning;
    this.isGameRunning = false;
    this.updateInProgress = false;
    this.reenableClickEventsTimeoutId = null;
    this.starterAssetFilenames = [];

    // Assigned only for testing; should use imports from clientApi normally
    this.starterAssetsApi = starterAssetsApi || starterAssets;
    this.assetsApi = assetsApi || assets;

    this.addPlaygroundItem = (itemId, itemData) =>
      getStore().dispatch(addItemData(itemId, itemData));
    this.removePlaygroundItem = itemId =>
      getStore().dispatch(removeItemData(itemId));
    this.changePlaygroundItem = (itemId, itemData) =>
      getStore().dispatch(changeItemData(itemId, itemData));
    this.setPlaygroundItems = itemData =>
      getStore().dispatch(setItemData(itemData));

    this.starterAssetsApi.getStarterAssets(
      levelName,
      this.onStarterAssetsReceived,
      () => {}
    );
  }

  onStop() {
    this.endGame();
    this.resetAudioElement();
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

  reenableClickEvents = () => {
    this.updateInProgress = false;
    this.reenableClickEventsTimeoutId = null;
  };

  handleSignal(data) {
    switch (data.value) {
      case PlaygroundSignalType.RUN:
        this.isGameRunning = true;
        break;
      case PlaygroundSignalType.EXIT:
        this.handleUpdateComplete();
        this.endGame();
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
      case PlaygroundSignalType.UPDATE:
        this.handleBatchUpdate(data.detail);
        break;
      case PlaygroundSignalType.UPDATE_COMPLETE:
        this.handleUpdateComplete();
        break;
    }
  }

  onClose() {
    this.onOutputMessage(
      `${STATUS_MESSAGE_PREFIX} ${javalabMsg.programCompleted()}`
    );
    this.onNewlineMessage();
    this.setIsProgramRunning(false);
  }

  handleBatchUpdate(details) {
    details.updates.forEach(data => {
      this.handleSignal(data);
    });
  }

  addClickableItem(itemData) {
    this.addImageHelper(itemData, true);
  }

  addImageItem(itemData) {
    this.addImageHelper(itemData, false);
  }

  addImageHelper(itemData, isClickable) {
    // ignore request if the item already exists
    if (this.itemExists(itemData)) {
      return;
    }

    const imageData = {
      fileUrl: this.getUrl(itemData.filename),
      x: itemData.x,
      y: itemData.y,
      height: itemData.height,
      width: itemData.width,
      index: itemData.index,
      isClickable: isClickable,
      type: PlaygroundItemType.IMAGE
    };
    if (isClickable) {
      imageData.onClick = () => this.handleImageClick(itemData.id);
    }
    this.addPlaygroundItem(itemData.id, imageData);
  }

  addTextItem(itemData) {
    if (this.itemExists(itemData)) {
      // can't add new items if the item already exists
      return;
    }

    const textData = {...itemData};
    delete textData.id;
    textData.type = PlaygroundItemType.TEXT;

    this.addPlaygroundItem(itemData.id, textData);
  }

  removeItem(itemData) {
    if (this.itemExists(itemData)) {
      this.removePlaygroundItem(itemData.id);
    }
  }

  changeItem(itemData) {
    if (!this.itemExists(itemData)) {
      // can't change items if the item does not exist
      return;
    }

    const changedItemData = this.getChangedItemData(itemData);
    this.changePlaygroundItem(itemData.id, changedItemData);
  }

  getChangedItemData(itemData) {
    // We do not include the ID as part of each item's data.
    // The ID serves as the key referencing an object that contains the item's contents.
    const changedItemData = {...itemData};
    delete changedItemData.id;

    if (this.getItem(itemData.id).type === PlaygroundItemType.IMAGE) {
      if (itemData.filename) {
        changedItemData.fileUrl = this.getUrl(itemData.filename);
        // we don't need to pass filename as imageData
        delete changedItemData.filename;
      }
    }

    // No changes to itemData required for text items other than removing ID property.
    return changedItemData;
  }

  playSound(soundData) {
    this.setMediaElement(this.getAudioElement(), soundData.filename);
  }

  setBackgroundImage(backgroundData) {
    const filename = backgroundData.filename;
    const backgroundElement = this.getBackgroundElement();
    this.setMediaElement(backgroundElement, filename);
    backgroundElement.style.opacity = 1.0;
  }

  setMediaElement(element, filename) {
    element.onerror = () => {
      this.onFileLoadError(filename);
    };
    element.src = this.getUrl(filename);
  }

  reset() {
    this.isGameRunning = false;
    // reset playground items to be empty
    this.setPlaygroundItems({});
    this.resetBackgroundElement();
    this.resetAudioElement();
    this.resetContainer();
  }

  handleImageClick(imageId) {
    if (!this.isGameRunning || this.updateInProgress) {
      // can only handle click events if game is running and update is not in progress
      return;
    }
    this.updateInProgress = true;
    this.reenableClickEventsTimeoutId = setTimeout(
      this.reenableClickEvents,
      REENABLE_CLICK_EVENTS_TIMEOUT_MS
    );
    this.onJavabuilderMessage(WebSocketMessageType.PLAYGROUND, imageId);
  }

  handleUpdateComplete() {
    this.updateInProgress = false;
    if (this.reenableClickEventsTimeoutId) {
      clearTimeout(this.reenableClickEventsTimeoutId);
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

  getAudioElement() {
    return document.getElementById('playground-audio');
  }

  getContainer() {
    return document.getElementById('playground-container');
  }

  resetAudioElement() {
    const audioElement = this.getAudioElement();
    audioElement.pause();
    this.resetMediaElement(audioElement);
  }

  resetBackgroundElement() {
    const backgroundElement = this.getBackgroundElement();
    backgroundElement.style.opacity = 0.0;
    this.resetMediaElement(backgroundElement);
  }

  resetMediaElement(element) {
    element.onerror = undefined;
    element.src = '';
  }

  resetContainer() {
    const containerElement = this.getContainer();
    containerElement.style.backgroundColor = DEFAULT_BACKGROUND_COLOR;
  }

  endGame() {
    this.isGameRunning = false;
  }

  itemExists(itemData) {
    return getItemIds(getStore().getState().playground).includes(itemData.id);
  }

  getItem(itemId) {
    return getStore().getState().playground.itemData[itemId];
  }
}
