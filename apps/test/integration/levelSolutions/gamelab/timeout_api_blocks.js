import tickWrapper from '../../util/tickWrapper';
import {TestResults} from '@cdo/apps/constants';
import {gamelabLevelDefinition} from '../../gamelabLevelDefinition';
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
function testAsyncProgram(testName, program, doneCondition, validator) {
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

module.exports = {
  app: "gamelab",
  skinId: "gamelab",
  levelDefinition: gamelabLevelDefinition,
  tests: [
    // These exercise the timeout API blocks
    testAsyncProgram(
      'setTimeout',
      `
        setTimeout(function() {
          console.log('done');
        }, 5);
        
        var key = setTimeout(function() {
          console.log('do not expect this');
        }, 4);
        clearTimeout(key);
      `,
      function isProgramDone() {
        const debugOutput = document.getElementById('debug-output').textContent;
        return debugOutput.includes('done');
      },
      function validateResult(assert) {
        const debugOutput = document.getElementById('debug-output').textContent;
        assert.equal(debugOutput, 'done');
      }
    ),

    testAsyncProgram(
      'setInterval',
      `
        var i = 0;
        setInterval(function() {
          console.log('interval ' + i);
          i++;
        }, 5);
        
        var key = setInterval(function() {
          console.log('do not expect this');
        }, 4);
        clearInterval(key);
      `,
      function isProgramDone() {
        const debugOutput = document.getElementById('debug-output').textContent;
        return debugOutput.split('\n').length >= 3;
      },
      function validateResult(assert) {
        const debugOutput = document.getElementById('debug-output').textContent;
        assert.include(debugOutput, 'interval 0');
        assert.include(debugOutput, 'interval 1');
        assert.include(debugOutput, 'interval 2');
        assert.notInclude(debugOutput, 'do not expect this');
      }
    ),

    testAsyncProgram(
      'timedLoop',
      `
        var i = 0;
        var key = timedLoop(5, function() {
          console.log('timedLoop ' + i);
          i++;
        });
        
        var key = timedLoop(4, function() {
          console.log('do not expect this');
        });
        stopTimedLoop(key);
      `,
      function isProgramDone() {
        const debugOutput = document.getElementById('debug-output').textContent;
        return debugOutput.split('\n').length >= 3;
      },
      function validateResult(assert) {
        const debugOutput = document.getElementById('debug-output').textContent;
        assert.include(debugOutput, 'timedLoop 0');
        assert.include(debugOutput, 'timedLoop 1');
        assert.include(debugOutput, 'timedLoop 2');
        assert.notInclude(debugOutput, 'do not expect this');
      }
    ),
  ]
};
