/**
 * A set of tests for blocks in the UI controls section of the toolbox
 */

var testUtils = require('../../util/testUtils');
var TestResults = require('@cdo/apps/constants').TestResults;
var _ = require('lodash');

module.exports = {
  app: "applab",
  skinId: "applab",
  levelFile: "levels",
  levelId: "ec_simple",
  tests: [
    // These exercise all of the blocks in UI controls (other than get/setText).
    // It does not validate that they behave correctly, just that we don't end
    // up with any errors
    {
      description: "UI controls",
      editCode: true,
      xml:
          'button("id1", "text");\n' +
          'onEvent("id1", "click", function(event) {\n' +
          '  \n' +
          '});\n' +
          'textInput("id2", "text");\n' +
          'textLabel("id3", "text");\n' +
          'dropdown("id4", "option1", "etc");\n' +
          'checkbox("id5", false);\n' +
          'radioButton("id6", false, "group");\n' +
          'getChecked("id5")\n' +
          'setChecked("id5", true);\n' +
          'image("id7", "https://code.org/images/logo.png");\n' +
          'getImageURL("id7");\n' +
          'setImageURL("id7", "https://code.org/images/logo.png");\n' +
          'playSound("https://studio.code.org/blockly/media/skins/studio/1_goal.mp3");\n' +
          'setPosition("id7", 0, 0, 100, 100);\n' +
          'setSize("id7", 100, 100);\n' +
          'showElement("id7");\n' +
          'hideElement("id7");\n' +
          'deleteElement("id7");\n' +
          'setPosition("id1", 0, 0, 100, 100);\n' +
          'setSize("id1", 100, 100);\n' +
          'write("text")\n;' +
          'setScreen("screen1");' +
          'getXPosition("id1");\n' +
          'getYPosition("id1");\n',

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
      },
    },
    {
      description: "getText and setText on text labels.",
      editCode: true,
      xml:
          "textLabel('idTxt1', '');" +
          "textLabel('idTxt2', '');" +
          "setText('idTxt1', 'test-value');" +
          "setText('idTxt2', getText('idTxt1'));",
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          assert(document.getElementById('idTxt2').textContent === 'test-value');
          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },

    {
      description: "button",
      editCode: true,
      xml: "button('my_button_id', 'my_button_text');",
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          var button = document.getElementById('my_button_id');
          assert(button);
          assert.equal(button.textContent, 'my_button_text');
          assert.equal(button.parentNode.id, 'screen1');

          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },

    {
      description: "setPosition",
      editCode: true,
      xml: "" +
        "button('id', 'my_button_text');" +
        "setPosition('id', 10, 20, 30, 40);",
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          var button = document.getElementById('id');
          assert(button);
          assert.equal(button.style.left, '10px');
          assert.equal(button.style.top, '20px');
          assert.equal(button.style.width, '30px');
          assert.equal(button.style.height, '40px');

          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "testDuplicateNamesWarning",
      editCode: true,
      xml: "" +
        "button('button1', 'Button 1 text');" +
        "button('button1', 'zOMG duplicate');",
      runBeforeClick: function (assert) {
        testUtils.runOnAppTick(Applab, 2, function () {
          var debugOutput = document.getElementById('debug-output');
          assert.equal(debugOutput.textContent, "WARNING: Line: 1: button() id parameter refers to an id (button1) which already exists.");
          Applab.onPuzzleComplete(); 
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "testIllegalNameError",
      editCode: true,
      xml: "" +
        "button('runButton', 'Bad name for a button');",
      runBeforeClick: function (assert) {
        testUtils.runOnAppTick(Applab, 2, function () {
          var debugOutput = document.getElementById('debug-output');
          assert.equal(debugOutput.textContent, "ERROR: Line: 1: Error: button() id parameter refers to an id " +
              "(runButton) which is already in use outside of Applab. Choose a different id.");
          assert(!$('#divApplab #runButton')[0], 'No button named runButton should appear in applab');
          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: false,
        testResult: TestResults.RUNTIME_ERROR_FAIL
      },
    },
    {
      description: "setSize",
      editCode: true,
      xml: "" +
        "button('id', 'my_button_text');" +
        "setSize('id', 50, 150);",
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          var button = document.getElementById('id');
          assert(button);
          assert.equal(button.style.width, '50px');
          assert.equal(button.style.height, '150px');

          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
  ]
};
