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

module.exports = {
  app: "applab",
  skinId: "applab",
  levelFile: "levels",
  levelId: "ec_simple",
  tests: [
    {
      description: "button image",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        // enter design mode
        $("#designModeToggle").click();
        assert.equal($("#designModeToggle").text(), 'Code');

        testUtils.dragToVisualization('BUTTON', 10, 10);

        validatePropertyRow(1, 'id', 'button1', assert);

        var assetUrl = '/assets/codeorg-studio-logo.png';
        // second last input
        var imageInput = $("#design-properties input").eq(-2)[0];

        ReactTestUtils.Simulate.change(imageInput, {
          target: { value: assetUrl }
        });

        // I'd like to assert that the size and image have changed here, but
        // am currently unable as it seems phantom doesn't hit the image.onload
        // for some reason


        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 50, function () {
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
