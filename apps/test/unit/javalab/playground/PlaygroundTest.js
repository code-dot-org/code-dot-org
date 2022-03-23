import sinon from 'sinon';
import {expect} from '../../../util/reconfiguredChai';
import Playground, {
  REENABLE_CLICK_EVENTS_TIMEOUT_MS
} from '@cdo/apps/javalab/playground/Playground';
import {
  PlaygroundSignalType,
  WebSocketMessageType
} from '@cdo/apps/javalab/constants';
import javalabMsg from '@cdo/javalab/locale';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
import playgroundRedux from '@cdo/apps/javalab/playground/playgroundRedux';
import color from '@cdo/apps/util/color';

describe('Playground', () => {
  const levelName = 'level';
  const starterAsset1 = 'starterAsset1';

  const starterAssetsResponse = {
    starter_assets: [{filename: starterAsset1}]
  };

  let backgroundElement,
    audioElement,
    containerElement,
    onOutputMessage,
    onNewlineMessage,
    onJavabuilderMessage,
    starterAssetsApi,
    assetsApi,
    playground,
    setIsProgramRunning,
    clock;

  beforeEach(() => {
    stubRedux();
    registerReducers({playground: playgroundRedux});
    clock = sinon.useFakeTimers();
    onOutputMessage = sinon.stub();
    onNewlineMessage = sinon.stub();
    onJavabuilderMessage = sinon.stub();
    setIsProgramRunning = sinon.stub();
    starterAssetsApi = {
      getStarterAssets: (levelName, onSuccess, onFailure) => {
        onSuccess({
          response: JSON.stringify(starterAssetsResponse)
        });
      },
      withLevelName: levelName => ({
        basePath: filename => `${levelName}/${filename}`
      })
    };
    assetsApi = {
      basePath: filename => `assets/${filename}`
    };

    backgroundElement = {
      style: {
        opacity: 0
      }
    };

    audioElement = {pause: () => {}};

    containerElement = {style: {}};

    playground = new Playground(
      onOutputMessage,
      onNewlineMessage,
      onJavabuilderMessage,
      levelName,
      setIsProgramRunning,
      starterAssetsApi,
      assetsApi
    );

    playground.getBackgroundElement = () => backgroundElement;
    playground.getAudioElement = () => audioElement;
    playground.getContainer = () => containerElement;
  });

  afterEach(() => {
    sinon.restore();
    restoreRedux();
    clock.restore();
  });

  it('sets background image when receiving a SET_BACKGROUND_IMAGE message for a starter asset', () => {
    const data = {
      value: PlaygroundSignalType.SET_BACKGROUND_IMAGE,
      detail: {
        filename: starterAsset1
      }
    };

    verifyDefaultMediaElementState(backgroundElement);
    expect(backgroundElement.style.opacity).to.equal(0);

    playground.handleSignal(data);

    expect(backgroundElement.src).to.equal(`${levelName}/${starterAsset1}`);
    expect(backgroundElement.style.opacity).to.equal(1.0);
    expect(backgroundElement.onerror).to.exist;

    // Verify onerror callback
    backgroundElement.onerror();
    verifyOnFileLoadError(starterAsset1);
  });

  it('sets audio when receiving a PLAY_SOUND message for a starter asset', () => {
    const data = {
      value: PlaygroundSignalType.PLAY_SOUND,
      detail: {
        filename: starterAsset1
      }
    };

    verifyDefaultMediaElementState(audioElement);

    playground.handleSignal(data);

    expect(audioElement.src).to.equal(`${levelName}/${starterAsset1}`);
    expect(audioElement.onerror).to.exist;

    // Verify onerror callback
    audioElement.onerror();
    verifyOnFileLoadError(starterAsset1);
  });

  it('sets background image when receiving a SET_BACKGROUND_IMAGE message for an uploaded asset', () => {
    const assetFile = 'assetFile';
    const data = {
      value: PlaygroundSignalType.SET_BACKGROUND_IMAGE,
      detail: {
        filename: assetFile
      }
    };

    verifyDefaultMediaElementState(backgroundElement);
    expect(backgroundElement.style.opacity).to.equal(0);

    playground.handleSignal(data);

    expect(backgroundElement.src).to.equal(`assets/${assetFile}`);
    expect(backgroundElement.style.opacity).to.equal(1.0);
    expect(backgroundElement.onerror).to.exist;

    // Verify onerror callback
    backgroundElement.onerror();
    verifyOnFileLoadError(assetFile);
  });

  it('sets audio when receiving a PLAY_SOUND message for an uploaded asset', () => {
    const assetFile = 'assetFile';
    const data = {
      value: PlaygroundSignalType.PLAY_SOUND,
      detail: {
        filename: assetFile
      }
    };

    verifyDefaultMediaElementState(audioElement);

    playground.handleSignal(data);

    expect(audioElement.src).to.equal(`assets/${assetFile}`);
    expect(audioElement.onerror).to.exist;

    // Verify onerror callback
    audioElement.onerror();
    verifyOnFileLoadError(assetFile);
  });

  it('resets the background image on reset()', () => {
    const data = {
      value: PlaygroundSignalType.SET_BACKGROUND_IMAGE,
      detail: {
        filename: 'filename'
      }
    };

    playground.handleSignal(data);

    expect(backgroundElement.src).to.exist;
    expect(backgroundElement.style.opacity).to.equal(1.0);
    expect(backgroundElement.onerror).to.exist;

    playground.reset();

    expect(backgroundElement.src).to.equal('');
    expect(backgroundElement.style.opacity).to.equal(0);
    expect(backgroundElement.onerror).to.be.undefined;
  });

  it('adds clickable image when receiving a ADD_CLICKABLE_ITEM message for a starter asset', () => {
    const id = 'test_id';
    const data = {
      value: PlaygroundSignalType.ADD_CLICKABLE_ITEM,
      detail: createSampleImageDetails('assetFile', id)
    };

    playground.handleSignal(data);
    const itemData = getStore().getState().playground.itemData;
    expect(itemData[id].width).to.equal('100');
  });

  it('adds clickable image when receiving a ADD_CLICKABLE_ITEM message for an uploaded asset', () => {
    const id = 'test_id';
    const data = {
      value: PlaygroundSignalType.ADD_CLICKABLE_ITEM,
      detail: createSampleImageDetails('assetFile', id)
    };

    playground.handleSignal(data);
    const itemData = getStore().getState().playground.itemData;
    expect(itemData[id].height).to.equal('50');
  });

  it('adds text item when receiving a ADD_TEXT_ITEM message', () => {
    const id = 'test_id';
    const data = {
      value: PlaygroundSignalType.ADD_TEXT_ITEM,
      detail: createSampleTextDetails(id)
    };

    playground.handleSignal(data);
    const itemData = getStore().getState().playground.itemData;
    expect(itemData[id].height).to.equal('50');
  });

  it('resets sound element on reset()', () => {
    const data = {
      value: PlaygroundSignalType.PLAY_SOUND,
      detail: {
        filename: 'filename'
      }
    };

    playground.handleSignal(data);

    expect(audioElement.src).to.exist;
    expect(audioElement.onerror).to.exist;

    playground.reset();

    expect(audioElement.src).to.equal('');
    expect(audioElement.onerror).to.be.undefined;
  });

  it('resets sound element when stopped', () => {
    const data = {
      value: PlaygroundSignalType.PLAY_SOUND,
      detail: {
        filename: 'filename'
      }
    };

    playground.handleSignal(data);

    expect(audioElement.src).to.exist;
    expect(audioElement.onerror).to.exist;

    playground.onStop();

    expect(audioElement.src).to.equal('');
    expect(audioElement.onerror).to.be.undefined;
  });

  it('resets container on reset', () => {
    expect(containerElement.style.backgroundColor).to.be.undefined;

    playground.reset();

    expect(containerElement.style.backgroundColor).to.equal(color.white);
  });

  it('can add multiple images via ADD_IMAGE_ITEM', () => {
    const assetFile = 'assetFile';
    const firstId = 'first_id';
    const secondId = 'second_id';
    const firstData = {
      value: PlaygroundSignalType.ADD_IMAGE_ITEM,
      detail: createSampleImageDetails(assetFile, firstId)
    };
    const secondData = {
      value: PlaygroundSignalType.ADD_IMAGE_ITEM,
      detail: createSampleImageDetails(assetFile, secondId)
    };

    playground.handleSignal(firstData);
    playground.handleSignal(secondData);

    const itemData = getStore().getState().playground.itemData;
    expect(Object.keys(itemData).length).to.equal(2);
  });

  it('can add multiple text items via ADD_TEXT_ITEM', () => {
    const firstId = 'first_id';
    const secondId = 'second_id';
    const firstData = {
      value: PlaygroundSignalType.ADD_TEXT_ITEM,
      detail: createSampleTextDetails(firstId)
    };
    const secondData = {
      value: PlaygroundSignalType.ADD_TEXT_ITEM,
      detail: createSampleTextDetails(secondId)
    };

    playground.handleSignal(firstData);
    playground.handleSignal(secondData);

    const itemData = getStore().getState().playground.itemData;
    expect(Object.keys(itemData).length).to.equal(2);
  });

  it('does not add duplicate images from ADD_IMAGE_ITEM', () => {
    const assetFile = 'assetFile';
    const id = 'first_id';
    const data = {
      value: PlaygroundSignalType.ADD_IMAGE_ITEM,
      detail: createSampleImageDetails(assetFile, id)
    };

    playground.handleSignal(data);
    playground.handleSignal(data);

    const itemData = getStore().getState().playground.itemData;
    expect(Object.keys(itemData).length).to.equal(1);
  });

  it('does not add duplicate text items from ADD_TEXT_ITEM', () => {
    const id = 'first_id';
    const data = {
      value: PlaygroundSignalType.ADD_TEXT_ITEM,
      detail: createSampleTextDetails(id)
    };

    playground.handleSignal(data);
    playground.handleSignal(data);

    const itemData = getStore().getState().playground.itemData;
    expect(Object.keys(itemData).length).to.equal(1);
  });

  it('updates an image item via CHANGE_ITEM after adding it', () => {
    const assetFile = 'assetFile';
    const id = 'first_id';
    const addData = {
      value: PlaygroundSignalType.ADD_IMAGE_ITEM,
      detail: createSampleImageDetails(assetFile, id)
    };
    const changeData = {
      value: PlaygroundSignalType.CHANGE_ITEM,
      detail: {
        id: id,
        height: '200'
      }
    };

    playground.handleSignal(addData);
    playground.handleSignal(changeData);

    const itemData = getStore().getState().playground.itemData;
    expect(itemData[id].height).to.equal('200');
  });

  it('updates a text item via CHANGE_ITEM after adding it', () => {
    const id = 'first_id';
    const addData = {
      value: PlaygroundSignalType.ADD_TEXT_ITEM,
      detail: createSampleTextDetails(id)
    };
    const changeData = {
      value: PlaygroundSignalType.CHANGE_ITEM,
      detail: {
        id: id,
        height: '200',
        fontStyle: 'NORMAL'
      }
    };

    playground.handleSignal(addData);
    playground.handleSignal(changeData);

    const itemData = getStore().getState().playground.itemData;
    expect(itemData[id].height).to.equal('200');
    expect(itemData[id].fontStyle).to.equal('NORMAL');
  });

  it('can remove an item with REMOVE_ITEM', () => {
    const assetFile = 'assetFile';
    const id = 'first_id';
    const addData = {
      value: PlaygroundSignalType.ADD_IMAGE_ITEM,
      detail: createSampleImageDetails(assetFile, id)
    };
    const removeData = {
      value: PlaygroundSignalType.REMOVE_ITEM,
      detail: {
        id: id
      }
    };

    playground.handleSignal(addData);
    playground.handleSignal(removeData);

    const itemData = getStore().getState().playground.itemData;
    expect(Object.keys(itemData).length).to.equal(0);
  });

  it('calls onJavabuilderMessage for a valid click event', () => {
    var runMessage = {
      value: PlaygroundSignalType.RUN
    };
    playground.handleSignal(runMessage);
    const imageId = 'test';
    playground.handleImageClick(imageId);
    expect(onJavabuilderMessage).to.have.been.calledWith(
      WebSocketMessageType.PLAYGROUND,
      imageId
    );
  });

  it('does not call onJavabuilderMessage for a click event if the game is over', () => {
    var exitMessage = {
      value: PlaygroundSignalType.EXIT
    };
    playground.handleSignal(exitMessage);
    const imageId = 'test';
    playground.handleImageClick(imageId);
    expect(onJavabuilderMessage).to.not.have.been.called;
  });

  it('does not call onJavabuilderMessage for a click event if the game is not running', () => {
    // by default, the game is not running
    const imageId = 'test';
    playground.handleImageClick(imageId);
    expect(onJavabuilderMessage).to.not.have.been.called;
  });

  it('sets isProgramRunning to false on stop', () => {
    playground.onClose();
    expect(setIsProgramRunning).to.have.been.calledWith(false);
    expect(onOutputMessage).to.have.been.calledOnce;
    expect(onNewlineMessage).to.have.been.calledOnce;
  });

  it('does not send click event if update is in progress', () => {
    playground.handleSignal({value: PlaygroundSignalType.RUN});

    const imageId = 'id';
    playground.handleImageClick(imageId);
    expect(onJavabuilderMessage).to.have.been.calledOnce;

    onJavabuilderMessage.reset();
    playground.handleImageClick(imageId);
    // Should not be called again
    expect(onJavabuilderMessage).to.have.not.been.called;

    playground.handleSignal({value: PlaygroundSignalType.UPDATE_COMPLETE});
    playground.handleImageClick(imageId);
    // Should be able to send message after receiving UPDATE_COMPLETE
    expect(onJavabuilderMessage).to.have.been.calledOnce;
  });

  it('re-enables click events after timeout', () => {
    playground.handleSignal({value: PlaygroundSignalType.RUN});

    const imageId = 'id';
    playground.handleImageClick(imageId);
    expect(onJavabuilderMessage).to.have.been.calledOnce;

    onJavabuilderMessage.reset();
    playground.handleImageClick(imageId);
    // Should not be called again
    expect(onJavabuilderMessage).to.have.not.been.called;

    clock.tick(REENABLE_CLICK_EVENTS_TIMEOUT_MS + 1);

    // Should be able to send message after timeout
    playground.handleImageClick(imageId);
    expect(onJavabuilderMessage).to.have.been.calledOnce;
  });

  function verifyOnFileLoadError(filename) {
    sinon.assert.calledOnce(onOutputMessage);
    sinon.assert.calledWith(
      onOutputMessage,
      javalabMsg.fileLoadError({filename})
    );
    sinon.assert.calledOnce(onNewlineMessage);
  }

  function createSampleImageDetails(filename, id) {
    return {
      filename: filename,
      x: '0',
      y: '0',
      width: '100',
      height: '50',
      id: id
    };
  }

  function createSampleTextDetails(id) {
    return {
      id: id,
      text: 'some text',
      x: '200',
      y: '200',
      height: '50',
      index: '1',
      rotation: '45',
      colorRed: '0',
      colorGreen: '0',
      colorBlue: '255',
      font: 'SANS',
      fontStyle: 'BOLD'
    };
  }

  function verifyDefaultMediaElementState(element) {
    expect(element.src).to.be.undefined;
    expect(element.onerror).to.be.undefined;
  }
});
