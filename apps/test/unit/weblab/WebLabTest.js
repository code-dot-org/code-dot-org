import ReactDOM from 'react-dom';
import {expect} from '../../util/reconfiguredChai';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import reducers from '@cdo/apps/weblab/reducers';
import {
  changeMaxProjectCapacity,
  changeFullScreenPreviewOn,
} from '@cdo/apps/weblab/actions';
import {
  singleton as studioApp,
  stubStudioApp,
  restoreStudioApp,
} from '@cdo/apps/StudioApp';
import commonReducers from '@cdo/apps/redux/commonReducers';
import WebLab from '@cdo/apps/weblab/WebLab';
import {TestResults} from '@cdo/apps/constants';
import project from '@cdo/apps/code-studio/initApp/project';
import {onSubmitComplete} from '@cdo/apps/submitHelper';
import * as utils from '@cdo/apps/utils';
var filesApi = require('@cdo/apps/clientApi').files;
var assetListStore = require('@cdo/apps/code-studio/assets/assetListStore');
import dom from '@cdo/apps/dom';

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
      expect(weblab.init).to.throw(Error);
    });

    it('dispatches changeMaxProjectCapacity', () => {
      weblab.init(config);
      expect(getStore().dispatch).to.have.been.calledWith(
        changeMaxProjectCapacity(20971520)
      );
    });

    it('does not set startSources if there are none', () => {
      config.level.startSources = '';
      weblab.init(config);
      expect(weblab.startSources).to.be.undefined;
    });

    it('does not set startSources if it is given invalid JSON', () => {
      config.level.startSources = '{:';
      expect(() => weblab.init(config)).to.throw(Error);
      expect(weblab.startSources).to.be.undefined;
    });

    it('sets startSources if given valid JSON', () => {
      const validJSON = {value: 'test'};
      config.level.startSources = JSON.stringify(validJSON);
      weblab.init(config);
      expect(weblab.startSources).to.deep.equal({value: 'test'});
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
      expect(weblab.fileEntries).to.equal(null);
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
      expect(weblab.fileEntries).to.equal('entries');
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
      expect(brambleHost.disableInspector).to.have.been.calledOnce;
      getStore().getState.mockRestore();
    });

    it('enables inspector if inspectorOn false', () => {
      jest.spyOn(getStore(), 'getState').mockClear().mockReturnValue({inspectorOn: false});
      weblab.onToggleInspector();
      expect(brambleHost.enableInspector).to.have.been.calledOnce;
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
      expect(dom.addClickTouchEvent).to.have.been.calledWith(finishButton);
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
      expect(dom.addClickTouchEvent).to.not.have.been.called;
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
      expect(brambleHost.disableInspector).to.have.been.calledOnce;
      getStore().getState.mockRestore();
    });

    it('dispatches the changeFullScreenPreviewOn action', () => {
      jest.spyOn(getStore(), 'getState').mockClear().mockReturnValue({inspectorOn: true});
      weblab.onStartFullScreenPreview();
      expect(getStore().dispatch).to.have.been.calledWith(
        changeFullScreenPreviewOn(true)
      );
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

      expect(project.autosave).to.have.been.calledOnce;
      expect(eventStub.preventDefault).to.have.been.calledOnce;
      expect(eventStub.returnValue).to.equal('');

      project.hasOwnerChangedProject.mockRestore();
    });

    it('deletes event returnValue if there are no unsaved changes', () => {
      jest.spyOn(project, 'hasOwnerChangedProject').mockClear().mockReturnValue(false);
      eventStub.returnValue = 'I should be deleted!';

      weblab.beforeUnload(eventStub);

      expect(project.autosave).to.not.have.been.called;
      expect(eventStub.preventDefault).to.not.have.been.calledOnce;
      expect(eventStub.returnValue).to.be.undefined;

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
      expect(reportStub).to.have.been.calledWith(true, true);
    });

    it('reports the result from validateProjectChanged if validation is enabled', () => {
      weblab.level = {validationEnabled: true};
      weblab.brambleHost = {
        validateProjectChanged: callback => {
          callback(false);
        },
      };
      weblab.onFinish(false);
      expect(reportStub).to.have.been.calledWith(false, false);
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
      expect(reportStub).to.have.been.calledWith({
        ...defaultValues,
        result: true,
        testResult: TestResults.FREE_PLAY,
      });
    });

    it('calls report with failure conditions if validated is false', () => {
      weblab.studioApp_.displayFeedback = jest.fn();
      weblab.reportResult(true, false);
      expect(reportStub).to.have.been.calledWith({
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
      weblab.getCodeAsync().then(value => {
        expect(value).to.equal('');
      });
    });

    it('rejects with error if brambleHost syncFiles has an error', () => {
      weblab.brambleHost = {
        syncFiles: callback => callback('error'),
      };
      weblab.getCodeAsync().catch(error => {
        expect(error).to.equal('error');
      });
    });

    it('resolves with files version id when brambleHost syncFiles has no error', () => {
      weblab.brambleHost = {
        syncFiles: callback => callback('error'),
      };
      weblab.initialFilesVersionId = 'version-id';
      weblab.getCodeAsync().then(val => {
        expect(val).to.equal('version-id');
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
      expect(project.projectChanged).to.have.not.been.called;
    });

    it('calls projectChanged if it is not readonly', () => {
      weblab.readOnly = false;
      weblab.onProjectChanged();
      expect(project.projectChanged).to.have.been.calledOnce;
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
      expect(weblab.fileEntries).to.deep.equal([
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
      expect(weblab.initialFilesVersionId).to.equal('1');
      expect(project.filesVersionId).to.equal('2');
      expect(weblab.brambleHost.syncFiles).to.have.been.calledOnce;
    });
  });
});
