import $ from 'jquery';
var testUtils = require('../../../util/testUtils');
var tickWrapper = require('../../util/tickWrapper');
import {TestResults} from '@cdo/apps/constants';
import {globalFunctions} from '@cdo/apps/dropletUtils';
import sinon from 'sinon';

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
        tickWrapper.runOnAppTick(Applab, 2, function () {
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
        tickWrapper.runOnAppTick(Applab, 2, function () {
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
        var randomNumberSpy = sinon.spy(globalFunctions, 'randomNumber');
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function () {
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
      description: 'randomNumber and Math.random show up in autocomplete by matching ran',
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        $("#show-code-header").click();
        assert.equal($(".ace_autocomplete").is(":visible"), false,
          'no autocomplete to start');

        testUtils.typeAceText('ran');
        assert.equal($(".ace_autocomplete").is(":visible"), true,
          'we have autocomplete options after typing');
        assert.equal(/randomNumber/.test($(".ace_autocomplete").text()), true,
          'our autocomplete options contain randomNumber');
        assert.equal(/Math.random/.test($(".ace_autocomplete").text()), true,
          'our autocomplete options contain Math.random');
        assert.equal(/createCanvas/.test($(".ace_autocomplete").text()), false,
          'our autocomplete options do not contain createCanvas');

        // clear contents before run
        testUtils.setAceText('');

        tickWrapper.runOnAppTick(Applab, 2, function () {
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
      description: 'randomNumber shows up in autocomplete by matching Numb',
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        $("#show-code-header").click();
        assert.equal($(".ace_autocomplete").is(":visible"), false,
          'no autocomplete to start');

        testUtils.typeAceText('Numb');
        assert.equal($(".ace_autocomplete").is(":visible"), true,
          'we have autocomplete options after typing');
        assert.equal(/randomNumber/.test($(".ace_autocomplete").text()), true,
          'our autocomplete options contain randomNumber');

        // clear contents before run
        testUtils.setAceText('');

        tickWrapper.runOnAppTick(Applab, 2, function () {
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
      description: 'randomNumber does not show up in autocomplete when typing omNumb',
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        $("#show-code-header").click();
        assert.equal($(".ace_autocomplete").is(":visible"), false,
          'no autocomplete to start');

        testUtils.typeAceText('omNumb');

        assert.equal($(".ace_autocomplete").is(":visible"), false,
          'no autocomplete after typing');

        // clear contents before run
        testUtils.setAceText('');

        tickWrapper.runOnAppTick(Applab, 2, function () {
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

        tickWrapper.runOnAppTick(Applab, 2, function () {
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

        tickWrapper.runOnAppTick(Applab, 2, function () {
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
      description: 'Math.min and Math.max shows up in autocomplete by matching math',
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        $("#show-code-header").click();
        assert.equal($(".ace_autocomplete").is(":visible"), false,
          'no autocomplete to start');

        testUtils.typeAceText('math');
        assert.equal($(".ace_autocomplete").is(":visible"), true,
          'we have autocomplete options after typing');
        assert.equal(/Math.min/.test($(".ace_autocomplete").text()), true,
          'our autocomplete options contain Math.min');
        assert.equal(/Math.max/.test($(".ace_autocomplete").text()), true,
          'our autocomplete options contain Math.max');

        // clear contents before run
        testUtils.setAceText('');

        tickWrapper.runOnAppTick(Applab, 2, function () {
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
