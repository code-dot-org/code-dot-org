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
        $("#designModeButton").click();

        testUtils.dragToVisualization('BUTTON', 10, 10);

        validatePropertyRow(1, 'id', 'button1', assert);

        // take advantage of the fact that we expose the filesystem via
        // localhost:8001
        var assetUrl = 'http://localhost:8001/apps/static/flappy_promo.png';
        // second last input
        var imageInput = $("#design-properties input").eq(-2)[0];

        ReactTestUtils.Simulate.change(imageInput, {
          target: { value: assetUrl }
        });

        var buttonElement = $("#button1")[0];

        // wait until image has loaded to do validation
        var img = new Image();
        img.src = assetUrl;
        img.onload = function () {
          // There's no guarantee that we hit this onload after the onload in
          // designMode.js, so the styles won't always be set immediately.
          // Instead, wait until the level starts to do our validation

          // add a completion on timeout since this is a freeplay level
          testUtils.runOnAppTick(Applab, 2, function () {
            assert.equal(buttonElement.style.backgroundImage, 'url(' + assetUrl + ')');
            assert.equal(buttonElement.style.width, '200px');
            assert.equal(buttonElement.style.height, '113px');
            assert.equal(buttonElement.style.backgroundSize, '200px 113px');

            Applab.onPuzzleComplete();
          });
        };
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    }
  ]
};
