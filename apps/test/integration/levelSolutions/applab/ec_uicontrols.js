/**
 * A set of tests for blocks in the UI controls section of the toolbox
 */
import $ from 'jquery';
var tickWrapper = require('../../util/tickWrapper');
import {TestResults} from '@cdo/apps/constants';

// take advantage of the fact that we expose the filesystem via
// localhost
var imageUrl = '/base/static/flappy_promo.png';

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
      timeout: 20000,
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
        tickWrapper.runOnAppTick(Applab, 2, function () {
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
      description: "getProperty and setProperty for value on sliders.",
      editCode: true,
      // Creating the slider elements with the write() API since we don't expose
      // an API to create sliders at runtime...
      xml:
          "write('<input type=\"range\" value=\"50\" min=\"0\" max=\"100\"" +
            " step=\"1\" id=\"idSlider1\">');" +
          "write('<input type=\"range\" value=\"50\" min=\"0\" max=\"100\"" +
            " step=\"1\" id=\"idSlider2\">');" +
          "setProperty('idSlider1', 'value', 25);" +
          "setProperty('idSlider2', 'value', getProperty('idSlider1', 'value'));",
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function () {
          assert(document.getElementById('idSlider2').value === '25');
          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "getProperty and setProperty for value on text inputs.",
      editCode: true,
      xml:
          "textInput('idTxt1', '');" +
          "textInput('idTxt2', '');" +
          "setProperty('idTxt1', 'value', 'test-value');" +
          "setProperty('idTxt2', 'value', getProperty('idTxt1', 'value'));",
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function () {
          assert(document.getElementById('idTxt2').value === 'test-value');
          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "getProperty and setProperty for value on dropdowns.",
      editCode: true,
      xml:
          "dropdown('idDrop1', 'a', 'b');" +
          "dropdown('idDrop2', 'a', 'b');" +
          "setProperty('idDrop1', 'value', 'b');" +
          "setProperty('idDrop2', 'value', getProperty('idDrop1', 'value'));",
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function () {
          assert(document.getElementById('idDrop2').value === 'b');
          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "getProperty and setProperty for fit on images.",
      editCode: true,
      xml:
          "image('idImage1', '');" +
          "image('idImage2', '');" +
          "image('idImage3', '');" +
          "setProperty('idImage1', 'fit', 'cover');" +
          "setProperty('idImage2', 'fit', getProperty('idImage1', 'fit'));",
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function () {
          assert(document.getElementById('idImage2').getAttribute('data-object-fit') === 'cover');
          assert(document.getElementById('idImage3').getAttribute('data-object-fit') === 'contain');
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
        tickWrapper.runOnAppTick(Applab, 2, function () {
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
        tickWrapper.runOnAppTick(Applab, 2, function () {
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
        tickWrapper.runOnAppTick(Applab, 2, function () {
          var debugOutput = document.getElementById('debug-output');
          assert.equal(debugOutput.textContent, 'WARNING: Line: 1: button() id parameter refers to an id ("button1") which already exists.');
          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "testIllegalNameError runButton",
      editCode: true,
      xml: "" +
        "button('runButton', 'Bad name for a run button');",
      onExecutionError: function () {
        // Trigger the custom validator and done callback
        Applab.onPuzzleComplete();
      },
      customValidator: function (assert) {
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent,
            'ERROR: Line: 1: Error: button() id parameter refers to an id ' +
            '("runButton") which is already being used outside of App Lab. Please use a different id.');
        assert(!$('#divApplab #runButton')[0], 'No button named runButton should appear in applab');
        return true;
      },
      expected: {
        result: false,
        testResult: TestResults.RUNTIME_ERROR_FAIL
      },
    },
    {
      description: "testIllegalNameError submitButton",
      editCode: true,
      xml: "" +
      "button('submitButton', 'Bad name for a submit button');",
      onExecutionError: function () {
        // Trigger the custom validator and done callback
        Applab.onPuzzleComplete();
      },
      customValidator: function (assert) {
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent,
          'ERROR: Line: 1: Error: button() id parameter refers to an id ' +
          '("submitButton") which is already being used outside of App Lab. Please use a different id.');
        assert(!$('#divApplab #submitButton')[0], 'No button named submitButton should appear in applab');
        return true;
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
        tickWrapper.runOnAppTick(Applab, 2, function () {
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
    {
      description: "html sanitization allows whitelisted tags and attributes",
      timeout: 20000,
      editCode: true,
      xml: '' +
      'write(\'' +
      '<div id="container">' +
      '  <img id="image" src="' + imageUrl + '">' +
      '  <h1 id="header1">heading</h1>' +
      '  <h6 id="header1">heading</h6>' +
      '  <hr>' +
      '  <select id="dropdown1" size="2" multiple="true">' +
      '    <option>Option 1</option>' +
      '    <option>Option 2</option>' +
      '  </select>' +
      '  <a href="https://code.org/images/logo.png">logo</a>' +
      '</div>' +
      '\')\n;',

      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function () {
          // Element.outerHTML undoes some of the cosmetic changes made by the sanitizer.
          var expectedHtml = '' +
            '<div id="container">' +
            '  <img id="image" src="' + imageUrl + '">' +
            '  <h1 id="header1">heading</h1>' +
            '  <h6 id="header1">heading</h6>' +
            '  <hr>' +
            '  <select id="dropdown1" size="2" multiple="true">' +
            '    <option>Option 1</option>' +
            '    <option>Option 2</option>' +
            '  </select>' +
            '  <a href="https://code.org/images/logo.png">logo</a>' +
            '</div>';
          assert.equal($('#divApplab #container')[0].outerHTML, expectedHtml, 'container has unexpected outerHTML');

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
      description: "cosmetic changes in html sanitization do not cause warnings",
      timeout: 20000,
      editCode: true,
      xml: '' +
      'write(\'' +
        '<div id="container" abp="228">' +
        '<img id="image1" src="">' +
        '<img id="image2" src="' + imageUrl + '" />' +
        '<grammarly-btn></grammarly-btn>' +
      '</div>' +
      '\')\n;',

      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function () {
          // Element.outerHTML undoes some of the cosmetic changes made by the sanitizer.
          var expectedHtml = '' +
            '<div id="container">' +
            '<img id="image1" src="">' +
            '<img id="image2" src="' + imageUrl + '">' +
            '</div>';
          assert.equal($('#divApplab #container')[0].outerHTML, expectedHtml, 'container has unexpected outerHTML');

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
      description: "substantial changes in html sanitization do cause warnings",
      timeout: 20000,
      editCode: true,
      xml: '' +
      'write(\'' +
        '<div id="container">' +
          '<img id="image3" src="">' +
          '<img id="image4" src="' + imageUrl + '" />' +
          '<img id="image5" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" />' +
          '<img id="image6" src="javascript:alert()" />' +
          '<script>alert()</script>' +
        '</div>' +
      '\')\n;',

      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function () {
          var expectedHtml = '' +
            '<div id="container">' +
            '<img id="image3" src="">' +
            '<img id="image4" src="' + imageUrl + '">' +
            '<img id="image5" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==">' +
            '<img id="image6">' +
            '</div>';
          assert.equal($('#divApplab #container')[0].outerHTML, expectedHtml, 'container has unexpected outerHTML');

          Applab.onPuzzleComplete();
        });
      },
      customValidator: function (assert) {
        var expectedOutput ='' +
          'WARNING: Line: 1: The following lines of HTML were modified or removed:\n' +
          '<img id="image6" src="javascript:alert()" />\n' +
          '<script>alert()\n</script>\n' +
          'original html:\n' +
          '<div id="container">' +
          '<img id="image3" src="">' +
          '<img id="image4" src="/base/static/flappy_promo.png" />' +
          '<img id="image5" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" />' +
          '<img id="image6" src="javascript:alert()" /><script>alert()</script></div>\n' +
          'modified html:\n' +
          '<div id="container">' +
          '<img id="image3" src />' +
          '<img id="image4" src="/base/static/flappy_promo.png" />' +
          '<img id="image5" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" />' +
          '<img id="image6" /></div>';
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, expectedOutput);
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "invalid ids in html sanitization give specific warnings",
      timeout: 20000,
      editCode: true,
      xml: '' +
      'write(\'' +
      '<div id="container">' +
      '<div id="mydiv">one</div>' +
      '<div id="divApplab">two</div>' +
      '<div id="runButton">three</div>' +
      '<div id="submitButton">four</div>' +
      '</div>' +
      '\')\n;',

      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function () {
          var expectedHtml = '' +
            '<div id="container">' +
            '<div id="mydiv">one</div>' +
            '<div>two</div>' +
            '<div>three</div>' +
            '<div>four</div>' +
            '</div>';
          assert.equal($('#divApplab #container')[0].outerHTML, expectedHtml, 'container has unexpected outerHTML');

          Applab.onPuzzleComplete();
        });
      },
      customValidator: function (assert) {
        var expectedOutput ='' +
          'WARNING: Line: 1: The following lines of HTML were modified or removed:\n' +
          '<div id="divApplab">two\n' +
          '<div id="runButton">three\n' +
          '<div id="submitButton">four\n' +
          'original html:\n' +
          '<div id="container"><div id="mydiv">one</div><div id="divApplab">two</div><div id="runButton">three</div><div id="submitButton">four</div></div>\n' +
          'modified html:\n' +
          '<div id="container"><div id="mydiv">one</div><div>two</div><div>three</div><div>four</div></div>\n' +
          'warnings:\n' +
          'element id is already in use: divApplab\n' +
          'element id is already in use: runButton\n' +
          'element id is already in use: submitButton';
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, expectedOutput);
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    }
  ]
};
