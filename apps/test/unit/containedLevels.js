import assert from 'assert';
import sinon from 'sinon';
import * as codeStudioLevels from '@cdo/apps/code-studio/levels/codeStudioLevels';
import { getContainedLevelResultInfo } from '@cdo/apps/containedLevels';
import { TestResults } from '@cdo/apps/constants';

describe('getContainedLevelResultInfo', () => {
  const containedLevelResult = {
    id: 6669,
    app: 'multi',
    callback: 'http://localhost-studio.code.org:3000/milestone/2023/16504/6669',
    result: {
      response: 1,
      result: false,
      errorType: null,
      submitted: false,
      valid: true
    },
    feedback: 'This is feedback'
  };

  before(() => {
    sinon.stub(codeStudioLevels, 'getContainedLevelResult')
        .returns(containedLevelResult);
  });

  after(() => {
    codeStudioLevels.getContainedLevelResult.restore();
  });

  it('returns the right info', () => {
      const info = getContainedLevelResultInfo();
      assert.deepEqual(info, {
        app: 'multi',
        level: 6669,
        callback: 'http://localhost-studio.code.org:3000/milestone/2023/16504/6669',
        result: true,
        testResult: TestResults.CONTAINED_LEVEL_RESULT,
        program: 1,
        feedback: 'This is feedback',
        submitted: false
      });
  });
});
