import sinon from 'sinon';
import {expect} from '../../util/reconfiguredChai';
import Playground from '@cdo/apps/javalab/Playground';
import {PlaygroundSignalType} from '@cdo/apps/javalab/constants';
import javalabMsg from '@cdo/javalab/locale';

describe('Playground', () => {
  const levelName = 'level';
  const starterAsset1 = 'starterAsset1';

  const starterAssetsResponse = {
    starter_assets: [{filename: starterAsset1}]
  };

  let backgroundElement,
    onOutputMessage,
    onNewlineMessage,
    onJavabuilderMessage,
    starterAssetsApi,
    assetsApi,
    playground,
    playgroundElement,
    addPlaygroundItem,
    removePlaygroundItem,
    setPlaygroundItems,
    changePlaygroundItem;

  beforeEach(() => {
    onOutputMessage = sinon.stub();
    onNewlineMessage = sinon.stub();
    onJavabuilderMessage = sinon.stub();
    addPlaygroundItem = sinon.stub();
    removePlaygroundItem = sinon.stub();
    setPlaygroundItems = sinon.stub();
    changePlaygroundItem = sinon.stub();
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

    playgroundElement = document.createElement('div');

    playground = new Playground(
      onOutputMessage,
      onNewlineMessage,
      onJavabuilderMessage,
      levelName,
      addPlaygroundItem,
      removePlaygroundItem,
      changePlaygroundItem,
      setPlaygroundItems,
      starterAssetsApi,
      assetsApi
    );

    playground.getBackgroundElement = () => backgroundElement;
    playground.getPlaygroundElement = () => playgroundElement;
  });

  it('sets background image when receiving a SET_BACKGROUND_IMAGE message for a starter asset', () => {
    const data = {
      value: PlaygroundSignalType.SET_BACKGROUND_IMAGE,
      detail: {
        filename: starterAsset1
      }
    };

    expect(backgroundElement.src).to.be.undefined;
    expect(backgroundElement.style.opacity).to.equal(0);
    expect(backgroundElement.onerror).to.be.undefined;

    playground.handleSignal(data);

    expect(backgroundElement.src).to.equal(`${levelName}/${starterAsset1}`);
    expect(backgroundElement.style.opacity).to.equal(1.0);
    expect(backgroundElement.onerror).to.exist;

    // Verify onerror callback
    backgroundElement.onerror();
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

    expect(backgroundElement.src).to.be.undefined;
    expect(backgroundElement.style.opacity).to.equal(0);
    expect(backgroundElement.onerror).to.be.undefined;

    playground.handleSignal(data);

    expect(backgroundElement.src).to.equal(`assets/${assetFile}`);
    expect(backgroundElement.style.opacity).to.equal(1.0);
    expect(backgroundElement.onerror).to.exist;

    // Verify onerror callback
    backgroundElement.onerror();
    verifyOnFileLoadError(assetFile);
  });

  it("doesn't set background image if game is over", () => {
    const exitMessage = {
      value: PlaygroundSignalType.EXIT
    };

    const data = {
      value: PlaygroundSignalType.SET_BACKGROUND_IMAGE,
      detail: {
        filename: 'filename'
      }
    };

    playground.handleSignal(exitMessage);

    expect(backgroundElement.src).to.be.undefined;
    expect(backgroundElement.style.opacity).to.equal(0);
    expect(backgroundElement.onerror).to.be.undefined;

    playground.handleSignal(data);

    // Background should not update
    expect(backgroundElement.src).to.be.undefined;
    expect(backgroundElement.style.opacity).to.equal(0);
    expect(backgroundElement.onerror).to.be.undefined;
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

    expect(backgroundElement.src).to.be.undefined;
    expect(backgroundElement.style.opacity).to.equal(0);
    expect(backgroundElement.onerror).to.be.undefined;
  });

  it('sets background image when receiving a SET_BACKGROUND_IMAGE message for an uploaded asset', () => {
    const assetFile = 'assetFile';
    const data = {
      value: PlaygroundSignalType.SET_BACKGROUND_IMAGE,
      detail: {
        filename: assetFile
      }
    };

    expect(backgroundElement.src).to.be.undefined;
    expect(backgroundElement.style.opacity).to.equal(0);
    expect(backgroundElement.onerror).to.be.undefined;

    playground.handleSignal(data);

    expect(backgroundElement.src).to.equal(`assets/${assetFile}`);
    expect(backgroundElement.style.opacity).to.equal(1.0);
    expect(backgroundElement.onerror).to.exist;

    // Verify onerror callback
    backgroundElement.onerror();
    verifyOnFileLoadError(assetFile);
  });

  it('adds clickable image when receiving a ADD_CLICKABLE_ITEM message for a starter asset', () => {
    const id = 'test_id';
    const data = {
      value: PlaygroundSignalType.ADD_CLICKABLE_ITEM,
      detail: {
        filename: starterAsset1,
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        id: id
      }
    };

    playground.handleSignal(data);
    expect(addPlaygroundItem).to.have.been.calledOnce;
  });

  it('adds clickable image when receiving a ADD_CLICKABLE_ITEM message for an uploaded asset', () => {
    const assetFile = 'assetFile';
    const id = 'test_id';
    const data = {
      value: PlaygroundSignalType.ADD_CLICKABLE_ITEM,
      detail: {
        filename: assetFile,
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        id: id
      }
    };

    playground.handleSignal(data);
    expect(addPlaygroundItem).to.have.been.calledOnce;
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

    expect(addPlaygroundItem).to.have.been.calledTwice;
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

    expect(addPlaygroundItem).to.have.been.calledOnce;
  });

  it('call changeItem after CHANGE_ITEM', () => {
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
        height: 200
      }
    };

    playground.handleSignal(addData);
    playground.handleSignal(changeData);

    expect(addPlaygroundItem).to.have.been.calledOnce;
    expect(changePlaygroundItem).to.have.been.calledOnce;
  });

  it('call removeItem after REMOVE_ITEM', () => {
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

    expect(addPlaygroundItem).to.have.been.calledOnce;
    expect(removePlaygroundItem).to.have.been.calledOnce;
  });

  it('does not try to remove an already removed item', () => {
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
    playground.handleSignal(removeData);

    expect(addPlaygroundItem).to.have.been.calledOnce;
    expect(removePlaygroundItem).to.have.been.calledOnce;
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
      x: 0,
      y: 0,
      width: 100,
      height: 50,
      id: id
    };
  }
});
