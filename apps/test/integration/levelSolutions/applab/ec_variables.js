import {testApplabConsoleOutput} from '../../util/levelTestTypes';
var tickWrapper = require('../../util/tickWrapper');
import {TestResults} from '@cdo/apps/constants';

module.exports = {
  app: "applab",
  skinId: "applab",
  levelFile: "levels",
  levelId: "ec_simple",
  tests: [
    {
      description: "str.substring",
      editCode: true,
      xml:
        'var str = "Hello World";\n' +
        'textInput("id", str.substring(1, 5));\n',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function () {
          assert.equal(document.getElementById('id').value, 'ello');
          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
    {
      description: "str.indexOf",
      editCode: true,
      xml:
        'var str = "Hello World";\n' +
        'textInput("id", str.indexOf("World"));\n',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function () {
          assert.equal(document.getElementById('id').value, '6');
          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
    {
      description: "str.includes",
      editCode: true,
      xml:
        'var str = "Hello World";\n' +
        'textInput("id1", str.includes("World"));\n' +
        'textInput("id2", str.includes("NOPE"));\n',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function () {
          assert.equal(document.getElementById('id1').value, 'true');
          assert.equal(document.getElementById('id2').value, 'false');
          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
    {
      description: "str.length",
      editCode: true,
      xml:
        'var str = "Hello World";\n' +
        'textInput("id", str.length);\n',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function () {
          assert.equal(document.getElementById('id').value, '11');
          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
    {
      description: "str.toUpperCase/str.toLowerCase",
      editCode: true,
      xml:
        'var str = "Hello World";\n' +
        'textInput("id1", str.toUpperCase());\n' +
        'textInput("id2", str.toLowerCase());\n',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function () {
          assert.equal(document.getElementById('id1').value, 'HELLO WORLD');
          assert.equal(document.getElementById('id2').value, 'hello world');
          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    // This regression test covers an error in the interpreter's sort()
    // implementation that only surfaces in a few particular situations.
    // See https://github.com/code-dot-org/JS-Interpreter/pull/23 for details.
    testApplabConsoleOutput({
      testName: 'Array.prototype.sort',
      source: 'console.log([5, 4, 4, 1].sort());',
      expect: '[1,4,4,5]'
    })
  ]
};
