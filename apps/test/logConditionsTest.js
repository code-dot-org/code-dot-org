var testUtils = require('./util/testUtils');
var assert = testUtils.assert;
var TestResults = require('@cdo/apps/constants.js').TestResults;

var executionLog = require('@cdo/apps/executionLog');

describe('logConditions: getResultsFromLog', function () {
  it ('returns ALL_PASS with empty logConditions and executionLog', function () {
    var results = executionLog.getResultsFromLog([], []);

    assert.equal(results.testResult, TestResults.ALL_PASS);
  });

  it ('returns ALL_PASS with empty logConditions', function () {
    var results = executionLog.getResultsFromLog([], ['function1', 'function2']);

    assert.equal(results.testResult, TestResults.ALL_PASS);
  });

  it ('returns ALL_PASS with simple one-item logCondition', function () {
    var results = executionLog.getResultsFromLog(
        [{ entries: ['function1'], matchType: 'exact', minTimes: 1, message: 'test-1' }],
        ['function1', 'function2']);

    assert.equal(results.testResult, TestResults.ALL_PASS);
  });

  it ('returns failure and message with simple one-item logCondition', function () {
    var results = executionLog.getResultsFromLog(
        [{ entries: ['function3'], matchType: 'exact', minTimes: 1, message: 'test-2' }],
        ['function1', 'function2']);

    assert.deepEqual(results, { testResult: TestResults.LEVEL_INCOMPLETE_FAIL, message: 'test-2' });
  });

  it ('returns ALL_PASS with multi-item logConditions', function () {
    var results = executionLog.getResultsFromLog(
        [
          { entries: ['function1'], matchType: 'exact', minTimes: 1, message: 'test-3' },
          { entries: ['function2'], matchType: 'exact', minTimes: 1, message: 'test-4' },
        ],
        ['function1', 'function2']);

    assert.equal(results.testResult, TestResults.ALL_PASS);
  });

  it ('returns failure and message with mixed logConditions', function () {
    var results = executionLog.getResultsFromLog(
        [
          { entries: ['function1'], matchType: 'exact', minTimes: 1, message: 'test-5' },
          { entries: ['function3'], matchType: 'exact', minTimes: 1, message: 'test-6' },
        ],
        ['function1', 'function2']);

    assert.deepEqual(results, { testResult: TestResults.LEVEL_INCOMPLETE_FAIL, message: 'test-6' });
  });

  it ('returns ALL_PASS with two item exact logCondition', function () {
    var results = executionLog.getResultsFromLog(
        [
          { entries: ['function1', 'function2'], matchType: 'exact', minTimes: 1, message: 'test-7' },
        ],
        ['function1', 'function2']);

    assert.equal(results.testResult, TestResults.ALL_PASS);
  });

  it ('returns failure and message with insufficient minTimes logCondition', function () {
    var results = executionLog.getResultsFromLog(
        [
          { entries: ['function1', 'function2'], matchType: 'exact', minTimes: 2, message: 'test-8' },
        ],
        ['function1', 'function2']);

    assert.deepEqual(results, { testResult: TestResults.LEVEL_INCOMPLETE_FAIL, message: 'test-8' });
  });

  it ('returns ALL_PASS with two item inexact logCondition', function () {
    var results = executionLog.getResultsFromLog(
        [
          { entries: ['function1', 'function2'], matchType: 'inexact', minTimes: 1, message: 'test-9' },
        ],
        ['function1', 'other', 'function2']);

    assert.equal(results.testResult, TestResults.ALL_PASS);
  });

  it ('returns failure and message with insufficient minTimes inexact logCondition', function () {
    var results = executionLog.getResultsFromLog(
        [
          { entries: ['function1', 'function2'], matchType: 'inexact', minTimes: 2, message: 'test-10' },
        ],
        ['function1', 'other', 'function2', 'function2', 'function1']);

    assert.deepEqual(results, { testResult: TestResults.LEVEL_INCOMPLETE_FAIL, message: 'test-10' });
  });

  it ('returns ALL_PASS with two item inexact logCondition not exceeding maxTimes', function () {
    var results = executionLog.getResultsFromLog(
        [
          { entries: ['function1', 'function2'], matchType: 'inexact', maxTimes: 2, message: 'test-11' },
        ],
        ['function1', 'other', 'function2', 'function1', 'function2']);

    assert.equal(results.testResult, TestResults.ALL_PASS);
  });

  it ('returns failure and message with two item inexact logCondition exceeding maxTimes', function () {
    var results = executionLog.getResultsFromLog(
        [
          { entries: ['function1', 'function2'], matchType: 'inexact', maxTimes: 2, message: 'test-12' },
        ],
        ['function1', 'other', 'function2', 'function1', 'function2', 'other', 'function1', 'function2']);

    assert.deepEqual(results, { testResult: TestResults.LEVEL_INCOMPLETE_FAIL, message: 'test-12' });
  });

});
