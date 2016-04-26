var testUtils = require('../../util/testUtils');
var TestResults = require('@cdo/apps/constants').TestResults;
var dropletUtils = require('@cdo/apps/dropletUtils');
var _ = require('@cdo/apps/lodash');
var sinon = require('sinon');

module.exports = {
  app: "applab",
  skinId: "applab",
  levelFile: "levels",
  levelId: "ec_simple",
  tests: [
    // These exercise all of the blocks in Turtle category
    // It does not validate that they behave correctly, just that we don't end
    // up with any errors
    {
      description: "Math blocks",
      editCode: true,
      xml:
        'var a = Math.random();\n' +
        'var b = randomNumber(1, 2);\n' +
        'var c = Math.round(2.3);\n' +
        'var d = Math.abs(-3);\n' +
        'var e = Math.max(1, 2, 3);\n' +
        'var f = Math.min(4, 5, 6);\n',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          Applab.onPuzzleComplete();
        });
      },
      customValidator: function (assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, "");
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: "Math.random returns values in range [0, 1)",
      editCode: true,
      xml:
        'for (var i = 0; i < 100; i++) {\n' +
        '  var val = Math.random();\n' +
        '  if (val < 0 || val >= 1) throw new Error("fail");\n' +
        '}\n',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          Applab.onPuzzleComplete();
        });
      },
      customValidator: function (assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, "");
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
    {
      description: 'Deprecated randomNumber still works',
      editCode: true,
      xml:
        'var MAX = 4;\n' +
        'for (var i = 0; i < 100; i++) {\n' +
        '  var val = randomNumber(MAX);\n' +
        '  if (val < 0 || val > MAX) throw new Error("fail");\n' +
        '}\n',
      runBeforeClick: function (assert) {
        var randomNumberSpy = sinon.spy(dropletUtils, 'randomNumber');
        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          assert.strictEqual(randomNumberSpy.callCount, 100);
          Applab.onPuzzleComplete();
        });
      },
      customValidator: function (assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, "");
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'randomNumber shows up in autocomplete',
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        $("#show-code-header").click();
        assert.equal($(".ace_autocomplete").is(":visible"), false,
          'no autocomplete to start');

        testUtils.typeAceText('randomNumb');
        assert.equal($(".ace_autocomplete").is(":visible"), true,
          'we have autocomplete options after typing');
        assert.equal(/randomNumber/.test($(".ace_autocomplete").text()), true,
          'our autocomplete options contain randomNumber');

        // clear contents before run
        testUtils.setAceText('');

        testUtils.runOnAppTick(Applab, 2, function () {
          Applab.onPuzzleComplete();
        });
      },
      customValidator: function (assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, "");
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'randomNumber tooltip shows up with 2 params',
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        $("#show-code-header").click();
        assert.equal($(".tooltipster-content").text(), '', 'No tooltip to start');
        testUtils.typeAceText('randomNumber(');

        assert.equal(/randomNumber\(min, max\)/.test($(".tooltipster-content").text()),
          true, 'get tooltip');

        // clear contents before run
        testUtils.setAceText('');

        testUtils.runOnAppTick(Applab, 2, function () {
          Applab.onPuzzleComplete();
        });
      },
      customValidator: function (assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, "");
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'Math.min tooltip shows up',
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        $("#show-code-header").click();
        assert.equal($(".tooltipster-content").text(), '', 'No tooltip to start');
        testUtils.typeAceText('Math.min(');

        assert.equal(/Math.min\(n1, n2, ..., nX\)/.test($(".tooltipster-content").text()),
          true, 'tooltip has full signature');

        assert.equal(/See examples/.test($(".tooltipster-content").text()),
          true, 'tooltip has examples link');

        // clear contents before run
        testUtils.setAceText('');

        testUtils.runOnAppTick(Applab, 2, function () {
          Applab.onPuzzleComplete();
        });
      },
      customValidator: function (assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, "");
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    }
  ]
};
