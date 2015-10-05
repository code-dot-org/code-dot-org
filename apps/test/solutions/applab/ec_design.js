var testUtils = require('../../util/testUtils');
var TestResults = require('@cdo/apps/constants').TestResults;
var _ = require('lodash');
var $ = require('jquery');
require('react/addons');
var ReactTestUtils = React.addons.TestUtils;

// i'd like this test to not run through level tests, which has a lot of hacks,
// but this is the easiest approach for now. hopefully at some point in the
// (nearish) future, we have a better approach and this code can be moved
// without too much difficulty

/**
 * Assert that a property row with the given label exists at the given index,
 * and that it has the given expected value.
 *
 * @param {number} index - Zero-based index for the property row to examine.
 * @param {string} label - Expected label for the property row.
 * @param {?} value - Expected value for the first element in the second column
 *        of the property row, retrieved with $.val() and compared with ==,
 *        so type coercion may occur.
 * @param {Chai.Assert} assert
 */
function assertPropertyRowValue(index, label, value, assert) {
  assertPropertyRowExists(index, label, assert);

  // second col has an input with val screen 2
  var propertyRow = $("#propertyRowContainer > div").eq(index);
  assert.equal(propertyRow.children(1).children(0).val(), value);
}

/**
 * Assert that a property row with the given label exists at the given index.
 *
 * @param {number} index - Zero-based index for the property row to examine.
 * @param {string} label - Expected label for the property row.
 * @param {Chai.Assert} assert
 */
function assertPropertyRowExists(index, label, assert) {
  var container = $("#propertyRowContainer")[0];
  assert(container, 'has design properties container');

  var propertyRow = $("#propertyRowContainer > div").eq(index);
  assert.equal(propertyRow.children(0).text(), label);
}

// We don't load our style sheets in mochaTests, so we instead depend
// on checking classes.
// An element will be set to opacity 0.3 if it has the class
// design-mode-hidden and divApplab does not have the class
// divApplabDesignMode
var isFaded = function (selector) {
  var element = $(selector);
  return element.hasClass('design-mode-hidden') &&
      $('#divApplab').hasClass('divApplabDesignMode');
};
var isHidden = function (selector) {
  var element = $(selector);
  return element.hasClass('design-mode-hidden') &&
      !$('#divApplab').hasClass('divApplabDesignMode');
};

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

        assertPropertyRowValue(0, 'id', 'button1', assert);

        // take advantage of the fact that we expose the filesystem via
        // localhost:8001
        var assetUrl = '//localhost:8001/apps/static/flappy_promo.png';
        var imageInput = $("#propertyRowContainer input").last()[0];

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
          // Instead, wait until the next tick

          // add a completion on timeout since this is a freeplay level
          setTimeout(function () {
            assert.equal(buttonElement.style.backgroundImage, 'url(http:' + assetUrl + ')');
            assert.equal(buttonElement.style.width, '200px');
            assert.equal(buttonElement.style.height, '113px');
            assert.equal(buttonElement.style.backgroundSize, '200px 113px');

            Applab.onPuzzleComplete();
          }, 1);
        };
        img.onerror = function (err) {
          assert(false, err.message);
        };
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "resizing",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        var shouldBeResizable = function () {
          var rootDiv, screen1, resizable, button;

          rootDiv = $('#divApplab');
          assert.equal(rootDiv.children().length, 1);
          screen1 = rootDiv.children().first();
          assert.equal(screen1.attr('id'), 'screen1');
          assert.equal(screen1.children().length, 1);
          resizable = screen1.children().first();
          assert.equal(resizable.hasClass('ui-resizable'), true, 'is resizable');
          assert.equal(resizable.hasClass('ui-draggable'), true, 'is draggable');
          assert.equal(resizable.children().length, 4);
          button = resizable.children().first();
          assert.equal(button.prop('tagName'), 'BUTTON');
          assert.equal(resizable.children().eq(1).hasClass('ui-resizable-handle'),
            true, 'is resizable handle');
          assert.equal(resizable.children().eq(2).hasClass('ui-resizable-handle'),
            true, 'is resizable handle');
          assert.equal(resizable.children().eq(3).hasClass('ui-resizable-handle'),
            true, 'is resizable handle');
        };

        var shouldNotBeResizable = function () {
          var rootDiv, screen1, resizable, button;

          rootDiv = $('#divApplab');
          assert.equal(rootDiv.children().length, 1);
          screen1 = rootDiv.children().first();
          assert.equal(screen1.attr('id'), 'screen1');
          assert.equal(screen1.children().length, 1);
          // button should now be a direct descendant
          button = screen1.children().first();
          assert.equal(button.prop('tagName'), 'BUTTON');
        };

        $("#designModeButton").click();
        testUtils.dragToVisualization('BUTTON', 10, 10);
        assertPropertyRowValue(0, 'id', 'button1', assert);
        shouldBeResizable();

        $("#codeModeButton").click();
        assert.equal($("#design-properties").is(':visible'), false);
        shouldNotBeResizable();

        $("#designModeButton").click();
        shouldBeResizable();

        $("#runButton").click();
        shouldNotBeResizable();

        $("#resetButton").click();
        shouldBeResizable();

        Applab.onPuzzleComplete();
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },

    {
      description: "hidden items",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {

        $("#designModeButton").click();
        testUtils.dragToVisualization('BUTTON', 10, 10);
        assertPropertyRowValue(0, 'id', 'button1', assert);
        var toggleHidden = $('.custom-checkbox')[0];

        assert.equal(isFaded('#button1'), false);
        assert.equal(isHidden('#button1'), false);

        ReactTestUtils.Simulate.click(toggleHidden);

        assert.equal($(toggleHidden).hasClass('fa-check-square-o'), true);
        assert.equal(isFaded('#button1'), true);
        assert.equal(isHidden('#button1'), false);

        // Enter code mode
        $("#codeModeButton").click();
        assert.equal(isFaded('#button1'), false);
        assert.equal(isHidden('#button1'), true);

        // Back to design mode
        $("#designModeButton").click();
        assert.equal(isFaded('#button1'), true);
        assert.equal(isHidden('#button1'), false);

        // Enter run mode
        $("#runButton").click();
        assert.equal(isFaded('#button1'), false);
        assert.equal(isHidden('#button1'), true);

        $("#resetButton").click();
        assert.equal(isFaded('#button1'), true);
        assert.equal(isHidden('#button1'), false);

        Applab.onPuzzleComplete();
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },

    {
      description: "entering design mode while running",
      editCode: true,
      xml: 'button("my_button", "text");',
      runBeforeClick: function (assert) {
        testUtils.runOnAppTick(Applab, 2, function () {
          assert.equal($('#my_button').length, 1);

          $("#designModeButton").click();

          assert.equal($('#my_button').length, 0, 'API created element should be gone');

          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },

    {
      description: "exercise CHART element",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {

        // Switch to design mode
        var designModeButton = $('#designModeButton');
        designModeButton.click();

        // Add a chart
        testUtils.dragToVisualization('CHART', 0, 0);
        var divApplab = $('#divApplab');
        var newChart = divApplab.find('.chart');
        assert.equal(newChart.length, 1);

        // Validate property rows and some default values
        assertPropertyRowValue(0, 'id', 'chart1', assert);
        assertPropertyRowValue(1, 'width (px)', 100, assert);
        assertPropertyRowValue(2, 'height (px)', 100, assert);
        assertPropertyRowExists(3, 'x position (px)', assert);
        assertPropertyRowExists(4, 'y position (px)', assert);
        assertPropertyRowExists(5, 'hidden', assert);
        assertPropertyRowExists(6, 'depth', assert);

        // Make sure it's draggable
        var manipulator = newChart.parent();
        assert.isTrue(manipulator.hasClass('ui-draggable'), 'chart is draggable');

        // Make sure it's resizable
        assert.isTrue(manipulator.hasClass('ui-resizable'), 'chart is resizable');

        // Hide/show the chart
        var toggleHidden = $('.custom-checkbox')[0];
        assert.isFalse(isFaded('#chart1'));
        assert.isFalse(isHidden('#chart1'));

        ReactTestUtils.Simulate.click(toggleHidden);
        assert.isTrue(isFaded('#chart1'));
        assert.isFalse(isHidden('#chart1'));

        ReactTestUtils.Simulate.click(toggleHidden);
        assert.isFalse(isFaded('#chart1'));
        assert.isFalse(isHidden('#chart1'));

        // Delete the chart
        var deleteButton = $('#designWorkspaceBody').find('button:contains(Delete)')[0];
        ReactTestUtils.Simulate.click(deleteButton);
        assert.equal(divApplab.find('.chart').length, 0);

        Applab.onPuzzleComplete();
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    }
  ]
};
