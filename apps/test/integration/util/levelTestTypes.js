import tickWrapper from './tickWrapper';
import {TestResults} from '@cdo/apps/constants';

/**
 * Generates a level test definition for an Applab level where all we want to
 * do is run some source code and check that it generates the expected output
 * in the debug console.
 * @param {string} testName - for the mocha test runner
 * @param {string} source - JavaScript to run within Applab
 * @param {string} expect - Output to expect in the debug console after the
 *   source code has run.
 * @param {number} [ticks=2] If the source includes a setTimeout or async
 *   operation, or needs to run longer for some other reason, this option
 *   lets you introduce an artificial delay between the run button being
 *   pressed and the debug console output being checked.
 * @returns {object} a level test definition, matching the format given
 *   at the top of levelTests.js
 */
export function testApplabConsoleOutput({testName, source, expect, ticks=2}) {
  return {
    description: testName,
    editCode: true,
    xml: source,
    runBeforeClick: () => {
      tickWrapper.runOnAppTick(Applab, ticks, Applab.onPuzzleComplete);
    },
    customValidator: (assert) => {
      const debugOutput = document.getElementById('debug-output');
      assert.equal(debugOutput.textContent, expect);
      return true;
    },
    expected: {
      result: true,
      testResult: TestResults.FREE_PLAY
    }
  };
}
