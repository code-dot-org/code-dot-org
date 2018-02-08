import {gamelabLevelDefinition} from '../../gamelabLevelDefinition';
import {testAsyncProgramGameLab} from '../../util/levelTestHelpers';

module.exports = {
  app: "gamelab",
  skinId: "gamelab",
  levelDefinition: gamelabLevelDefinition,
  tests: [
    // These exercise the timeout API blocks
    testAsyncProgramGameLab(
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

    testAsyncProgramGameLab(
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

    testAsyncProgramGameLab(
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
