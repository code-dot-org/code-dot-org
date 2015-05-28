var testUtils = require('../../util/testUtils');
var TestResults = require('@cdo/apps/constants').TestResults;
var _ = require('lodash');
var $ = require('jquery');
var React = require('react');
require('react/addons')
var ReactTestUtils = React.addons.TestUtils;

// i'd like this test to not run through level tests, which has a lot of hacks,
// but this is the easiest approach for now. hopefully at some point in the
// (nearish) future, we have a better approach and this code can be moved
// without too much difficulty

function validatePropertyRow(index, label, value, assert) {
  var table = $("#design-properties table")[0];
  assert(table);

  var tableRow = $("#design-properties table tr").eq(index);
  assert.equal(tableRow.children(0).text(), label);
  // second col has an input with val screen 2
  assert.equal(tableRow.children(1).children(0).val(), value);

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
        assert.equal($('#designModeBox').is(':visible'), false);

        // click toggle
        $(designModeToggle).click();

        assert.equal(designModeToggle.textContent, 'Code');
        var screenSelector = document.getElementById('screenSelector');
        assert.notEqual(screenSelector, null);
        assert.equal(screenSelector.options.length, 1);
        assert.equal($(screenSelector).val(), 'screen1');
        assert.equal($('#designModeBox').is(':visible'), true);

        // initially no design properties table
        assert.equal($("#design-properties table").length, 0);

        // add a completion on timeout since this is a freeplay level
        setTimeout(function () {
          Applab.onPuzzleComplete();
        }, 1);
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
        $("[data-element-type='SCREEN']").simulate("drag", {
          handle: 'corner',
          x: $("#divApplab").position().left + 10,
          y: $("#divApplab").position().top + 10,
          ignoreTouchMapppings: true
        });

        assert.equal($("#divApplab").children().length, 2, 'has two screen divs');
        assert.equal(screenSelector.options.length, 2, 'has two options in dropdown');
        assert.equal($(screenSelector).val(), 'screen2');

        validatePropertyRow(1, 'id', 'screen2', assert);

        // drag a button onto our new screen
        $("[data-element-type='BUTTON']").simulate("drag", {
          handle: 'corner',
          x: $("#divApplab").position().left + 10,
          y: $("#divApplab").position().top + 10,
          ignoreTouchMapppings: true
        });

        validatePropertyRow(1, 'id', 'button1', assert);
        var buttonElement = document.getElementById('button1');
        var buttonParent = buttonElement.parentNode;
        assert.equal(buttonParent.getAttribute('id'), 'screen2');

        // Change to screen1 using dropdown
        ReactTestUtils.Simulate.change(document.getElementById('screenSelector'),
          { target: { value: 'screen1' } });

        validatePropertyRow(1, 'id', 'screen1', assert);
        assert(!$('#button1').is(':visible'));

        // add a completion on timeout since this is a freeplay level
        setTimeout(function () {
          Applab.onPuzzleComplete();
        }, 1);
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    }
  ]
};
