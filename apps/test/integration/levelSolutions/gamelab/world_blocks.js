import {TestResults} from '@cdo/apps/constants';

import {gamelabLevelDefinition} from '../../gamelabLevelDefinition';
import {testAsyncProgramGameLab} from '../../util/levelTestHelpers';
import tickWrapper from '../../util/tickWrapper';

module.exports = {
  app: 'gamelab',
  skinId: 'gamelab',
  levelDefinition: gamelabLevelDefinition,
  tests: [
    // These exercise the blocks in World category
    // It does not validate that they behave correctly, just that we don't end
    // up with any errors
    {
      description: 'World blocks',
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
        tickWrapper
          .tickAppUntil(Gamelab, function () {
            var debugOutput = document.getElementById('debug-output');
            return debugOutput.textContent !== '';
          })
          .then(function () {
            Gamelab.onPuzzleComplete();
          });
      },
      customValidator: function (assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, '"done"');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY,
      },
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
        tickWrapper
          .tickAppUntil(Gamelab, function () {
            var debugOutput = document.getElementById('debug-output');
            return debugOutput.textContent !== '';
          })
          .then(function () {
            Gamelab.onPuzzleComplete();
          });
      },
      customValidator: function (assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, '"done"');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY,
      },
    },
    // Check that createEdgeSprites makes the edges group and the
    // edge sprites available in the global namespace
    {
      description: 'Edge sprites',
      editCode: true,
      xml:
        'createEdgeSprites();\n' +
        'if (!edges) console.log("Fail: edges was falsy");\n' +
        'if (!leftEdge) console.log("Fail: edges was falsy");\n' +
        'if (!rightEdge) console.log("Fail: edges was falsy");\n' +
        'if (!topEdge) console.log("Fail: edges was falsy");\n' +
        'if (!bottomEdge) console.log("Fail: edges was falsy");\n' +
        'console.log("done")',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper
          .tickAppUntil(Gamelab, function () {
            var debugOutput = document.getElementById('debug-output');
            return debugOutput.textContent !== '';
          })
          .then(function () {
            Gamelab.onPuzzleComplete();
          });
      },
      customValidator: function (assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, '"done"');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY,
      },
    },
    testAsyncProgramGameLab(
      "showMobileControls() with default params doesn't show on desktop",
      `
        showMobileControls(true, true, true, true);
        console.log("done");
      `,
      function isProgramDone(assert) {
        var debugOutput = document.getElementById('debug-output').textContent;
        const done = debugOutput.includes('done');
        if (done) {
          assert.equal($('#studio-space-button').is(':visible'), false);
          assert.equal($('#studio-dpad-button').is(':visible'), false);
          assert.equal($('#studio-dpad-rim').is(':visible'), false);
          assert.equal($('#studio-dpad-cone').is(':visible'), false);
        }
        return done;
      },
      function validateResult(assert) {
        assert.equal($('#studio-space-button').is(':visible'), false);
        assert.equal($('#studio-dpad-button').is(':visible'), false);
        assert.equal($('#studio-dpad-rim').is(':visible'), false);
        assert.equal($('#studio-dpad-cone').is(':visible'), false);
      }
    ),
    testAsyncProgramGameLab(
      'showMobileControls() with mobileOnly false shows d-pad and space button while running',
      `
        showMobileControls(true, true, true, false);
        console.log("done");
      `,
      function isProgramDone(assert) {
        var debugOutput = document.getElementById('debug-output').textContent;
        const done = debugOutput.includes('"done"');
        if (done) {
          assert.equal($('#studio-space-button').is(':visible'), true);
          assert.equal($('#studio-dpad-button').is(':visible'), true);
          assert.equal($('#studio-dpad-rim').is(':visible'), true);
          assert.equal($('#studio-dpad-cone').is(':visible'), true);
        }
        return done;
      },
      function validateResult(assert) {
        assert.equal($('#studio-space-button').is(':visible'), false);
        assert.equal($('#studio-dpad-button').is(':visible'), false);
        assert.equal($('#studio-dpad-rim').is(':visible'), false);
        assert.equal($('#studio-dpad-cone').is(':visible'), false);
      }
    ),
    testAsyncProgramGameLab(
      'showMobileControls() can hide space button while running',
      `
        showMobileControls(false, true, true, false);
        console.log("done");
      `,
      function isProgramDone(assert) {
        var debugOutput = document.getElementById('debug-output').textContent;
        const done = debugOutput.includes('"done"');
        if (done) {
          assert.equal($('#studio-space-button').is(':visible'), false);
          assert.equal($('#studio-dpad-button').is(':visible'), true);
          assert.equal($('#studio-dpad-rim').is(':visible'), true);
          assert.equal($('#studio-dpad-cone').is(':visible'), true);
        }
        return done;
      },
      function validateResult(assert) {
        assert.equal($('#studio-space-button').is(':visible'), false);
        assert.equal($('#studio-dpad-button').is(':visible'), false);
        assert.equal($('#studio-dpad-rim').is(':visible'), false);
        assert.equal($('#studio-dpad-cone').is(':visible'), false);
      }
    ),
    testAsyncProgramGameLab(
      'showMobileControls() can hide d-pad while running',
      `
        showMobileControls(true, false, true, false);
        console.log("done");
      `,
      function isProgramDone(assert) {
        var debugOutput = document.getElementById('debug-output').textContent;
        const done = debugOutput.includes('done');
        if (done) {
          assert.equal($('#studio-space-button').is(':visible'), true);
          assert.equal($('#studio-dpad-button').is(':visible'), false);
          assert.equal($('#studio-dpad-rim').is(':visible'), false);
          assert.equal($('#studio-dpad-cone').is(':visible'), false);
        }
        return done;
      },
      function validateResult(assert) {
        assert.equal($('#studio-space-button').is(':visible'), false);
        assert.equal($('#studio-dpad-button').is(':visible'), false);
        assert.equal($('#studio-dpad-rim').is(':visible'), false);
        assert.equal($('#studio-dpad-cone').is(':visible'), false);
      }
    ),
  ],
};
