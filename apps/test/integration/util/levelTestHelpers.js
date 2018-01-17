import {TestResults} from '@cdo/apps/constants';
import tickWrapper from './tickWrapper';
/* global Gamelab */

/**
 * @param {!string} testName
 * @param {!string} program - Source code for the program to run during the
 *   level test.
 * @param {!function} doneCondition - A predicate used to check whether the
 *   program is done running.
 * @param {!function} validator - A set of assertions to run after the program
 *   is complete.
 * @returns {object} a level test definition.
 */
export function testAsyncProgramGameLab(testName, program, doneCondition, validator) {
  return {
    description: testName,
    editCode: true,
    xml: program,
    runBeforeClick: function (assert) {
      // add a completion on timeout since this is a freeplay level
      tickWrapper
        .tickAppUntil(Gamelab, doneCondition.bind(null, assert))
        .then(() => Gamelab.onPuzzleComplete());
    },
    customValidator: function (assert) {
      validator(assert);
      return true;
    },
    expected: {
      result: true,
      testResult: TestResults.FREE_PLAY
    }
  };
}
