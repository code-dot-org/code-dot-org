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
  var table = $("#design-properties table")[0];
  assert(table, 'has design properties table');

  var tableRow = $("#design-properties table tr").eq(index);
  assert.equal(tableRow.children(0).text(), label);
  // second col has an input with val screen 2
  assert.equal(tableRow.children(1).children(0).val(), value);
}

function validationEmptyDesignProperties(assert) {
  var designProperties = document.getElementById('design-properties');
  assert.equal(designProperties.children.length, 1);
  assert.equal(designProperties.children[0].tagName, 'P');
}

/**
 * jQuery.simulate was having issues in phantom, so I decided to roll my own
 * drag simulation. May belong in a util file.
 * @param {string} type
 * @param {number} left Horizontal offset from top left of visualization to drop at
 * @param {number} top Vertical offset from top left of visualization to drop at
 */
function dragToVisualization(type, left, top) {
  // drag a new screen in
  var element = $("[data-element-type='" + type + "']");
  var screenOffset = element.offset();
  var mousedown = $.Event("mousedown", {
    which: 1,
    pageX: screenOffset.left,
    pageY: screenOffset.top
  });
  var drag = $.Event("mousemove", {
    pageX: $("#visualization").offset().left + left,
    pageY: $("#visualization").offset().top + top
  });
  var mouseup = $.Event('mouseup', {
    pageX: $("#visualization").offset().left + left,
    pageY: $("#visualization").offset().top + top
  });
  element.trigger(mousedown);
  $(document).trigger(drag);
  $(document).trigger(mouseup);
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

        // Our toggle button says design, and there's no dropdown
        var designModeToggle = document.getElementById('designModeToggle');
        assert.equal(designModeToggle.textContent, 'Design');
        assert.equal(document.getElementById('screenSelector'), null);

        // our design mode box is hidden
        assert.equal($('#designWorkspace').is(':visible'), false);

        // click toggle
        $(designModeToggle).click();

        assert.equal(designModeToggle.textContent, 'Code');
        var screenSelector = document.getElementById('screenSelector');
        assert.notEqual(screenSelector, null);
        assert.equal(screenSelector.options.length, 1, 'expected 1 screen');
        assert.equal($(screenSelector).val(), 'screen1');
        assert.equal($('#designWorkspace').is(':visible'), true);

        // initially no design properties table
        assert.equal($("#design-properties table").length, 0,
            'expected no design properties table');

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
        $("#designModeToggle").click();
        assert.equal($("#designModeToggle").text(), 'Code');
        var screenSelector = document.getElementById('screenSelector');

        // drag a new screen in
        dragToVisualization('SCREEN', 10, 10);

        assert.equal($("#divApplab").children().length, 2, 'has two screen divs');
        assert.equal(screenSelector.options.length, 2, 'has two options in dropdown');
        assert.equal($(screenSelector).val(), 'screen2');

        validatePropertyRow(1, 'id', 'screen2', assert);

        // drag a button onto our new screen
        dragToVisualization('BUTTON', 10, 10);

        validatePropertyRow(1, 'id', 'button1', assert);
        var buttonElement = document.getElementById('button1');
        var buttonParent = buttonElement.parentNode;
        assert($(buttonParent).hasClass('ui-draggable'));
        assert($(buttonParent).hasClass('ui-resizable'));
        assert.equal(buttonParent.parentNode.getAttribute('id'), 'screen2');

        // Change to screen1 using dropdown
        ReactTestUtils.Simulate.change(document.getElementById('screenSelector'),
          { target: { value: 'screen1' } });

        validatePropertyRow(1, 'id', 'screen1', assert);
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
        $("#designModeToggle").click();
        assert.equal($("#designModeToggle").text(), 'Code');
        var screenSelector = document.getElementById('screenSelector');

        // drag a new screen in
        dragToVisualization('SCREEN', 10, 10);

        assert.equal($("#divApplab").children().length, 2, 'has two screen divs');
        assert.equal(screenSelector.options.length, 2, 'has two options in dropdown');
        assert.equal($(screenSelector).val(), 'screen2');

        validatePropertyRow(1, 'id', 'screen2', assert);

        ReactTestUtils.Simulate.click(document.getElementById('deletePropertiesButton'));

        validationEmptyDesignProperties(assert);
        assert.equal($("#divApplab").children().length, 1, 'has one screen divs');
        assert.equal($(screenSelector).val(), 'screen1');

        // click on screen 1 (use jquery instead of React since screen1 is not
        // a react component)
        $("#screen1").click();
        validatePropertyRow(1, 'id', 'screen1', assert);
        assert(document.getElementById('deletePropertiesButton').hasAttribute('disabled'));

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
        $("#designModeToggle").click();

        // drag a new screen in
        dragToVisualization('SCREEN', 10, 10);
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
        $("#designModeToggle").click();
        assert.equal($("#designModeToggle").text(), 'Code');

        // add a screen
        dragToVisualization('SCREEN', 10, 10);
        validatePropertyRow(1, 'id', 'screen2', assert);
        assert.equal($('#screen1')[0].style.display === 'none', true, 'screen 1 hidden');
        assert.equal($('#screen2')[0].style.display === 'none', false, 'screen 2 visible');

        // return to code mode
        $("#designModeToggle").click();
        assert.equal($("#designModeToggle").text(), 'Design');

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
        $("#designModeToggle").click();
        assert.equal($("#designModeToggle").text(), 'Code');

        dragToVisualization('BUTTON', 10, 10);

        var button = document.getElementById('button1');
        assert(button);

        var screenElement = document.getElementById('screen1');

        assert.equal(screenElement.children.length, 1);

        var outerDiv = screenElement.children[0];
        assert($(outerDiv).hasClass('ui-resizable'), 'child is outer resizable div');

        assert(button.parentNode === outerDiv);


        ReactTestUtils.Simulate.click(document.getElementById('deletePropertiesButton'));

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
    }
  ]
};
