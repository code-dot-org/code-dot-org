import tickWrapper from './tickWrapper';
import {TestResults} from '@cdo/apps/constants';

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
