import assert from 'assert';
import sinon from 'sinon';
import { submitSublevelResults } from '@cdo/apps/sites/studio/pages/levels/levelGroup';
import * as codeStudioLevels from '@cdo/apps/code-studio/levels/codeStudioLevels';
import { TestResults } from '@cdo/apps/constants';

describe('levelGroup', () => {
  describe('submitSublevelResults', () => {
    let originalAppOptions;
    before(() => {
      originalAppOptions = window.appOptions;
      window.appOptions = {
        dialog: {
          fallbackResponse: 'fallbackResponseHere',
          sublevelCallback: 'http://subLevelCallback/'
        }
      };

      const fakeLevelResponse = {
        response: -1,
        result: true,
        errorType: null,
        submitted: false,
        valid: false
      };

      codeStudioLevels.reset();
      codeStudioLevels.registerLevel(111, {
        levelId: 111,
        getResult: () => fakeLevelResponse,
        getAppName: () => 'maze',
        lockAnswers: () => {},
        getCurrentAnswerFeedback: () => {}
      });
      codeStudioLevels.registerLevel(123, {
        levelId: 123,
        getResult: () => fakeLevelResponse,
        getAppName: () => 'maze',
        lockAnswers: () => {},
        getCurrentAnswerFeedback: () => {}
      });

    });
    after(() => {
      codeStudioLevels.reset();
      window.appOptions = originalAppOptions;
    });

    let submittedReport;
    let sendReport;

    beforeEach(() => {
      submittedReport = null;
      sinon.stub(window.dashboard.reporting, 'sendReport', report => {
        submittedReport = report;
      });
    });

    afterEach(() => {
      window.dashboard.reporting.sendReport.restore();
    });

    it('calls completion if we dont call send report', () => {
      const completion = sinon.spy();
      const sendReport = window.dashboard.reporting.sendReport;

      // in the case where the sublevelIdChanged isnt in the set of sublevels,
      // we call the completion directly
      submitSublevelResults(completion, 12);
      assert.equal(completion.callCount, 1);
      assert.equal(sendReport.callCount, 0);
    });

    it('does not call completion if ', () => {
      const completion = sinon.spy();

      submitSublevelResults(completion, 12);
      assert(completion.calledOnce);
    });

    it('calls sendReport for the provided sublevel', () => {
      const completion = sinon.spy();
      const sendReport = window.dashboard.reporting.sendReport;

      submitSublevelResults(completion, 123);

      // In this case, a non-stubbed sendReport would call completion, but we
      // dont call it ourselves
      assert.equal(completion.callCount, 0);
      assert.equal(sendReport.callCount, 1);
      const expectedReport = {
        program: "-1",
        fallbackResponse: 'fallbackResponseHere',
        callback: 'http://subLevelCallback/' + '123',
        app: 'maze',
        allowMultipleSends: true,
        level: "123",
        result: true,
        testResult: TestResults.UNVALIDATED_SUBLEVEL,
        submitted: false
        // There's an onComplete function as well, but no easy way to validate
      };

      // Expected and submitted have the same keys, except for onComplete
      const expectedKeys = Object.keys(expectedReport).concat('onComplete');
      assert.deepEqual(expectedKeys.sort(), Object.keys(submittedReport).sort());

      // Also have the same values
      Object.keys(expectedReport).forEach(key => {
        assert.strictEqual(expectedReport[key], submittedReport[key], key);
      });
    });
  });
});
