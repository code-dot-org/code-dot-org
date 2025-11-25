import {gamelabLevelDefinition} from '../../gamelabLevelDefinition';
import {testAsyncProgramGameLab} from '../../util/levelTestHelpers';

// Returns true once there is any output in the debug console
function isDebugOutputReady() {
  const debugOutput = document.getElementById('debug-output');
  return debugOutput.textContent !== '';
}

// Validates that the debug console equals exactly "done"
function validateDebugOutputDone(assert) {
  const debugOutput = document.getElementById('debug-output');
  assert.equal(debugOutput.textContent, '"done"');
}

module.exports = {
  app: 'gamelab',
  skinId: 'gamelab',
  levelDefinition: gamelabLevelDefinition,
  tests: [
    // These exercise the blocks in World category
    // It does not validate that they behave correctly, just that we don't end
    // up with any errors
    testAsyncProgramGameLab(
      'World blocks',
      `
        var a = World.allSprites;
        var b = World.width;
        var c = World.height;
        var d = World.mouseX;
        var e = World.mouseY;
        var f = World.frameRate;
        var g = World.frameCount;
        var h = World.seconds;
        console.log("done")
      `,
      isDebugOutputReady,
      validateDebugOutputDone
    ),
    testAsyncProgramGameLab(
      'Deprecated Game. still works',
      `
    var a = Game.allSprites;
    var b = Game.width;
    var c = Game.height;
    var d = Game.mouseX;
    var e = Game.mouseY;
    var f = Game.frameRate;
    var g = Game.frameCount;
    var h = Game.seconds;
    console.log("done");
  `,
      isDebugOutputReady,
      validateDebugOutputDone
    ),

    // Check that createEdgeSprites makes the edges group and the edge sprites available in the global namespace
    testAsyncProgramGameLab(
      'Edge sprites',
      `
    createEdgeSprites();
    if (!edges) console.log("Fail: edges was falsy");
    if (!leftEdge) console.log("Fail: leftEdge was falsy");
    if (!rightEdge) console.log("Fail: rightEdge was falsy");
    if (!topEdge) console.log("Fail: topEdge was falsy");
    if (!bottomEdge) console.log("Fail: bottomEdge was falsy");
    console.log("done");
  `,
      isDebugOutputReady,
      validateDebugOutputDone
    ),

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
