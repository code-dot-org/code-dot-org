import sinon from 'sinon';
import ReactDOM from 'react-dom';
import {expect} from '../../util/reconfiguredChai';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
import reducers from '@cdo/apps/weblab/reducers';
import {changeMaxProjectCapacity} from '@cdo/apps/weblab/actions';
import {
  singleton as studioApp,
  stubStudioApp,
  restoreStudioApp
} from '@cdo/apps/StudioApp';
import commonReducers from '@cdo/apps/redux/commonReducers';
import WebLab from '@cdo/apps/weblab/WebLab';
import {TestResults} from '@cdo/apps/constants';
import project from '@cdo/apps/code-studio/initApp/project';
import {onSubmitComplete} from '@cdo/apps/submitHelper';
var filesApi = require('@cdo/apps/clientApi').files;

describe('WebLab', () => {
  let weblab;

  beforeEach(() => {
    weblab = new WebLab();
  });

  describe('init', () => {
    let config;
    beforeEach(() => {
      stubRedux();
      stubStudioApp();
      weblab.studioApp_ = studioApp();
      registerReducers(commonReducers);
      registerReducers(reducers);
      config = {
        skin: {},
        level: {}
      };
      sinon.stub(ReactDOM, 'render');
      sinon.stub(getStore(), 'dispatch');
    });

    afterEach(() => {
      restoreRedux();
      restoreStudioApp();
      ReactDOM.render.restore();
    });

    it('throws an error if studio app doesnt exist', () => {
      weblab.studioApp_ = null;
      expect(weblab.init).to.throw(Error);
    });

    it('dispatches changeMaxProjectCapacity', () => {
      weblab.init(config);
      expect(getStore().dispatch).to.have.been.calledWith(
        changeMaxProjectCapacity(20971520)
      );
      expect(ReactDOM.render).to.have.been.calledOnce;
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
      expect(weblab.startSources.value).to.equal('test');
    });

    it('calls the filesApi to get files', () => {
      sinon.spy(filesApi, 'getFiles');
      weblab.init(config);
      expect(filesApi.getFiles).to.have.been.calledOnce;
    });
  });

  describe('beforeUnload', () => {
    let eventStub;

    beforeEach(() => {
      sinon.stub(project, 'autosave');
      eventStub = {
        preventDefault: sinon.stub(),
        returnValue: undefined
      };
    });

    afterEach(() => {
      project.autosave.restore();
    });

    it('triggers an autosave if there are unsaved changes', () => {
      sinon.stub(project, 'hasOwnerChangedProject').returns(true);

      weblab.beforeUnload(eventStub);

      expect(project.autosave).to.have.been.calledOnce;
      expect(eventStub.preventDefault).to.have.been.calledOnce;
      expect(eventStub.returnValue).to.equal('');

      project.hasOwnerChangedProject.restore();
    });

    it('deletes event returnValue if there are no unsaved changes', () => {
      sinon.stub(project, 'hasOwnerChangedProject').returns(false);
      eventStub.returnValue = 'I should be deleted!';

      weblab.beforeUnload(eventStub);

      expect(project.autosave).to.not.have.been.called;
      expect(eventStub.preventDefault).to.not.have.been.calledOnce;
      expect(eventStub.returnValue).to.be.undefined;

      project.hasOwnerChangedProject.restore();
    });
  });

  describe('onFinish', () => {
    let reportStub;

    beforeEach(() => {
      reportStub = sinon.stub(weblab, 'reportResult');
    });

    afterEach(() => {
      reportStub.restore();
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
        }
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
      onComplete: onSubmitComplete
    };

    beforeEach(() => {
      sinon.stub(project, 'autosave').callsArg(0);
      reportStub = sinon.stub();
      weblab.studioApp_ = {report: reportStub};
      weblab.level = {id: 123};
    });

    afterEach(() => {
      project.autosave.restore();
    });

    it('calls report with success conditions if validated is true', () => {
      weblab.reportResult(true, true);
      expect(reportStub).to.have.been.calledWith({
        ...defaultValues,
        result: true,
        testResult: TestResults.FREE_PLAY
      });
    });

    it('calls report with failure conditions if validated is false', () => {
      weblab.studioApp_.displayFeedback = sinon.stub();
      weblab.reportResult(true, false);
      expect(reportStub).to.have.been.calledWith({
        ...defaultValues,
        ...{
          result: false,
          testResult: TestResults.FREE_PLAY_UNCHANGED_FAIL
        }
      });
    });
  });
  // test getCodeAsync
  // test prepareForRemix
  // test deleteProjectFile
  // test renameProjectFile
  // test changeProjectFile
  // test registerBeforeFirstwriteHook
  // test onProjectChanged
  // test loadFileEntries
});
