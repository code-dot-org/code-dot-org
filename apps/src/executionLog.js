var TestResults = require('./constants').TestResults;
var utils = require('./utils');

/**
 * Get a testResult and message value based on an examination of the
 * executionLog against the level's logConditions
 *
 * @param {Object[]} logConditions an array of logCondition objects
 * @param {string[]} executionLog an array of function or statement names
 * @returns {!Object}
 */
module.exports.getResultsFromLog = function (logConditions, executionLog) {
  executionLog = executionLog || [];
  var results = {
    testResult: TestResults.ALL_PASS,
  };
  logConditions.forEach(function (condition, index) {
    var testResult = TestResults.LEVEL_INCOMPLETE_FAIL;
    var exact;

    /*
     * 'exact' or 'inexact' match will search a sequence. 'exact' requires that
     * no other entries appear within the pattern.
     *
     * @param {!Object} condition
     * @param {string} [condition.matchType] 'exact', 'inexact'
     * @param {number} [condition.minTimes] number of matches required
     * @param {number} [condition.maxTimes] maximum number of matches allowed
     * @param {string[]} [condition.entries] function or statement names
     * @param {string} [condition.message] message to display if condition fails
     */

    condition.minTimes = condition.minTimes || 0;
    condition.maxTimes = utils.valueOr(condition.maxTimes, Infinity);

    switch (condition.matchType) {
      case 'exact':
        exact = true;
        // Fall through
      case 'inexact':
        var entryIndex = 0, matchedSequences = 0;
        for (var i = 0; i < executionLog.length; i++) {
          if (executionLog[i] === condition.entries[entryIndex]) {
            entryIndex++;
            if (entryIndex >= condition.entries.length) {
              entryIndex = 0;
              matchedSequences++;
              if ((matchedSequences >= condition.minTimes &&
                  condition.maxTimes === Infinity) ||
                  matchedSequences > condition.maxTimes) {
                // Stop checking if we know we've succeeded for minTimes without
                // a maxTimes or we know we've failed for maxTimes
                break;
              }
            }
          } else if (exact) {
            // Start back at the beginning of the sequence if we didn't match
            entryIndex = 0;
          }
        }
        if (matchedSequences >= condition.minTimes &&
            matchedSequences <= condition.maxTimes) {
          testResult = TestResults.ALL_PASS;
        }
        break;
      default:
        testResult = TestResults.ALL_PASS;
        break;
    }
    // We want to remember the lowest test result value and message (100 is
    // ALL_PASS, all other errors are lower numbers)
    if (testResult < results.testResult) {
      results.testResult = testResult;
      results.message = condition.message;
    }
  });

  return results;
};
