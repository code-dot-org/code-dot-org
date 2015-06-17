var testUtils = require('../../util/testUtils');
var TestResults = require('@cdo/apps/constants').TestResults;
var _ = require('lodash');
var $ = require('jquery');
var React = require('react');
require('react/addons');
var ReactTestUtils = React.addons.TestUtils;

// i'd like this test to not run through level tests, which has a lot of hacks,
// but this is the easiest approach for now. hopefully at some point in the
// (nearish) future, we have a better approach and this code can be moved
// without too much difficulty

function validatePropertyRow(index, label, value, assert) {
  var container = $("#propertyRowContainer")[0];
  assert(container, 'has design properties container');

  var propertyRow = $("#propertyRowContainer > div").eq(index);
  assert.equal(propertyRow.children(0).text(), label);
  // second col has an input with val screen 2
  assert.equal(propertyRow.children(1).children(0).val(), value);
}

function validateEmptyDesignProperties(assert) {
  var designProperties = document.getElementById('design-properties');
  assert.equal(designProperties.children.length, 1);
  assert.equal(designProperties.children[0].tagName, 'P');
}

module.exports = {
  app: "applab",
  skinId: "applab",
  levelFile: "levels",
  levelId: "ec_simple",
  tests: [
    {
      description: "basic test",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        // We have an applab div with a single screen inside it
        var divApplab = document.getElementById('divApplab');
        assert(divApplab);
        assert.equal(divApplab.children.length, 1);
        var screen1 = divApplab.children[0];
        assert.equal(screen1.id, 'screen1');
        assert.equal(screen1.tagName, 'DIV');

        // The design button is visible, and there's no dropdown
        var designModeButton = document.getElementById('designModeButton');
        assert.equal(designModeButton.textContent, 'Design');
        assert.equal(document.getElementById('screenSelector'), null);

        // our design mode box is hidden
        assert.equal($('#designWorkspace').is(':visible'), false);

        // click design mode button
        $(designModeButton).click();

        var lightestGray = 'rgb(231, 232, 234)';
        var orange = 'rgb(255, 160, 0)';
        assert.equal(lightestGray, $("#designModeButton").css('background-color'),
          'expected Design button to have lightest gray background.');
        assert.equal(orange, $("#codeModeButton").css('background-color'),
          'expected Code button to have orange background.');
        var screenSelector = document.getElementById('screenSelector');
        assert.notEqual(screenSelector, null);
        assert.equal(screenSelector.options.length, 2, 'expected 2 options');
        assert.equal($(screenSelector).val(), 'screen1');
        assert.equal($('#designWorkspace').is(':visible'), true);

        // initially no property row container
        assert.equal($("#propertyRowContainer").length, 0,
            'expected no design property row container');

        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "add a screen",
      editCode: true,
      timeout: 15000,
      xml: '',
      runBeforeClick: function (assert) {
        // enter design mode
        $("#designModeButton").click();
        var screenSelector = document.getElementById('screenSelector');

        // drag a new screen in
        testUtils.dragToVisualization('SCREEN', 10, 10);

        assert.equal($("#divApplab").children().length, 2, 'has two screen divs');
        assert.equal(screenSelector.options.length, 3, 'has three options in dropdown');
        assert.equal($(screenSelector).val(), 'screen2');

        validatePropertyRow(0, 'id', 'screen2', assert);

        // drag a button onto our new screen
        testUtils.dragToVisualization('BUTTON', 10, 10);

        validatePropertyRow(0, 'id', 'button1', assert);
        var buttonElement = document.getElementById('button1');
        var buttonParent = buttonElement.parentNode;
        assert($(buttonParent).hasClass('ui-draggable'));
        assert($(buttonParent).hasClass('ui-resizable'));
        assert.equal(buttonParent.parentNode.getAttribute('id'), 'screen2');

        // Change to screen1 using dropdown
        ReactTestUtils.Simulate.change(document.getElementById('screenSelector'),
          { target: { value: 'screen1' } });

        validatePropertyRow(0, 'id', 'screen1', assert);
        assert(!$('#button1').is(':visible'));

        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "delete a screen",
      editCode: true,
      timeout: 15000,
      xml: '',
      runBeforeClick: function (assert) {
        // enter design mode
        $("#designModeButton").click();
        var screenSelector = document.getElementById('screenSelector');

        // drag a new screen in
        testUtils.dragToVisualization('SCREEN', 10, 10);

        assert.equal($("#divApplab").children().length, 2, 'has two screen divs');
        assert.equal(screenSelector.options.length, 3, 'has three options in dropdown');
        assert.equal($(screenSelector).val(), 'screen2');

        validatePropertyRow(0, 'id', 'screen2', assert);

        var deleteButton = $("#design-properties button").eq(-1);
        assert.equal(deleteButton.text(), 'Delete');

        ReactTestUtils.Simulate.click(deleteButton[0]);

        // Should have resulted in two new buttons
        assert.equal($("#design-properties button").eq(-2).text(), 'No');
        assert.equal($("#design-properties button").eq(-1).text(), 'Yes');

        ReactTestUtils.Simulate.click($("#design-properties button").eq(-1)[0]);

        validateEmptyDesignProperties(assert);
        assert.equal($("#divApplab").children().length, 1, 'has one screen divs');
        assert.equal($(screenSelector).val(), 'screen1');

        // click on screen 1 (use jquery instead of React since screen1 is not
        // a react component)
        $("#screen1").click();
        validatePropertyRow(0, 'id', 'screen1', assert);

        // One button, and it isn't delete
        assert.equal($("#design-properties button").length, 1);
        assert.equal($("#design-properties button").text(), '');

        // Change name
        var inputId = $('#design-properties input').first();
        ReactTestUtils.Simulate.change(inputId[0],
          { target: { value: 'renamed_screen' } });
        assert(document.getElementById('renamed_screen'));

        // Still can't delete
        assert.equal($("#design-properties button").length, 1);
        assert.equal($("#design-properties button").text(), '');

        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "ensure API based element creation puts element on active screen",
      editCode: true,
      xml:
        'button("my_button", "my_button_text");' +
        'image("my_image", "http://code.org/images/logo.png");' +
        'createCanvas("my_canvas", 320, 480);' +
        'container("my_container", "<div>FOO</div>");' +
        'write("<div id=\'my_write\'>FOO</div>");' +
        'imageUploadButton("my_image_upload", "text");' +
        'textInput("my_text_input", "text");' +
        'textLabel("my_text_label", "label");' +
        'checkbox("my_checkbox", false);' +
        'radioButton("my_radio_button", false, "group");' +
        'dropdown("my_dropdown", "option1", "etc");',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          function idExistsOnScreen1(id) {
            var element = document.getElementById(id);
            assert(element);
            assert.equal(element.parentNode.id, 'screen1');
          }

          var button = document.getElementById('my_button');
          assert.equal(button.textContent, 'my_button_text');
          idExistsOnScreen1('my_button');

          idExistsOnScreen1('my_image');
          idExistsOnScreen1('my_canvas');
          idExistsOnScreen1('my_container');

          // write puts contents inside a div (so here we have a div inside a
          // div inside our screen)
          var write = document.getElementById('my_write');
          assert(write);
          assert.equal(write.parentNode.parentNode.id, 'screen1');

          idExistsOnScreen1('my_image_upload');
          idExistsOnScreen1('my_text_input');
          idExistsOnScreen1('my_text_label');
          idExistsOnScreen1('my_checkbox');
          idExistsOnScreen1('my_dropdown');

          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "switching screens works",
      editCode: true,
      xml:
        'button("button1", "my_button_text");' +
        'setScreen("screen2");' +
        'button("button2", "my_button_text");',
      runBeforeClick: function (assert) {
        // enter design mode
        $("#designModeButton").click();

        // drag a new screen in
        testUtils.dragToVisualization('SCREEN', 10, 10);
        assert.equal($("#divApplab").children().length, 2, 'has two screen divs');

        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          assert.equal($('#screen1').is(':visible'), false);
          assert.equal($('#screen2').is(':visible'), true);

          assert.equal($('#button1').is(':visible'), false);
          assert.equal($('#button2').is(':visible'), true);

          assert.equal($('#button1').parent().attr('id'), 'screen1');
          assert.equal($('#button2').parent().attr('id'), 'screen2');

          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "return to screen1 when entering code mode",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        // enter design mode
        $("#designModeButton").click();
        var lightestGray = 'rgb(231, 232, 234)';
        var orange = 'rgb(255, 160, 0)';
        assert.equal(lightestGray, $("#designModeButton").css('background-color'),
          'expected Design button to have lightest gray background.');
        assert.equal(orange, $("#codeModeButton").css('background-color'),
          'expected Code button to have orange background.');
        // add a screen
        testUtils.dragToVisualization('SCREEN', 10, 10);
        validatePropertyRow(0, 'id', 'screen2', assert);
        assert.equal($('#screen1')[0].style.display === 'none', true, 'screen 1 hidden');
        assert.equal($('#screen2')[0].style.display === 'none', false, 'screen 2 visible');

        // return to code mode
        $("#codeModeButton").click();
        assert.equal(orange, $("#designModeButton").css('background-color'),
          'expected Design button to have orange background.');
        assert.equal(lightestGray, $("#codeModeButton").css('background-color'),
          'expected Code button to have lightest gray background.');

        // should be on screen 1
        assert.equal($('#screen1')[0].style.display === 'none', false, 'screen 1 visible');
        assert.equal($('#screen2')[0].style.display === 'none', true, 'screen 2 hidden');

        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },

    {
      description: "add/remove an element to a screen",
      editCode: true,
      xml: "",
      runBeforeClick: function (assert) {
        // enter design mode
        $("#designModeButton").click();

        testUtils.dragToVisualization('BUTTON', 10, 10);

        var button = document.getElementById('button1');
        assert(button);

        var screenElement = document.getElementById('screen1');

        assert.equal(screenElement.children.length, 1);

        var outerDiv = screenElement.children[0];
        assert($(outerDiv).hasClass('ui-resizable'), 'child is outer resizable div');

        assert(button.parentNode === outerDiv);

        var deleteButton = $("#design-properties button").eq(-1);
        assert.equal(deleteButton.text(), 'Delete');

        ReactTestUtils.Simulate.click(deleteButton[0]);

        // outdiv and child should have gone away
        assert.equal(screenElement.children.length, 0);

        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },

    {
      description: "add a background",
      editCode: true,
      xml: "",
      runBeforeClick: function (assert) {
        // enter design mode
        var designModeButton = document.getElementById('designModeButton');

        $("#screen1").click();

        validatePropertyRow(0, 'id', 'screen1', assert);

        // take advantage of the fact that we expose the filesystem via
        // localhost:8001
        var assetUrl = 'http://localhost:8001/apps/static/flappy_promo.png';
        var imageInput = $("#design-properties input").eq(2)[0];

        ReactTestUtils.Simulate.change(imageInput, {
          target: { value: assetUrl }
        });

        var screenElement = document.getElementById('screen1');
        assert.equal(screenElement.style.backgroundImage, 'url(' + assetUrl + ')');

        assert.equal(screenElement.style.backgroundSize, '320px 480px', 'image stretched');

        // make sure dimensions didn't change
        assert.equal(screenElement.style.width, '320px');
        assert.equal(screenElement.style.height, '480px');

        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },

    {
      description: "screen dropdown",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        // enter design mode
        $("#designModeButton").click();

        // drag a new screen in
        testUtils.dragToVisualization('SCREEN', 10, 10);
        assert.equal($("#divApplab").children().length, 2, 'has two screen divs');
        validatePropertyRow(1, 'id', 'screen2', assert);

        assert.equal($("#screenSelector").children().length, 3);
        assert.equal($("#screenSelector").children().eq(2).text(), "New screen...");

        // New screen via dropdown
        ReactTestUtils.Simulate.change(document.getElementById('screenSelector'),
          { target: { value: 'New screen...' } });

        assert.equal($("#divApplab").children().length, 3, 'has three screen divs');
        assert.equal($("#screenSelector").children().length, 4);
        validatePropertyRow(1, 'id', 'screen3', assert);

        Applab.onPuzzleComplete();
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
  ]
};
