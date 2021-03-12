import sinon from 'sinon';
import {expect} from '../../util/reconfiguredChai';
import WebLab from '@cdo/apps/weblab/WebLab';
import {TestResults} from '@cdo/apps/constants';
import project from '@cdo/apps/code-studio/initApp/project';
import {onSubmitComplete} from '@cdo/apps/submitHelper';

describe('WebLab', () => {
  let weblab;

  beforeEach(() => {
    weblab = new WebLab();
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
});
