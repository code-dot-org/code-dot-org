import tickWrapper from '../../util/tickWrapper';
import {TestResults} from '@cdo/apps/constants';
import {gamelabLevelDefinition} from '../../gamelabLevelDefinition';
/* global Gamelab */

module.exports = {
  app: "gamelab",
  skinId: "gamelab",
  levelDefinition: gamelabLevelDefinition,
  tests: [
    // These exercise the blocks in World category
    // It does not validate that they behave correctly, just that we don't end
    // up with any errors
    {
      description: "World blocks",
      editCode: true,
      xml:
        'var a = World.allSprites;\n' +
        'var b = World.width;\n' +
        'var c = World.height;\n' +
        'var d = World.mouseX;\n' +
        'var e = World.mouseY;\n' +
        'var f = World.frameRate;\n' +
        'var g = World.frameCount;\n' +
        'var h = World.seconds;\n' +
        'console.log("done")',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.tickAppUntil(Gamelab, function () {
          var debugOutput = document.getElementById('debug-output');
          return debugOutput.textContent !== "";
        }).then(function () {
          Gamelab.onPuzzleComplete();
        });
      },
      customValidator: function (assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, "done");
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
    {
      description: 'Deprecated Game. still works',
      editCode: true,
      xml:
        'var a = Game.allSprites;\n' +
        'var b = Game.width;\n' +
        'var c = Game.height;\n' +
        'var d = Game.mouseX;\n' +
        'var e = Game.mouseY;\n' +
        'var f = Game.frameRate;\n' +
        'var g = Game.frameCount;\n' +
        'var h = Game.seconds;\n' +
        'console.log("done")',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.tickAppUntil(Gamelab, function () {
          var debugOutput = document.getElementById('debug-output');
          return debugOutput.textContent !== "";
        }).then(function () {
          Gamelab.onPuzzleComplete();
        });
      },
      customValidator: function (assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, "done");
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    }
  ]
};
