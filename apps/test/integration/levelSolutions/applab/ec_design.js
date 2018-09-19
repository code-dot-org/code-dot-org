var testUtils = require('../../../util/testUtils');
var tickWrapper = require('../../util/tickWrapper');
import {TestResults} from '@cdo/apps/constants';
var $ = require('jquery');
var ReactTestUtils = require('react-addons-test-utils');

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
  var msg = "property row " + index + " has label '" + label + "' and value '" + value + "'";
  assert.equal(propertyRow.children(1).children(0).val(), value, msg);
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
  var msg = "property row " + index + " has label '" + label + "'";
  assert.equal(propertyRow.children(0).text(), label, msg);
}

// We don't load our style sheets in integration tests, so we instead depend
// on checking classes.
// An element will be set to opacity 0.3 if it has the class
// design-mode-hidden and divApplab is hidden
var isFaded = function (selector) {
  var rootEl = $('#designModeViz');
  var element = rootEl.find(selector);
  return rootEl.is(':visible') && element.hasClass('design-mode-hidden');
};
var isHidden = function (selector) {
  var rootEl = $('#divApplab');
  var element = rootEl.find(selector);
  return rootEl.is(':visible') && element.hasClass('design-mode-hidden');
};

/**
 * Mouseover the bottom right of the element, than click and drag the resizer
 * by xAmount/yAmount to make the element bigger.
 */
function resizeElement(element, xAmount, yAmount) {
  var resizer = $(element).parent().find('.ui-icon-gripsmall-diagonal-se');

  var start = {
    x: resizer.offset().left + resizer.width(),
    y: resizer.offset().top + resizer.height()
  };
  var end = {
    x: start.x + xAmount,
    y: start.y + yAmount
  };

  // need to mouseover so that it sets up some internal state property
  var mouseover = testUtils.createMouseEvent('mouseover', start.x, start.y);
  var mousedown = testUtils.createMouseEvent('mousedown', start.x, start.y);
  var drag = testUtils.createMouseEvent('mousemove', end.x, end.y);
  var mouseup = testUtils.createMouseEvent('mouseup', end.x, end.y);

  resizer[0].dispatchEvent(mouseover);
  resizer[0].dispatchEvent(mousedown);
  resizer[0].dispatchEvent(drag);
  resizer[0].dispatchEvent(mouseup);
}

/**
 * Click and drag the element by xAmount/yAmount to move it.
 */
function dragElement(element, xAmount, yAmount) {
  var $element = $(element);
  var start = {
    x: $element.offset().left + 5,
    y: $element.offset().top + 5
  };
  var end = {
    x: start.x + xAmount,
    y: start.y + yAmount
  };

  // need to mouseover so that it sets up some internal state property
  var mousedown = testUtils.createMouseEvent('mousedown', start.x, start.y);
  var drag = testUtils.createMouseEvent('mousemove', end.x, end.y);
  var mouseup = testUtils.createMouseEvent('mouseup', end.x, end.y);

  element.dispatchEvent(mousedown);
  element.dispatchEvent(drag);
  element.dispatchEvent(mouseup);
}

module.exports = {
  app: "applab",
  skinId: "applab",
  levelFile: "levels",
  levelId: "ec_simple",
  tests: [
    {
      description: "button image with absolute url",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        $("#designModeButton").click();

        testUtils.dragToVisualization('BUTTON', 10, 20);

        assertPropertyRowValue(0, 'id', 'button1', assert);
        assertPropertyRowValue(4, 'x position (px)', 10, assert);

        var assetUrl = '/blockly/media/skins/studio/small_static_avatar.png';
        var encodedAssetUrl = assetUrl;
        var imageInput = $("#propertyRowContainer input").last()[0];

        var buttonElement = $("#design_button1")[0];

        ReactTestUtils.Simulate.change(imageInput, {
          target: { value: assetUrl }
        });

        assert.include(
          buttonElement.style.backgroundImage,
          encodedAssetUrl,
          'Button background image should contain original url'
        );
        Applab.onPuzzleComplete();
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "button image url correct with fully qualified url",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        $("#designModeButton").click();

        testUtils.dragToVisualization('BUTTON', 10, 20);

        assertPropertyRowValue(0, 'id', 'button1', assert);
        assertPropertyRowValue(4, 'x position (px)', 10, assert);

        var assetUrl = 'https://studio.code.org/blockly/media/skins/studio/small_static_avatar.png';
        var encodedAssetUrl = '/media?u=https%3A%2F%2Fstudio.code.org%2Fblockly%2Fmedia%2Fskins%2Fstudio%2Fsmall_static_avatar.png';
        var imageInput = $("#propertyRowContainer input").last()[0];

        var buttonElement = $("#design_button1")[0];

        ReactTestUtils.Simulate.change(imageInput, {
          target: { value: assetUrl }
        });

        assert.include(
          buttonElement.style.backgroundImage,
          encodedAssetUrl,
          'Button background image should contain proxied, escaped url'
        );
        Applab.onPuzzleComplete();
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "button image name with spaces and parens is loaded and resized",
      editCode: true,
      // Use an asset path which we can access so that image loading will succeed
      assetPathPrefix: '/base/test/integration/assets/',
      xml: '',
      runBeforeClick: function (assert) {
        $("#designModeButton").click();

        testUtils.dragToVisualization('BUTTON', 10, 20);

        assertPropertyRowValue(0, 'id', 'button1', assert);
        assertPropertyRowValue(4, 'x position (px)', 10, assert);

        // take advantage of the fact that we expose the filesystem via localhost
        var assetUrl = 'flappy (1).png';
        var encodedAssetUrl = '/base/test/integration/assets/applab-channel-id/flappy%20(1).png';
        var imageInput = $("#propertyRowContainer input").last()[0];

        var buttonElement = $("#design_button1")[0];
        var originalButtonWidth = buttonElement.style.width;
        var originalButtonHeight = buttonElement.style.height;

        ReactTestUtils.Simulate.change(imageInput, {
          target: { value: assetUrl }
        });

        // wait until image has loaded to do validation
        var img = new Image();
        img.src = encodedAssetUrl;
        img.onload = function () {
          // There's no guarantee that we hit this onload after the onload in
          // designMode.js, so the styles won't always be set immediately.
          // Instead, wait until the next tick

          // add a completion on timeout since this is a freeplay level
          setTimeout(function () {
            assert.include(
              buttonElement.style.backgroundImage,
              encodedAssetUrl,
              'Button background image should be flappy promo'
            );

            // Validate that the button wasn't resized
            assert.equal(buttonElement.style.width, originalButtonWidth);
            assert.equal(buttonElement.style.height, originalButtonHeight);

            // Validate that background image is centered and fit to the button size
            assert.equal(buttonElement.style.backgroundSize, 'contain');
            assert.equal(buttonElement.style.backgroundPosition, '50% 50%');
            assert.equal(buttonElement.style.backgroundRepeat, 'no-repeat');

            Applab.onPuzzleComplete();
          }, 1);
        };
        img.onerror = function (err) {
          console.warn('img.onerror unexpectedly called');
          assert(false, err.message);
        };
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "resizability",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        var shouldBeResizable = function () {
          var rootDiv, screen1, resizable, button;

          rootDiv = $('#designModeViz');
          assert.equal(rootDiv.is(':visible'), true, 'designModeViz is visible');
          assert.equal(rootDiv.children().length, 1);
          screen1 = rootDiv.children().first();
          assert.equal(screen1.attr('id'), 'design_screen1');
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
          var rootDiv, screen1, button;

          rootDiv = $('#divApplab');
          assert.equal(rootDiv.is(':visible'), true, 'divApplab is visible');
          assert.equal(rootDiv.children().length, 1);
          screen1 = rootDiv.children().first();
          assert.equal(screen1.attr('id'), 'screen1');
          assert.equal(screen1.children().length, 1);
          // button should now be a direct descendant
          button = screen1.children().first();
          assert.equal(button.prop('tagName'), 'BUTTON');
        };

        $("#designModeButton").click();
        testUtils.dragToVisualization('BUTTON', 10, 20);
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
      description: "resizing button",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        $("#designModeButton").click();
        testUtils.dragToVisualization('BUTTON', 10, 20);
        assertPropertyRowValue(0, 'id', 'button1', assert);
        assertPropertyRowValue(2, 'width (px)', 80, assert);
        assertPropertyRowValue(3, 'height (px)', 30, assert);
        assertPropertyRowValue(4, 'x position (px)', 10, assert);
        assertPropertyRowValue(5, 'y position (px)', 20, assert);

        resizeElement(document.getElementById('design_button1'), 20, 0);
        assertPropertyRowValue(2, 'width (px)', 100, assert);
        assertPropertyRowValue(3, 'height (px)', 30, assert);

        resizeElement(document.getElementById('design_button1'), 0, 20);
        assertPropertyRowValue(2, 'width (px)', 100, assert);
        assertPropertyRowValue(3, 'height (px)', 50, assert);

        Applab.onPuzzleComplete();
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },

    {
      description: "dragging button",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        $("#designModeButton").click();
        testUtils.dragToVisualization('BUTTON', 10, 20);
        assertPropertyRowValue(0, 'id', 'button1', assert);
        assertPropertyRowValue(2, 'width (px)', 80, assert);
        assertPropertyRowValue(3, 'height (px)', 30, assert);
        assertPropertyRowValue(4, 'x position (px)', 10, assert);
        assertPropertyRowValue(5, 'y position (px)', 20, assert);

        dragElement(document.getElementById('design_button1'), 20, 0);
        assertPropertyRowValue(4, 'x position (px)', 30, assert);
        assertPropertyRowValue(5, 'y position (px)', 20, assert);

        dragElement(document.getElementById('design_button1'), 0, 20);
        assertPropertyRowValue(4, 'x position (px)', 30, assert);
        assertPropertyRowValue(5, 'y position (px)', 40, assert);

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

        assert.equal(isFaded('#design_button1'), false);
        assert.equal(isHidden('#button1'), false);

        ReactTestUtils.Simulate.click(toggleHidden);

        assert.equal($(toggleHidden).hasClass('fa-check-square-o'), true);
        assert.equal(isFaded('#design_button1'), true);
        assert.equal(isHidden('#button1'), false);

        // Enter code mode
        $("#codeModeButton").click();
        assert.equal(isFaded('#design_button1'), false);
        assert.equal(isHidden('#button1'), true);

        // Back to design mode
        $("#designModeButton").click();
        assert.equal(isFaded('#design_button1'), true);
        assert.equal(isHidden('#button1'), false);

        // Enter run mode
        $("#runButton").click();
        assert.equal(isFaded('#design_button1'), false);
        assert.equal(isHidden('#button1'), true);

        $("#resetButton").click();
        assert.equal(isFaded('#design_button1'), true);
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
        tickWrapper.runOnAppTick(Applab, 2, function () {
          assert.equal($('#my_button').length, 1);

          $("#designModeButton").click();

          assert.equal($('#my_button').length, 0, 'API created element should be gone');
          assert.equal($('#design_my_button').length, 0, 'API created element should not appear in design mode');
          assert.equal($('#design-mode-dimmed').length, 0, 'transparency layer not visible when designing');
          assert.equal($('#screenSelector:disabled').length, 0, 'screen select enabled when designing');

          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },

    {
      description: "design mode box dims when running in design mode",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {

        $("#designModeButton").click();
        assert.equal($('#design-mode-dimmed').length, 0, 'transparency layer not visible when designing');
        assert.equal($('#screenSelector:disabled').length, 0, 'screen select enabled when designing');

        $("#runButton").click();
        assert.equal($('#design-mode-dimmed').length, 1, 'transparency layer visible when running in design mode');
        assert.equal($('#screenSelector').length, 0, 'no screen selector while running');

        $("#resetButton").click();
        assert.equal($('#design-mode-dimmed').length, 0, 'transparency layer not visible after resetting');
        assert.equal($('#screenSelector:disabled').length, 0, 'screen select enabled after');

        Applab.onPuzzleComplete();
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },

    {
      description: "version history button works in design mode",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        $("#designModeButton").click();
        assert.equal($('#design-mode-versions-header').is(':visible'), true,
          'version history button is visible');

        $('#design-mode-versions-header').click();
        assert.equal($('.dialog-title:visible').text(), "Version History",
          'version history dialog is visible');

        Applab.onPuzzleComplete();
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
        var designModeViz = $('#designModeViz');
        var newChart = designModeViz.find('.chart');
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
        assert.isFalse(isFaded('#design_chart1'));
        assert.isFalse(isHidden('#chart1'));

        ReactTestUtils.Simulate.click(toggleHidden);
        assert.isTrue(isFaded('#design_chart1'));
        assert.isFalse(isHidden('#chart1'));

        ReactTestUtils.Simulate.click(toggleHidden);
        assert.isFalse(isFaded('#design_chart1'));
        assert.isFalse(isHidden('#chart1'));

        // Delete the chart
        var deleteButton = $('#designWorkspaceBody').find('button:contains(Delete)')[0];
        ReactTestUtils.Simulate.click(deleteButton);
        assert.equal(designModeViz.find('.chart').length, 0);

        Applab.onPuzzleComplete();
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: "exercise TEXTAREA element",
      editCode: true,
      xml: '',

      runBeforeClick: function (assert) {
        $('#designModeButton').click();

        testUtils.dragToVisualization('TEXT_AREA', 0, 0);

        var designModeViz = $('#designModeViz');
        assertPropertyRowValue(0, 'id', 'text_area1', assert);
        assertPropertyRowValue(1, 'text', '', assert);
        assertPropertyRowValue(2, 'width (px)', 200, assert);
        assertPropertyRowValue(3, 'height (px)', 100, assert);
        assertPropertyRowValue(4, 'x position (px)', 0, assert);
        assertPropertyRowValue(5, 'y position (px)', 0, assert);
        assertPropertyRowValue(6, 'text color', '#000000', assert);
        assertPropertyRowValue(7, 'background color', '#ffffff', assert);
        assertPropertyRowValue(8, 'font size (px)', 14, assert);

        var textArea = designModeViz.find('.textArea');
        var manipulator = textArea.parent();
        assert.isTrue(manipulator.hasClass('ui-draggable'), 'text area is draggable');
        assert.isTrue(manipulator.hasClass('ui-resizable'), 'text area is resizable');

        textArea = $('#propertyRowContainer textarea').first()[0];
        ReactTestUtils.Simulate.change(textArea,
          { target: { value: 'Text 1' } });

        assert.equal($('#propertyRowContainer textarea').first().val(), 'Text 1', 'Text should be written');
        assert.equal($('#designModeViz .textArea').length, 1, 'element should exist');
        assert.equal($('#designModeViz .textArea').attr('id'), 'design_text_area1', 'element should be named');
        assert.equal($('#designModeViz .textArea').first().prop('innerHTML'), 'Text 1', 'should have one line of text');

        ReactTestUtils.Simulate.change(textArea,
          { target: { value: 'Text1\nText2\nText3'}});

        assert.equal($('#designModeViz .textArea').first().prop('innerHTML'),
          'Text1<div>Text2</div><div>Text3</div>');

        ReactTestUtils.Simulate.change(textArea,
          { target: { value: 'Text1\n\nText2' } });

        assert.equal($('#designModeViz .textArea').first().prop('innerHTML'),
          'Text1<div><br></div><div>Text2</div>');

        $('#design_screen1').click();
        assertPropertyRowValue(0, 'id', 'screen1', assert);

        //Clicking on the text area should bring back the text area
        $('#designModeViz .textArea').click();
        assertPropertyRowValue(0, 'id', 'text_area1', assert);

        //Clicking on one of the divs in the text area should still bring back the text area
        $('#design_screen1').click();
        $('#designModeViz .textArea div').first().click();
        assertPropertyRowValue(0, 'id', 'text_area1', assert);
        assert.equal($('#propertyRowContainer textarea').first().val(), 'Text1\n\nText2', 'Text should be written');

        // Reacquire reference to textArea, since it was unmounted when we
        // selected the screen.
        textArea = $('#propertyRowContainer textarea').first()[0];
        ReactTestUtils.Simulate.change(textArea,
          { target: { value: 'I said hey-hey-hey-hey\n\What\'s going on?' } });
        assert.equal($('#designModeViz .textArea').first().prop('innerHTML'),
          'I said hey-hey-hey-hey<div>What\'s going on?</div>');

        Applab.onPuzzleComplete();
      },
      expected: {
        result: true,
        testResults: undefined
      }
    },

    {
      description: "exercise IMAGE element",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {

        // Switch to design mode
        var designModeButton = $('#designModeButton');
        designModeButton.click();

        // Add an image
        testUtils.dragToVisualization('IMAGE', 0, 0);
        var designModeViz = $('#designModeViz');
        var newImage = designModeViz.find('img');
        assert.equal(newImage.length, 1);

        // Validate property rows and some default values
        assertPropertyRowValue(0, 'id', 'image1', assert);
        assertPropertyRowValue(1, 'width (px)', 100, assert);
        assertPropertyRowValue(2, 'height (px)', 100, assert);
        assertPropertyRowExists(3, 'x position (px)', assert);
        assertPropertyRowExists(4, 'y position (px)', assert);
        assertPropertyRowExists(5, 'image Choose...', assert);
        assertPropertyRowExists(6, 'fit imagefillcovercontainnone', assert);
        assertPropertyRowExists(7, 'hidden', assert);
        assertPropertyRowExists(8, 'depth', assert);

        // Make sure it's draggable
        var manipulator = newImage.parent();
        assert.isTrue(manipulator.hasClass('ui-draggable'), 'image is draggable');

        // Make sure it's resizable
        assert.isTrue(manipulator.hasClass('ui-resizable'), 'image is resizable');

        // Hide/show the image
        var toggleHidden = $('.custom-checkbox')[0];
        assert.isFalse(isFaded('#design_image1'));
        assert.isFalse(isHidden('#image1'));

        ReactTestUtils.Simulate.click(toggleHidden);
        assert.isTrue(isFaded('#design_image1'));
        assert.isFalse(isHidden('#image1'));

        ReactTestUtils.Simulate.click(toggleHidden);
        assert.isFalse(isFaded('#design_image1'));
        assert.isFalse(isHidden('#image1'));

        // Delete the image
        var deleteButton = $('#designWorkspaceBody').find('button:contains(Delete)')[0];
        ReactTestUtils.Simulate.click(deleteButton);
        assert.equal(designModeViz.find('img').length, 0);

        Applab.onPuzzleComplete();
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: "exercise duplicate button on elements",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {

        // Switch to design mode
        var designModeButton = $('#designModeButton');
        designModeButton.click();

        // Add an image
        testUtils.dragToVisualization('IMAGE', 0, 0);
        var designModeViz = $('#designModeViz');
        var newImage = designModeViz.find('img');
        assert.equal(newImage.length, 1);

        // Duplicate the image
        var imageDuplicateButton = $('#designWorkspaceBody').find('button:contains(Duplicate)')[0];
        ReactTestUtils.Simulate.click(imageDuplicateButton);

        // Assert position and ID
        var images = designModeViz.find('img');
        assert.equal(images.length, 2);
        var image2 = images[1];
        assert.equal(parseInt(image2.style.left), 10);
        assert.equal(parseInt(image2.style.top), 10);
        assert.equal(image2.id, 'design_image2');

        // Add a chart
        testUtils.dragToVisualization('CHART', 0, 0);
        var newChart = designModeViz.find('.chart');
        assert.equal(newChart.length, 1);

        // Duplicate the chart
        var chartDuplicateButton = $('#designWorkspaceBody').find('button:contains(Duplicate)')[0];
        ReactTestUtils.Simulate.click(chartDuplicateButton);
        assert.equal(designModeViz.find('.chart').length, 2);

        // Assert position and ID
        var charts = designModeViz.find('.chart');
        assert.equal(charts.length, 2);
        var chart2 = charts[1];
        assert.equal(parseInt(chart2.style.left), 10);
        assert.equal(parseInt(chart2.style.top), 10);
        assert.equal(chart2.id, 'design_chart2');

        // Add a button at the edge of the container
        var maxLeft = designModeViz.outerWidth();
        var maxTop = designModeViz.outerHeight();

        // Relies on default button dimensions (80px width, 30px height)
        testUtils.dragToVisualization('BUTTON', maxLeft - 80, maxTop - 30);

        var newButton = designModeViz.find('button');
        assert.equal(newButton.length, 1);

        // Duplicate the button
        var buttonDuplicateButton = $('#designWorkspaceBody').find('button:contains(Duplicate)')[0];
        ReactTestUtils.Simulate.click(buttonDuplicateButton);
        assert.equal(designModeViz.find('button').length, 2);

        // Test containment in design mode area by asserting position and ID
        // Should be the same as the original button
        var buttons = designModeViz.find('button');
        assert.equal(buttons.length, 2);
        var button2 = buttons[1];
        assert.equal(parseInt(button2.style.left), maxLeft - 80);
        assert.equal(parseInt(button2.style.top), maxTop - 30);

        Applab.onPuzzleComplete();
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: "exercise copy paste button on elements",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {

        // Switch to design mode
        var designModeButton = $('#designModeButton');
        designModeButton.click();

        // Add an image
        testUtils.dragToVisualization('IMAGE', 0, 0);
        var designModeViz = $('#designModeViz');
        var newImage = designModeViz.find('img');
        assert.equal(newImage.length, 1);

        // Copy and paste the image
        var copy = testUtils.createKeyEvent('keydown', {which: 67, altKey: true});
        var paste = testUtils.createKeyEvent('keydown', {which: 86, altKey: true});

        var designModeElement = document.getElementById('designModeViz');
        designModeElement.dispatchEvent(copy);
        designModeElement.dispatchEvent(paste);

        // Assert position and ID
        var images = designModeViz.find('img');
        assert.equal(images.length, 2);
        var image2 = images[1];
        assert.equal(parseInt(image2.style.left), 10);
        assert.equal(parseInt(image2.style.top), 10);
        assert.equal(image2.id, 'design_image2');

        // Copy and paste again
        designModeElement.dispatchEvent(copy);
        designModeElement.dispatchEvent(paste);

        // Assert position and ID
        images = designModeViz.find('img');
        assert.equal(images.length, 3);
        var image3 = images[2];
        assert.equal(parseInt(image3.style.left), 20);
        assert.equal(parseInt(image3.style.top), 20);
        assert.equal(image3.id, 'design_image3');

        // Add a button at the edge of the container
        var maxLeft = designModeViz.outerWidth();
        var maxTop = designModeViz.outerHeight();

        // Relies on default button dimensions (80px width, 30px height)
        testUtils.dragToVisualization('BUTTON', maxLeft - 80, maxTop - 30);

        var newButton = designModeViz.find('button');
        assert.equal(newButton.length, 1);
        newButton[0].focus();

        // Copy and paste
        designModeElement.dispatchEvent(copy);
        designModeElement.dispatchEvent(paste);

        // Test containment in design mode area by asserting position and ID
        // Should be the same as the original button
        var buttons = designModeViz.find('button');
        assert.equal(buttons.length, 2);
        var button2 = buttons[1];
        assert.equal(parseInt(button2.style.left), maxLeft - 80);
        assert.equal(parseInt(button2.style.top), maxTop - 30);

        Applab.onPuzzleComplete();
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: "images have correct urls",
      editCode: true,
      xml: '',
      levelHtml: '' +
        '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" class="appModern" style="width: 320px; height: 450px; display: block;">' +
          '<div class="screen" tabindex="1" id="screen1" style="display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;">' +
            '<img src="/v3/assets/Adks1c9Ko6WdR2PuwkA6cw/red.Png" id="image1" data-canonical-image-url="red.Png" style="height: 105px; width: 100px; position: absolute; left: 10px; top: 10px; margin: 0px;" />' +
            '<button id="button1" data-canonical-image-url="yellow.png" style="padding: 0px; margin: 0px; height: 120px; width: 120px; font-size: 14px; color: rgb(255, 255, 255); position: absolute; left: 120px; top: 130px; ' +
                'background-image: url(http://localhost-studio.code.org:3000/v3/assets/Adks1c9Ko6WdR2PuwkA6cw/yellow.png); background-color: rgb(26, 188, 156); background-size: 120px 120px;">Button</button>' +
            '<img src="" id="image2" style="height: 100px; width: 100px; position: absolute; left: 20px; top: 20px; margin: 0px;" />' +
            '<img src="/blockly/media/1x1.gif" id="image3" data-canonical-image-url="" style="height: 100px; width: 100px; position: absolute; left: 30px; top: 155px; margin: 0px;" />' +
      '</div>' +
        '</div>',
      runBeforeClick: function (assert) {
        // a remixed image with previous channel id in its src.
        var redImage = '/v3/assets/applab-channel-id/red.Png';
        assert.equal($('#design_image1').attr('src'), redImage, 'after init, design mode img src prefixed with new channel id');
        assert.equal($('#image1').attr('src'), redImage, 'after init, code mode img src prefixed with new channel id');

        // a remixed button with a previous channel id in its background image url.
        var yellowImageUrl = '/v3/assets/applab-channel-id/yellow.png';
        assert.include($('#design_button1').css('background-image'), yellowImageUrl,
          'after init, design mode button image prefixed with new channel id: ' + $('#design_button1').css('background-image'));
        assert.include($('#button1').css('background-image'), yellowImageUrl,
          'after init, code mode button image prefixed with new channel id: ' + $('#button1').css('background-image'));

        // a legacy image element whose image url was never set.
        assert.equal($('#design_image2').attr('src'), '/blockly/media/1x1.gif', 'after init, in design mode, empty image has placeholder image src');
        assert.equal($('#design_image2').attr('data-canonical-image-url'), '', 'after init, in design mode, empty image has empty canonical image url');
        assert.equal($('#image2').attr('src'), '/blockly/media/1x1.gif', 'after init, in code mode, empty image has placeholder image src');

        // a legacy image element whose image url was set to ''.
        assert.equal($('#design_image3').attr('src'), '/blockly/media/1x1.gif', 'after init, in design mode, erased image has placeholder image src');
        assert.equal($('#design_image3').attr('data-canonical-image-url'), '', 'after init, in design mode, erased image has empty canonical image url');
        assert.equal($('#image3').attr('src'), '/blockly/media/1x1.gif', 'after init, in code mode, erased image has placeholder image src');
        var images = $('#designModeViz').find('img');
        assert.equal(images.length, 3, "there are three images in design mode");

        // a new image element.
        testUtils.dragToVisualization('IMAGE', 100, 100);
        assert.equal($('#design_image4').attr('src'), '/blockly/media/1x1.gif', 'in design mode, new image has placeholder image src');
        assert.equal($('#design_image4').attr('data-canonical-image-url'), '', 'in design mode, new image has empty canonical image url');
        images = $('#designModeViz').find('img');
        assert.equal(images.length, 4, "there are four images in design mode");

        tickWrapper.runOnAppTick(Applab, 1, function () {
          assert.equal($('#design_image1').attr('src'), redImage, 'after run, design mode img src prefixed with new channel id');
          assert.equal($('#image1').attr('src'), redImage, 'after run, code mode img src prefixed with new channel id');

          assert.include($('#design_button1').css('background-image'), yellowImageUrl, 'after run, design mode button image prefixed with new channel id');
          assert.include($('#button1').css('background-image'), yellowImageUrl, 'after run, code mode button image prefixed with new channel id');

          assert.equal($('#image2').attr('src'), '/blockly/media/1x1.gif', 'after run, empty image has placeholder image src');
          assert.equal($('#image3').attr('src'), '/blockly/media/1x1.gif', 'after run, erased image has placeholder image src');
          assert.equal($('#image4').attr('src'), '/blockly/media/1x1.gif', 'arter run, new image has placeholder image src');


          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: "images reset when image is cleared",
      editCode: true,
      xml: '',
      // Use an asset path which we can access so that image loading will succeed
      assetPathPrefix: '/base/test/integration/assets/',
      levelHtml: '' +
      '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" class="appModern" style="width: 320px; height: 450px; display: block;">' +
        '<div class="screen" tabindex="1" id="screen1" style="display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;">' +
          '<img src="/v3/assets/Adks1c9Ko6WdR2PuwkA6cw/flappy_promo.png" id="image1" data-canonical-image-url="flappy_promo.png" style="height: 105px; width: 110px; position: absolute; left: 10px; top: 10px; margin: 0px;" />' +
        '</div>' +
      '</div>',
      runBeforeClick: function (assert) {
        var flappyUrl = '/base/test/integration/assets/applab-channel-id/flappy_promo.png';
        assert.equal($('#design_image1').attr('src'), flappyUrl, 'after init, design mode img src prefixed with new prefix');
        assert.equal($('#image1').attr('src'), flappyUrl, 'after init, code mode img src prefixed with new prefix');

        // Enter design mode, and select image
        $('#designModeButton').click();
        $('#design_image1').click();

        assertPropertyRowExists(5, 'image Choose...', assert);

        var input = $('#propertyRowContainer input').eq(5)[0];
        var designImage = $('#design_image1')[0];
        assert.equal(designImage.style.width, '110px');
        assert.equal(designImage.style.height, '105px');
        assert(!/1x1.gif$/.test(designImage.src), 'src became 1x1.gif');
        assert.equal(designImage.getAttribute('data-canonical-image-url'), 'flappy_promo.png');

        ReactTestUtils.Simulate.change(input, { target: { value: '' } });
        assert.equal(input.value, '');

        assert(/1x1.gif$/.test(designImage.src), 'src became 1x1.gif');
        assert.equal(designImage.getAttribute('data-canonical-image-url'), '');

        Applab.onPuzzleComplete();
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: "remixed images are sized properly",
      editCode: true,
      xml: '',
      // Use an asset path which we can access so that image loading will succeed
      assetPathPrefix: '/base/test/integration/assets/',
      levelHtml: '' +
      '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" class="appModern" style="width: 320px; height: 450px; display: block;">' +
        '<div class="screen" tabindex="1" id="screen1" style="display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;">' +
          '<img src="/v3/assets/Adks1c9Ko6WdR2PuwkA6cw/flappy_promo.png" id="image1" data-canonical-image-url="flappy_promo.png" style="height: 105px; width: 100px; position: absolute; left: 10px; top: 10px; margin: 0px;" />' +
          '<button id="button1" data-canonical-image-url="phone_purple.png" style="padding: 0px; margin: 0px; height: 130px; width: 120px; font-size: 14px; color: rgb(255, 255, 255); position: absolute; left: 120px; top: 130px; ' +
              'background-image: url(http://localhost-studio.code.org:3000/v3/assets/Adks1c9Ko6WdR2PuwkA6cw/phone_purple.png); background-color: rgb(26, 188, 156); background-size: 120px 130px;">Button</button>' +
        '</div>' +
      '</div>',
      runBeforeClick: function (assert) {
        var flappyUrl = '/base/test/integration/assets/applab-channel-id/flappy_promo.png';
        assert.equal($('#design_image1').attr('src'), flappyUrl, 'after init, design mode img src prefixed with new prefix');
        assert.equal($('#image1').attr('src'), flappyUrl, 'after init, code mode img src prefixed with new prefix');

        var phoneUrl = '/base/test/integration/assets/applab-channel-id/phone_purple.png';
        var designButtonBg = $('#design_button1').css('background-image');
        assert.include(
          designButtonBg,
          phoneUrl,
          'after init, design mode button image url has new prefix: '+phoneUrl+' vs '+designButtonBg
        );
        assert.include($('#button1').css('background-image'), phoneUrl, 'after init, code mode button image url has new prefix');

        var img = new Image();
        img.src = flappyUrl;
        img.onload = function () {
          // There's no guarantee that we hit this onload after the onload in
          // designMode.js, so the styles won't always be set immediately.
          // Instead, wait until the next tick

          // add a completion on timeout since this is a freeplay level
          setTimeout(function () {
            var buttonElement = $('#design_button1')[0];
            assert.include(buttonElement.style.backgroundImage, phoneUrl, 'on load, design mode button image is unchanged');
            assert.equal(buttonElement.style.width, '120px', 'on load, design mode button width is unchanged');
            assert.equal(buttonElement.style.height, '130px', 'on load, design mode button height is unchanged');
            assert.equal(buttonElement.style.backgroundSize, '120px 130px', 'on load, design mode background size is unchanged');

            buttonElement = $('#button1')[0];
            assert.include(buttonElement.style.backgroundImage, phoneUrl, 'on load, code mode button image is unchanged');
            assert.equal(buttonElement.style.width, '120px', 'on load, code mode button width is unchanged');
            assert.equal(buttonElement.style.height, '130px', 'on load, code mode button height is unchanged');
            assert.equal(buttonElement.style.backgroundSize, '120px 130px', 'on load, code mode background size is unchanged');

            var imageElement = $('#design_image1')[0];
            assert.include(imageElement.src, flappyUrl, 'on load, design mode image source is unchanged');
            assert.equal(imageElement.style.width, '100px', 'on load, design mode image width is unchanged');
            assert.equal(imageElement.style.height, '105px', 'on load, design mode image height is unchanged');

            imageElement = $('#image1')[0];
            assert.include(imageElement.src, flappyUrl, 'on load, code mode image source is unchanged');
            assert.equal(imageElement.style.width, '100px', 'on load, code mode image width is unchanged');
            assert.equal(imageElement.style.height, '105px', 'on load, code mode image height is unchanged');

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
      }
    },

    {
      description: "element ids are validated",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {

        // Switch to design mode
        var designModeButton = $('#designModeButton');
        designModeButton.click();

        // Add two buttons
        testUtils.dragToVisualization('BUTTON', 0, 0);
        testUtils.dragToVisualization('BUTTON', 100, 100);
        var designModeViz = $('#designModeViz');
        var buttons = designModeViz.find('button');
        assert.equal(buttons.length, 2, "there are two buttons in design mode");
        var firstButton = buttons[0];
        var targetButton = buttons[1];
        assert.equal(firstButton.id, "design_button1", "first button is design_button1");
        assert.equal(targetButton.id, "design_button2", "second button is design_button2");
        assertPropertyRowValue(0, 'id', 'button2', assert, "button2 is selected property tab");

        $('#runButton').click();
        $('#resetButton').click();
        assert($('#divApplab #button1'), "button1 appears in divApplab after Run/Reset");
        assert($('#divApplab #button2'), "button2 appears in divApplab after Run/Reset");
        assertPropertyRowValue(0, 'id', 'button2', assert, "button2 is still selected in property tab");

        // Renaming to 'button' succeeds.
        var idInput = $("#propertyRowContainer input")[0];
        ReactTestUtils.Simulate.change(idInput, { target: { value: 'button' } });
        assert.equal(targetButton.id, "design_button", "target button has id 'design_button'");
        assert(!idInput.style.backgroundColor, "id input 'button' has no background color");

        // Renaming to button3 succeeds.
        ReactTestUtils.Simulate.change(idInput, { target: { value: 'button3' } });
        assert.equal(targetButton.id, "design_button3", "target button has id 'design_button3'");
        assert(!idInput.style.backgroundColor, "id input 'button3' has no background color");

        // Renaming to button2 succeeds, even though button2 exists inside divApplab.
        assert($('#divApplab #button2'), "button2 still appears inside divApplab");
        ReactTestUtils.Simulate.change(idInput, { target: { value: 'button2' } });
        assert.equal(targetButton.id, "design_button2", "target button has id 'design_button2'");
        assert(!idInput.style.backgroundColor, "id input 'button2' has no background color");

        // Renaming to duplicate id 'button1' fails.
        ReactTestUtils.Simulate.change(idInput, { target: { value: 'button1' } });
        assert.equal(targetButton.id, 'design_button2', "target button still has id 'design_button2'");
        assert.equal(idInput.style.backgroundColor, "rgb(255, 204, 204)", "duplicate id input 'button1' has light red background color");

        // idInput reverts to previous value on blur.
        ReactTestUtils.Simulate.blur(idInput);
        assert.equal(idInput.value, "button2", "id input reverts to 'button2'");
        assert(!idInput.style.backgroundColor, "id input has no background color after losing focus");

        // Renaming to button4 succeeds.
        ReactTestUtils.Simulate.change(idInput, { target: { value: 'button4' } });
        assert.equal(targetButton.id, "design_button4", "target button has id 'design_button4'");
        assert(!idInput.style.backgroundColor, "id input 'button4' has no background color");

        // Renaming to divApplab fails.
        ReactTestUtils.Simulate.change(idInput, { target: { value: 'divApplab' } });
        assert.equal(targetButton.id, "design_button4", "target button still has id 'design_button4'");
        assert.equal(idInput.style.backgroundColor, "rgb(255, 204, 204)", "invalid id input 'divApplab' has light red background color");

        // Renaming to button5 succeeds.
        ReactTestUtils.Simulate.change(idInput, { target: { value: 'button5' } });
        assert.equal(targetButton.id, "design_button5", "target button has id 'design_button4'");
        assert(!idInput.style.backgroundColor, "id input 'button5' has no background color");

        // Renaming to runButton fails.
        ReactTestUtils.Simulate.change(idInput, { target: { value: 'runButton' } });
        assert.equal(targetButton.id, "design_button5", "target button still has id 'design_button5, not runButton'");
        assert.equal(idInput.style.backgroundColor, "rgb(255, 204, 204)", "invalid id input 'runButton' has light red background color");

        // Renaming to something with the 'design_' prefix fails.
        ReactTestUtils.Simulate.change(idInput, { target: { value: 'design_button' } });
        assert.equal(targetButton.id, "design_button5", "target button still has id 'design_button5, not design_button'");
        assert.equal(idInput.style.backgroundColor, "rgb(255, 204, 204)", "invalid id input 'design_button' has light red background color");

        // Renaming to a blacklisted element id fails.
        ReactTestUtils.Simulate.change(idInput, { target: { value: 'submitButton' } });
        assert.equal(targetButton.id, "design_button5", "target button still has id 'design_button5, not submitButton'");
        assert.equal(idInput.style.backgroundColor, "rgb(255, 204, 204)", "invalid id input 'submitButton' has light red background color");

        // Make sure it works for screens too.
        testUtils.dragToVisualization('SCREEN', 100, 100);
        var screens = designModeViz.find('.screen');
        assert.equal(screens.length, 2, "there are two screens in design mode");
        var firstScreen = screens[0];
        var targetScreen = screens[1];
        assert.equal(firstScreen.id, "design_screen1", "first screen is design_screen1");
        assert.equal(targetScreen.id, "design_screen2", "second screen is design_screen2");

        // Renaming to duplicate id 'screen1' fails.
        idInput = $("#propertyRowContainer input")[0];
        ReactTestUtils.Simulate.change(idInput, { target: { value: 'screen1' } });
        assert.equal(targetScreen.id, "design_screen2", "target screen still has id 'design_screen2'");
        assert.equal(idInput.style.backgroundColor, "rgb(255, 204, 204)", "duplicate id input 'screen1' has light red background color");

        Applab.onPuzzleComplete();
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: "can use element select to switch elements",
      editCode: true,
      xml: '',
      levelHtml: '' +
      '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" class="appModern" style="width: 320px; height: 450px; display: block;">' +
      '<div class="screen" tabindex="1" id="screen1" style="display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;">' +
      '<button id="button1" style="padding: 0px; margin: 0px; height: 130px; width: 120px; font-size: 14px; color: rgb(255, 255, 255); position: absolute; left: 120px; top: 130px;">Button 1</button>' +
      '<button id="button2" style="padding: 0px; margin: 0px; height: 130px; width: 120px; font-size: 14px; color: rgb(255, 255, 255); position: absolute; left: 120px; top: 180px;">Button 2</button>' +
      '</div>' +
      '</div>',
      runBeforeClick: function (assert) {
        var elementSelect = $('#emptyTab').find('select')[0];

        // Switch to design mode
        var designModeButton = $('#designModeButton');
        designModeButton.click();

        assertPropertyRowValue(0, 'id', 'screen1', assert);

        function selectElementAndValidate(id) {
          ReactTestUtils.Simulate.change(elementSelect, {
            target: {value: id}
          });
          assertPropertyRowValue(0, 'id', id, assert);
        }

        selectElementAndValidate('button1');
        selectElementAndValidate('screen1');

        Applab.onPuzzleComplete();
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: "new radio buttons have default group ids",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {

        // Switch to design mode
        $('#designModeButton').click();

        // Add first radio button
        testUtils.dragToVisualization('RADIO_BUTTON', 0, 0);
        var radio1 = $("#design_radio_button1")[0];

        // Validate that a default group id got generated and shown in properties tab
        assert.equal(radio1.name, 'radio_group1', "default group id generated for new radio button");
        assertPropertyRowValue(1, 'group id', 'radio_group1', assert);

        // Add second radio button
        testUtils.dragToVisualization('RADIO_BUTTON', 0, 0);
        var radio2 = $('#design_radio_button2')[0];

        // Validate that it has the same group id as the first radio button
        assert.equal(radio2.name, radio1.name, "new radio button reused group id of existing radio button");
        assertPropertyRowValue(1, 'group id', 'radio_group1', assert);

        // Change the group id of radio button 2
        radio2.name = "radio_group_changed";

        // Add third radio button
        testUtils.dragToVisualization('RADIO_BUTTON', 0, 0);
        var radio3 = $('#design_radio_button3')[0];

        // Validate that it has the same group id as the most recently created radio button, i.e. radio button 2
        assert.equal(radio3.name, radio2.name, "new radio button reused updated group id of existing radio button");
        assertPropertyRowValue(1, 'group id', 'radio_group_changed', assert);

        // Add a new screen
        testUtils.dragToVisualization('SCREEN', 10, 10);

        // Add fourth radio button
        testUtils.dragToVisualization('RADIO_BUTTON', 0, 0);
        var radio4 = $('#design_radio_button4')[0];

        // Validate that a new group id got generated, and not group id from the other screen
        assert.equal(radio4.name, "radio_group2");
        assertPropertyRowValue(1, 'group id', 'radio_group2', assert);

        Applab.onPuzzleComplete();
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: "dragging out of bounds to delete",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        // Turn off animations so we don't have to wait for them
        $.fx.off = true;

        // Switch to design mode
        $('#designModeButton').click();
        var designModeViz = $('#designModeViz');

        // Add a bunch of elements
        testUtils.dragToVisualization('BUTTON', 0, 0);
        testUtils.dragToVisualization('IMAGE', 50, 100);
        testUtils.dragToVisualization('LABEL', 200, 150);
        testUtils.dragToVisualization('TEXT_INPUT', 100, 200);

        // Verify the elements are there
        var button = designModeViz.find('#design_button1');
        var image = designModeViz.find('#design_image1');
        var label = designModeViz.find('#design_label1');
        var text_input = designModeViz.find('#design_text_input1');
        assert.equal(button.length, 1, "button was dragged on screen");
        assert.equal(image.length, 1), "image was dragged on screen";
        assert.equal(label.length, 1, "label was dragged on screen");
        assert.equal(text_input.length, 1, "text input was dragged on screen");

        // Drag button out of the app towards the right and verify element got deleted
        dragElement(button[0], 350, 0);
        assert.equal(designModeViz.find('#design_button1').length, 0, "button was deleted");

        // TODO(dave): re-enable this section after we move to headless chrome.
        // We don't know why this section started failing in phantomjs on
        // circle, but it appears to pass in headless chrome on circle.

        // Drag image out of the app towards the bottom and verify element got deleted
        // dragElement(image[0], 0, 550);
        // assert.equal(designModeViz.find('#design_image1').length, 0, "image was deleted");

        // Drag label out of the app towards the right and bottom and verify element got deleted
        dragElement(label[0], 200, 350);
        assert.equal(designModeViz.find('#design_label1').length, 0, "label was deleted");

        // Drag the text input within the app and verify element did not get deleted
        dragElement(text_input[0], 10, 10);
        text_input = designModeViz.find('#design_text_input1');
        assert.equal(text_input.length, 1, "text input was not deleted");

        // Drag the text input slightly outside of the app and verify element is not pushed back in
        dragElement(text_input[0], 50, 230);
        text_input = designModeViz.find('#design_text_input1');
        assert.equal(text_input.length, 1, "text input was not deleted");
        assert.equal(text_input.parent().position().left, 160, "text input element left position is 160");
        assert.equal(text_input.parent().position().top, 440, "text input element top position is 440");
        assertPropertyRowValue(4, 'x position (px)', 160, assert, "text input x pos property value is 160");
        assertPropertyRowValue(5, 'y position (px)', 440, assert, "text input y pos property value is 440");

        // Drag the text input outside of the app and verify it got deleted
        dragElement(text_input[0], 210, 50);
        text_input = designModeViz.find('#design_text_input1');
        assert.equal(text_input.length, 0, "text input was deleted");

        Applab.onPuzzleComplete();

      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
  ]
};
