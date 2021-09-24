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
    audioElement,
    onOutputMessage,
    onNewlineMessage,
    onJavabuilderMessage,
    starterAssetsApi,
    assetsApi,
    playground;

  beforeEach(() => {
    onOutputMessage = sinon.stub();
    onNewlineMessage = sinon.stub();
    onJavabuilderMessage = sinon.stub();
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

    playground = new Playground(
      onOutputMessage,
      onNewlineMessage,
      onJavabuilderMessage,
      levelName,
      starterAssetsApi,
      assetsApi
    );

    playground.getBackgroundElement = () => backgroundElement;
    playground.getAudioElement = () => audioElement;
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

    verifyDefaultMediaElementState(backgroundElement);
    expect(backgroundElement.style.opacity).to.equal(0);

    playground.handleSignal(data);

    // Background should not update
    verifyDefaultMediaElementState(backgroundElement);
    expect(backgroundElement.style.opacity).to.equal(0);
  });

  it("doesn't play sound if game is over", () => {
    const exitMessage = {
      value: PlaygroundSignalType.EXIT
    };

    const data = {
      value: PlaygroundSignalType.PLAY_SOUND,
      detail: {
        filename: 'filename'
      }
    };

    playground.handleSignal(exitMessage);

    verifyDefaultMediaElementState(audioElement);

    playground.handleSignal(data);

    // Audio element should not update
    verifyDefaultMediaElementState(audioElement);
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

  function verifyOnFileLoadError(filename) {
    sinon.assert.calledOnce(onOutputMessage);
    sinon.assert.calledWith(
      onOutputMessage,
      javalabMsg.fileLoadError({filename})
    );
    sinon.assert.calledOnce(onNewlineMessage);
  }

  function verifyDefaultMediaElementState(element) {
    expect(element.src).to.be.undefined;
    expect(element.onerror).to.be.undefined;
  }
});
