import ReactDOM from 'react-dom';

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

window.fetch = jest
  .fn()
  .mockResolvedValue({json: jest.fn(), headers: {get: jest.fn()}});

const CONTAINER_ID = 'container-id';

describe('Javalab', () => {
  let javalab;
  let config;

  beforeAll(() => {
    const rootContainer = document.createElement('div');
    rootContainer.setAttribute('id', CONTAINER_ID);
    document.getElementsByTagName('body')[0].appendChild(rootContainer);
  });

  beforeEach(() => {
    javalab = new Javalab();
    stubRedux();
    registerReducers(commonReducers);
    jest.spyOn(project, 'autosave').mockClear().mockImplementation();
    jest.spyOn(ReactDOM, 'render').mockClear().mockImplementation();
    jest.spyOn(getStore(), 'dispatch').mockClear().mockImplementation();
    stubStudioApp();
    javalab.studioApp_ = studioApp();
    config = {
      containerId: CONTAINER_ID,
      level: {},
      skin: {},
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    restoreRedux();
    restoreStudioApp();
  });

  describe('beforeUnload', () => {
    let eventStub;

    beforeEach(() => {
      eventStub = {
        preventDefault: jest.fn(),
        returnValue: undefined,
      };
    });

    it('triggers an autosave if there are unsaved changes', () => {
      jest
        .spyOn(project, 'hasOwnerChangedProject')
        .mockClear()
        .mockReturnValue(true);

      javalab.beforeUnload(eventStub);

      expect(project.autosave).toHaveBeenCalledTimes(1);
      expect(eventStub.preventDefault).toHaveBeenCalledTimes(1);
      expect(eventStub.returnValue).toBe('');

      project.hasOwnerChangedProject.mockRestore();
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

      expect(getStore().dispatch).toHaveBeenCalledWith(
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

      expect(getStore().dispatch).toHaveBeenCalledWith(
        setAllSourcesAndFileMetadata(config.level.lastAttempt)
      );
    });

    it('does not populate if start sources are empty', () => {
      config.level = {
        startSources: {},
      };
      javalab.init(config);

      expect(getStore().getState().javalab.sources).not.toBe(
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

      expect(getStore().dispatch).toHaveBeenCalledWith(
        setAllSourcesAndFileMetadata(config.level.exemplarSources)
      );
    });
  });
});
