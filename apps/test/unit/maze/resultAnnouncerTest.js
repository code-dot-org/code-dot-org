import {ResultType, TestResults} from '@cdo/apps/constants';
import {describeResult} from '@cdo/apps/maze/resultAnnouncer';

describe('resultAnnouncer.describeResult', function () {
  it('announces success when the goal is reached', function () {
    const text = describeResult({
      result: ResultType.SUCCESS,
      testResults: TestResults.ALL_PASS,
    });
    expect(text).to.equal('Success. Character reached the goal.');
  });

  it('appends an app-specific message on an imperfect pass', function () {
    const text = describeResult({
      result: ResultType.SUCCESS,
      testResults: TestResults.APP_SPECIFIC_IMPERFECT_PASS,
      message: 'You used too many blocks.',
    });
    expect(text).to.equal(
      'Success. Character reached the goal. You used too many blocks.'
    );
  });

  it('ignores an imperfect message when no message is supplied', function () {
    const text = describeResult({
      result: ResultType.SUCCESS,
      testResults: TestResults.APP_SPECIFIC_IMPERFECT_PASS,
    });
    expect(text).to.equal('Success. Character reached the goal.');
  });

  it('prefers an app-specific message over the coarse failure text', function () {
    const text = describeResult({
      result: ResultType.ERROR,
      testResults: TestResults.APP_SPECIFIC_FAIL,
      message: 'You did not collect every gem.',
    });
    expect(text).to.equal('You did not collect every gem.');
  });

  it('describes a timeout', function () {
    const text = describeResult({
      result: ResultType.TIMEOUT,
      testResults: TestResults.GENERIC_FAIL,
    });
    expect(text).to.equal('Timeout. Goal not reached.');
  });

  it('describes an error as hitting a wall', function () {
    const text = describeResult({
      result: ResultType.ERROR,
      testResults: TestResults.GENERIC_FAIL,
    });
    expect(text).to.equal('Bonk, character hit a wall.');
  });

  it('describes a plain failure as not reaching the goal', function () {
    const text = describeResult({
      result: ResultType.FAILURE,
      testResults: TestResults.LEVEL_INCOMPLETE_FAIL,
    });
    expect(text).to.equal('End. Goal not reached.');
  });
});
