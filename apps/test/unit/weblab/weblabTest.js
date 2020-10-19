import sinon from 'sinon';
import {expect} from '../../util/reconfiguredChai';
import WebLab from '@cdo/apps/weblab/WebLab';
import {TestResults} from '@cdo/apps/constants';
import project from '@cdo/apps/code-studio/initApp/project';
import {onSubmitComplete} from '@cdo/apps/submitHelper';

describe('Web Lab', () => {
  let reportStub, weblab;
  describe('onFinish', () => {
    beforeEach(() => {
      weblab = new WebLab();
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
      weblab = new WebLab();
      sinon.stub(project, 'autosave').callsArg(0);
      reportStub = sinon.stub();
      weblab.studioApp_ = {report: reportStub};
      weblab.level = {id: 123};
    });

    afterEach(() => {
      weblab = new WebLab();
      project.autosave.restore();
    });

    it('calls report with success conditions if validated is true', () => {
      weblab.reportResult(true, true);
      expect(reportStub).to.have.been.calledWith({
        ...defaultValues,
        ...{
          result: true,
          testResult: TestResults.FREE_PLAY
        }
      });
    });

    it('calls report with failure conditions if validated is false', () => {
      const feedbackStub = sinon.stub();
      weblab.studioApp_.displayFeedback = feedbackStub;
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
