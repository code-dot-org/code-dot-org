import ReactDOM from 'react-dom';
import sinon from 'sinon';

import project from '@cdo/apps/code-studio/initApp/project';
import Javalab from '@cdo/apps/javalab/Javalab';
import {setAllSourcesAndFileMetadata} from '@cdo/apps/javalab/redux/editorRedux';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import {
  singleton as studioApp,
  stubStudioApp,
  restoreStudioApp,
} from '@cdo/apps/StudioApp';



window.fetch = jest.fn()
  .mockResolvedValue({json: jest.fn(), headers: {get: jest.fn()}});

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

  describe('beforeUnload', () => {
    let eventStub;

    beforeEach(() => {
      eventStub = {
        preventDefault: sinon.stub(),
        returnValue: undefined,
      };
    });

    it('triggers an autosave if there are unsaved changes', () => {
      sinon.stub(project, 'hasOwnerChangedProject').returns(true);

      javalab.beforeUnload(eventStub);

      expect(project.autosave).toHaveBeenCalledTimes(1);
      expect(eventStub.preventDefault).toHaveBeenCalledTimes(1);
      expect(eventStub.returnValue).toBe('');

      project.hasOwnerChangedProject.restore();
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

      expect(getStore().dispatch).toHaveBeenCalledWith(setAllSourcesAndFileMetadata(config.level.startSources));
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

      expect(getStore().dispatch).toHaveBeenCalledWith(setAllSourcesAndFileMetadata(config.level.lastAttempt));
    });

    it('does not populate if start sources are empty', () => {
      config.level = {
        startSources: {},
      };
      javalab.init(config);

      expect(getStore().getState().javalab.sources).not.toBe(config.level.startSources);
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

      expect(getStore().dispatch).toHaveBeenCalledWith(setAllSourcesAndFileMetadata(config.level.exemplarSources));
    });
  });
});
