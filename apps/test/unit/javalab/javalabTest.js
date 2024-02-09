import sinon from 'sinon';
import ReactDOM from 'react-dom';
import {expect} from '../../util/reconfiguredChai';
import Javalab from '@cdo/apps/javalab/Javalab';
import project from '@cdo/apps/code-studio/initApp/project';
import {
  singleton as studioApp,
  stubStudioApp,
  restoreStudioApp,
} from '@cdo/apps/StudioApp';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import {setAllSourcesAndFileMetadata} from '@cdo/apps/javalab/redux/editorRedux';

describe('Javalab', () => {
  let javalab;
  let config;

  beforeEach(() => {
    javalab = new Javalab();
    stubRedux();
    registerReducers(commonReducers);
    sinon.stub(project, 'autosave');
    sinon.stub(ReactDOM, 'render');
    sinon.stub(getStore(), 'dispatch');
    stubStudioApp();
    javalab.studioApp_ = studioApp();
    config = {
      level: {},
      skin: {},
    };
  });

  afterEach(() => {
    sinon.restore();
    restoreRedux();
    restoreStudioApp();
  });

  describe('before unload', () => {
    it('registers save to occur if unsaved changes', () => {
      const saveOnUnloadSpy = sinon.spy(project, 'registerSaveOnUnload');
      javalab.init(config);
      expect(saveOnUnloadSpy).to.have.been.calledOnce;

      project.registerSaveOnUnload.restore();
    });
  });

  describe('populates sources', () => {
    it('with start_sources if there are any and there is no lastAttempt', () => {
      config.level = {
        startSources: {
          'File.java': {
            text: 'Some code',
            visible: true,
          },
        },
      };

      javalab.init(config);

      expect(getStore().dispatch).to.have.been.calledWith(
        setAllSourcesAndFileMetadata(config.level.startSources)
      );
    });

    it('with lastAttempt if there is one', () => {
      config.level = {
        startSources: {
          'File.java': {
            text: 'Some code',
            visible: true,
          },
        },
        lastAttempt: {
          'MyClass.java': {
            text: 'Some code 2',
            visible: true,
          },
        },
      };
      javalab.init(config);

      expect(getStore().dispatch).to.have.been.calledWith(
        setAllSourcesAndFileMetadata(config.level.lastAttempt)
      );
    });

    it('does not populate if start sources are empty', () => {
      config.level = {
        startSources: {},
      };
      javalab.init(config);

      expect(getStore().getState().javalab.sources).to.not.equal(
        config.level.startSources
      );
    });

    it('with exemplarSources if there are any', () => {
      config.level = {
        exemplarSources: {
          'File.java': {
            text: 'Some exemplar code',
          },
        },
      };
      javalab.init(config);

      expect(getStore().dispatch).to.have.been.calledWith(
        setAllSourcesAndFileMetadata(config.level.exemplarSources)
      );
    });
  });
});
