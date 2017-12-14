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
    {
      description: "Not-overlapping sprites do not bounce",
      editCode: true,
      xml:
        'var sprite1 = createSprite(0, 0);\n' +
        'var sprite2 = createSprite(300, 300);\n' +
        'if(sprite1.bounce(sprite2)){\n' +
        'console.log("bounced");\n' +
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
        assert.notInclude(debugOutput.textContent, 'bounced');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
    {
      description: 'Overlapping Sprites bounce',
      editCode: true,
      xml:
        'var sprite1 = createSprite(200, 200);\n' +
        'var sprite2 = createSprite(200, 200);\n' +
        'if(sprite1.bounce(sprite2)){\n' +
        'console.log("bounced");\n' +
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
        assert.include(debugOutput.textContent, 'bounced');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
    {
      description: "Not-overlapping sprites do not bounce off",
      editCode: true,
      xml:
        'var sprite1 = createSprite(0, 0);\n' +
        'var sprite2 = createSprite(300, 300);\n' +
        'if(sprite1.bounceOff(sprite2)){\n' +
        'console.log("bounced off");\n' +
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
        assert.notInclude(debugOutput.textContent, 'bounced off');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
    {
      description: 'Overlapping Sprites bounce off',
      editCode: true,
      xml:
        'var sprite1 = createSprite(200, 200);\n' +
        'var sprite2 = createSprite(200, 200);\n' +
        'if(sprite1.bounceOff(sprite2)){\n' +
        'console.log("bounced off");\n' +
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
        assert.include(debugOutput.textContent, 'bounced off');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
    {
      description: "Not-overlapping sprites do not displace",
      editCode: true,
      xml:
        'var sprite1 = createSprite(0, 0);\n' +
        'var sprite2 = createSprite(300, 300);\n' +
        'if(sprite1.displace(sprite2)){\n' +
        'console.log("displaced");\n' +
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
        assert.notInclude(debugOutput.textContent, 'displaced');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
    {
      description: 'Overlapping Sprites displaced',
      editCode: true,
      xml:
        'var sprite1 = createSprite(200, 200);\n' +
        'var sprite2 = createSprite(200, 200);\n' +
        'if(sprite1.displace(sprite2)){\n' +
        'console.log("displaced");\n' +
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
        assert.include(debugOutput.textContent, 'displaced');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
    {
      description: "Not-overlapping sprites do not overlap",
      editCode: true,
      xml:
        'var sprite1 = createSprite(0, 0);\n' +
        'var sprite2 = createSprite(300, 300);\n' +
        'if(sprite1.overlap(sprite2)){\n' +
        'console.log("overlapped");\n' +
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
        assert.notInclude(debugOutput.textContent, 'overlapped');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
    {
      description: 'Overlapping Sprites overlap',
      editCode: true,
      xml:
        'var sprite1 = createSprite(200, 200);\n' +
        'var sprite2 = createSprite(200, 200);\n' +
        'if(sprite1.overlap(sprite2)){\n' +
        'console.log("overlapped");\n' +
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
        assert.include(debugOutput.textContent, 'overlapped');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
    {
      description: "Not-overlapping sprites are not touching",
      editCode: true,
      xml:
        'var sprite1 = createSprite(0, 0);\n' +
        'var sprite2 = createSprite(300, 300);\n' +
        'if(sprite1.isTouching(sprite2)){\n' +
        'console.log("touched");\n' +
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
        assert.notInclude(debugOutput.textContent, 'touched');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
    {
      description: 'Overlapping Sprites are touching',
      editCode: true,
      xml:
        'var sprite1 = createSprite(200, 200);\n' +
        'var sprite2 = createSprite(200, 200);\n' +
        'if(sprite1.isTouching(sprite2)){\n' +
        'console.log("touched");\n' +
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
        assert.include(debugOutput.textContent, 'touched');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
  ]
};
