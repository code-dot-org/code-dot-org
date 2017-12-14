import tickWrapper from '../../util/tickWrapper';
import {TestResults} from '@cdo/apps/constants';
import {gamelabLevelDefinition} from '../../gamelabLevelDefinition';
/* global Gamelab */

module.exports = {
  app: "gamelab",
  skinId: "gamelab",
  levelDefinition: gamelabLevelDefinition,
  tests: [
    {
      description: "Not-overlapping sprites do not collide",
      editCode: true,
      xml:
        'var sprite1 = createSprite(0, 0);\n' +
        'var sprite2 = createSprite(300, 300);\n' +
        'if(sprite1.collide(sprite2)){\n' +
        'console.log("collided");\n' +
        '}\n' +
        'console.log("done");\n',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.tickAppUntil(Gamelab, function () {
          var debugOutput = document.getElementById('debug-output');
          return debugOutput.textContent.includes('done');
        }).then(function () {
          Gamelab.onPuzzleComplete();
        });
      },
      customValidator: function (assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.notInclude(debugOutput.textContent, 'collided');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
    {
      description: 'Overlapping Sprites collide',
      editCode: true,
      xml:
        'var sprite1 = createSprite(200, 200);\n' +
        'var sprite2 = createSprite(200, 200);\n' +
        'if(sprite1.collide(sprite2)){\n' +
        'console.log("collided");\n' +
        '}\n' +
        'console.log("done");\n',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.tickAppUntil(Gamelab, function () {
          var debugOutput = document.getElementById('debug-output');
          return debugOutput.textContent.includes('done');
        }).then(function () {
          Gamelab.onPuzzleComplete();
        });
      },
      customValidator: function (assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.include(debugOutput.textContent, 'collided');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
  ]
};
