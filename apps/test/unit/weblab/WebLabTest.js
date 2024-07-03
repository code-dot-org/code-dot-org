import ReactDOM from 'react-dom';

import project from '@cdo/apps/code-studio/initApp/project';
import {TestResults} from '@cdo/apps/constants';
import dom from '@cdo/apps/dom';
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
import {onSubmitComplete} from '@cdo/apps/submitHelper';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import * as utils from '@cdo/apps/utils';
import {
  changeMaxProjectCapacity,
  changeFullScreenPreviewOn,
} from '@cdo/apps/weblab/actions';
import reducers from '@cdo/apps/weblab/reducers';
import WebLab from '@cdo/apps/weblab/WebLab';



var filesApi = require('@cdo/apps/clientApi').files;
var assetListStore = require('@cdo/apps/code-studio/assets/assetListStore');

describe('WebLab', () => {
  let weblab;
  let config;

  beforeEach(() => {
    weblab = new WebLab();
    stubRedux();
    stubStudioApp();
    weblab.studioApp_ = studioApp();
    registerReducers(commonReducers);
    registerReducers(reducers);
    registerReducers({currentUser});
    config = {
      skin: {},
      level: {},
    };
    jest.spyOn(ReactDOM, 'render').mockClear().mockImplementation();
    jest.spyOn(getStore(), 'dispatch').mockClear().mockImplementation();
  });

  afterEach(() => {
    restoreRedux();
    restoreStudioApp();
    ReactDOM.render.mockRestore();
  });

  describe('init', () => {
    it('throws an error if studio app doesnt exist', () => {
      weblab.studioApp_ = null;
      expect(weblab.init).toThrow(Error);
    });

    it('dispatches changeMaxProjectCapacity', () => {
      weblab.init(config);
      expect(getStore().dispatch).toHaveBeenCalledWith(changeMaxProjectCapacity(20971520));
    });

    it('does not set startSources if there are none', () => {
      config.level.startSources = '';
      weblab.init(config);
      expect(weblab.startSources).toBeUndefined();
    });

    it('does not set startSources if it is given invalid JSON', () => {
      config.level.startSources = '{:';
      weblab.init(config);
      expect(weblab.startSources).toBeUndefined();
    });

    it('sets startSources if given valid JSON', () => {
      const validJSON = {value: 'test'};
      config.level.startSources = JSON.stringify(validJSON);
      weblab.init(config);
      expect(weblab.startSources).toEqual({value: 'test'});
    });
  });

  describe('afterClearPuzzle', () => {
    beforeEach(() => {
      weblab.init(config);
      jest.spyOn(utils, 'reload').mockClear().mockImplementation();
    });

    afterEach(() => {
      utils.reload.mockRestore();
    });

    it('rejects with error showing deleteAll succeeded when filesApi deleteAll succeeds', async () => {
      jest.spyOn(filesApi, 'deleteAll').mockClear().mockImplementation((success, error) => {
        success({responseText: 'yay'});
      });
      weblab.fileEntries = 'entries';
      expect(config.afterClearPuzzle()).to.eventually.be.rejectedWith(
        'deleteAll succeeded, weblab handling reload to avoid saving'
      );
      expect(weblab.fileEntries).toBeNull();
      filesApi.deleteAll.mockRestore();
    });

    it('rejects with error showing deleteAll failed when filesApi deleteAll fails', async () => {
      jest.spyOn(filesApi, 'deleteAll').mockClear().mockImplementation((success, error) => {
        error({status: 'status'});
      });
      jest.spyOn(console, 'warn').mockClear().mockImplementation();
      weblab.fileEntries = 'entries';
      expect(config.afterClearPuzzle()).to.eventually.be.rejectedWith('status');
      expect(console.warn).to.have.been.calledOnceWith(
        'WebLab: error deleteAll failed: status'
      );
      expect(weblab.fileEntries).toBe('entries');
      filesApi.deleteAll.mockRestore();
      console.warn.mockRestore();
    });
  });

  describe('onToggleInspector', () => {
    let brambleHost;
    beforeEach(() => {
      brambleHost = {
        disableInspector: jest.fn(),
        enableInspector: jest.fn(),
      };
      weblab.brambleHost = brambleHost;
    });

    it('disables inspector if inspectorOn', () => {
      jest.spyOn(getStore(), 'getState').mockClear().mockReturnValue({inspectorOn: true});
      weblab.onToggleInspector();
      expect(brambleHost.disableInspector).toHaveBeenCalledTimes(1);
      getStore().getState.mockRestore();
    });

    it('enables inspector if inspectorOn false', () => {
      jest.spyOn(getStore(), 'getState').mockClear().mockReturnValue({inspectorOn: false});
      weblab.onToggleInspector();
      expect(brambleHost.enableInspector).toHaveBeenCalledTimes(1);
      getStore().getState.mockRestore();
    });
  });

  describe('onMount', () => {
    let config;
    beforeEach(() => {
      config = {
        containerId: 'container-id',
      };
      weblab.studioApp_ = studioApp();
      jest.spyOn(studioApp(), 'setConfigValues_').mockClear().mockImplementation();
      jest.spyOn(studioApp(), 'initProjectTemplateWorkspaceIconCallout').mockClear().mockImplementation();
      jest.spyOn(studioApp(), 'alertIfCompletedWhilePairing').mockClear().mockImplementation();
      jest.spyOn(studioApp(), 'initVersionHistoryUI').mockClear().mockImplementation();
      jest.spyOn(studioApp(), 'initTimeSpent').mockClear().mockImplementation();
      weblab.level = {unsubmitUrl: 'url'};
      jest.spyOn(dom, 'addClickTouchEvent').mockClear().mockImplementation();
    });

    afterEach(() => {
      dom.addClickTouchEvent.mockRestore();
    });

    it('adds clickTouchEvent 3 times if there is a finishButton', () => {
      const finishButton = {className: 'test'};
      jest.spyOn(document, 'getElementById').mockClear().mockReturnValue(finishButton);
      weblab.onMount(config);
      expect(dom.addClickTouchEvent).toHaveBeenCalledWith(finishButton);
      document.getElementById.mockRestore();
    });

    it('adds clickTouchEvent 2 times if there is no finishButton', () => {
      jest.spyOn(document, 'getElementById').mockClear()
        .onCall(0)
        .mockReturnValue({className: 'test'}).mockImplementation(() => {
        if (jest.spyOn(document, 'getElementById').mockClear()
          .onCall(0)
          .mockReturnValue({className: 'test'}).mock.calls.length === 1) {
          return null;
        }
      });
      weblab.onMount(config);
      expect(dom.addClickTouchEvent).not.toHaveBeenCalled();
      document.getElementById.mockRestore();
    });
  });

  describe('onStartFullScreenPreview', () => {
    let brambleHost;
    beforeEach(() => {
      brambleHost = {
        enableFullscreenPreview: callback => callback(),
        disableInspector: jest.fn(),
      };
      weblab.brambleHost = brambleHost;
    });

    it('disables inspector if inspectorOn', () => {
      jest.spyOn(getStore(), 'getState').mockClear().mockReturnValue({inspectorOn: true});
      weblab.onStartFullScreenPreview();
      expect(brambleHost.disableInspector).toHaveBeenCalledTimes(1);
      getStore().getState.mockRestore();
    });

    it('dispatches the changeFullScreenPreviewOn action', () => {
      jest.spyOn(getStore(), 'getState').mockClear().mockReturnValue({inspectorOn: true});
      weblab.onStartFullScreenPreview();
      expect(getStore().dispatch).toHaveBeenCalledWith(changeFullScreenPreviewOn(true));
      getStore().getState.mockRestore();
    });
  });

  describe('beforeUnload', () => {
    let eventStub;

    beforeEach(() => {
      jest.spyOn(project, 'autosave').mockClear().mockImplementation();
      eventStub = {
        preventDefault: jest.fn(),
        returnValue: undefined,
      };
    });

    afterEach(() => {
      project.autosave.mockRestore();
    });

    it('triggers an autosave if there are unsaved changes', () => {
      jest.spyOn(project, 'hasOwnerChangedProject').mockClear().mockReturnValue(true);

      weblab.beforeUnload(eventStub);

      expect(project.autosave).toHaveBeenCalledTimes(1);
      expect(eventStub.preventDefault).toHaveBeenCalledTimes(1);
      expect(eventStub.returnValue).toBe('');

      project.hasOwnerChangedProject.mockRestore();
    });

    it('deletes event returnValue if there are no unsaved changes', () => {
      jest.spyOn(project, 'hasOwnerChangedProject').mockClear().mockReturnValue(false);
      eventStub.returnValue = 'I should be deleted!';

      weblab.beforeUnload(eventStub);

      expect(project.autosave).not.toHaveBeenCalled();
      expect(eventStub.preventDefault).not.toHaveBeenCalledTimes(1);
      expect(eventStub.returnValue).toBeUndefined();

      project.hasOwnerChangedProject.mockRestore();
    });
  });

  describe('onFinish', () => {
    let reportStub;

    beforeEach(() => {
      reportStub = jest.spyOn(weblab, 'reportResult').mockClear().mockImplementation();
    });

    afterEach(() => {
      reportStub.mockRestore();
    });

    it('skips validation if validationEnabled is set to false', () => {
      weblab.level = {validationEnabled: false};
      weblab.onFinish(true);
      expect(reportStub).toHaveBeenCalledWith(true, true);
    });

    it('reports the result from validateProjectChanged if validation is enabled', () => {
      weblab.level = {validationEnabled: true};
      weblab.brambleHost = {
        validateProjectChanged: callback => {
          callback(false);
        },
      };
      weblab.onFinish(false);
      expect(reportStub).toHaveBeenCalledWith(false, false);
    });
  });

  describe('reportResult', () => {
    let reportStub;
    const defaultValues = {
      app: 'weblab',
      level: 123,
      program: '',
      submitted: true,
      onComplete: onSubmitComplete,
    };

    beforeEach(() => {
      jest.spyOn(project, 'autosave').mockClear().mockImplementation().mockImplementation((...args) => args[0]());
      reportStub = jest.fn();
      weblab.studioApp_ = {report: reportStub};
      weblab.level = {id: 123};
    });

    afterEach(() => {
      project.autosave.mockRestore();
    });

    it('calls report with success conditions if validated is true', () => {
      weblab.reportResult(true, true);
      expect(reportStub).toHaveBeenCalledWith({
        ...defaultValues,
        result: true,
        testResult: TestResults.FREE_PLAY,
      });
    });

    it('calls report with failure conditions if validated is false', () => {
      weblab.studioApp_.displayFeedback = jest.fn();
      weblab.reportResult(true, false);
      expect(reportStub).toHaveBeenCalledWith({
        ...defaultValues,
        ...{
          result: false,
          testResult: TestResults.FREE_PLAY_UNCHANGED_FAIL,
        },
      });
    });
  });

  describe('getCodeAsync', () => {
    it('resolves with empty string if brambleHost is null', () => {
      weblab.brambleHost = null;
      return weblab.getCodeAsync().then(value => {
        expect(value).toBe('');
      });
    });

    it('rejects with error if brambleHost syncFiles has an error', () => {
      weblab.brambleHost = {
        syncFiles: (files, projectVersion, callback) => callback('error'),
      };
      return weblab.getCodeAsync().catch(error => {
        expect(error).toBe('error');
      });
    });

    it('resolves with files version id when brambleHost syncFiles has no error', () => {
      weblab.brambleHost = {
        syncFiles: (files, projectVersion, callback) => callback(),
      };
      weblab.initialFilesVersionId = 'version-id';
      return weblab.getCodeAsync().then(val => {
        expect(val).toBe('version-id');
      });
    });
  });

  describe('onProjectChanged', () => {
    beforeEach(() => {
      jest.spyOn(project, 'projectChanged').mockClear().mockImplementation();
    });

    afterEach(() => {
      project.projectChanged.mockRestore();
    });

    it('does not call projectChanged if it is readonly', () => {
      weblab.readOnly = true;
      weblab.onProjectChanged();
      expect(project.projectChanged).not.toHaveBeenCalled();
    });

    it('calls projectChanged if it is not readonly', () => {
      weblab.readOnly = false;
      weblab.onProjectChanged();
      expect(project.projectChanged).toHaveBeenCalledTimes(1);
    });
  });

  describe('onFilesReady', () => {
    let files;
    beforeEach(() => {
      jest.spyOn(assetListStore, 'reset').mockClear().mockImplementation();
      files = [
        {
          filename: 'file1.html',
          versionId: '2',
        },
        {
          filename: 'file2.html',
          versionId: '2',
        },
      ];
      jest.spyOn(assetListStore, 'list').mockClear().mockReturnValue(files);
      jest.spyOn(filesApi, 'basePath').mockClear().mockReturnValue('stubbedpath');
    });

    afterEach(() => {
      assetListStore.reset.mockRestore();
      assetListStore.list.mockRestore();
      filesApi.basePath.mockRestore();
    });

    it('updates fileEntries and initialFilesVersionId', () => {
      weblab.fileEntries = [];
      weblab.initialFilesVersionId = '1';
      project.filesVersionId = '1';
      const newFilesVersionId = '2';
      weblab.brambleHost = {
        syncFiles: jest.fn(),
      };
      weblab.onFilesReady(files, newFilesVersionId);
      expect(assetListStore.reset).to.have.been.calledOnceWith(files);
      expect(weblab.fileEntries).toEqual([
        {
          name: 'file1.html',
          url: 'stubbedpath',
          versionId: '2',
        },
        {
          name: 'file2.html',
          url: 'stubbedpath',
          versionId: '2',
        },
      ]);
      expect(weblab.initialFilesVersionId).toBe('1');
      expect(project.filesVersionId).toBe('2');
      expect(weblab.brambleHost.syncFiles).toHaveBeenCalledTimes(1);
    });
  });
});
