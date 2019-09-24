import {gamelabLevelDefinition} from '../../gamelabLevelDefinition';
import {testAsyncProgramGameLab} from '../../util/levelTestHelpers';

module.exports = {
  app: 'gamelab',
  skinId: 'gamelab',
  levelDefinition: gamelabLevelDefinition,
  tests: [
    testAsyncProgramGameLab(
      'setup works',
      `
        function setup() {
          console.log('setup');
        }
        function draw() {
          console.log('draw');
        }
      `,
      function isProgramDone() {
        var debugOutput = document.getElementById('debug-output');
        return debugOutput.textContent.includes('draw');
      },
      function validateResult(assert) {
        var debugOutput = document.getElementById('debug-output');
        assert.include(debugOutput.textContent, 'setup');
      }
    )
  ]
};
