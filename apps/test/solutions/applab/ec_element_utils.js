

/**
 * A set of tests for blocks in the UI controls section of the toolbox
 */

var elementUtils = require('../../../src/applab/designElements/elementUtils');
var testUtils = require('../../util/testUtils');
var TestResults = require('@cdo/apps/constants').TestResults;
var _ = require('lodash');

module.exports = {
  app: "applab",
  skinId: "applab",
  levelFile: "levels",
  levelId: "ec_simple",
  tests: [
    // These tests exercise the utilities in elementUtils.js. These exist inside
    // a level test so we have an easy way to create elements to test the utils on.
    {
      description: "text area and text input detection works",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        $('#designModeButton').click();
        testUtils.dragToVisualization('BUTTON', 0, 0);
        testUtils.dragToVisualization('LABEL', 0, 0);
        testUtils.dragToVisualization('TEXT_INPUT', 0, 0);
        testUtils.dragToVisualization('CHECKBOX', 0, 0);
        testUtils.dragToVisualization('DROPDOWN', 0, 0);
        testUtils.dragToVisualization('RADIO_BUTTON', 0, 0);
        testUtils.dragToVisualization('TEXT_AREA', 0, 0);
        testUtils.dragToVisualization('IMAGE', 0, 0);
        testUtils.dragToVisualization('CANVAS', 0, 0);
        testUtils.dragToVisualization('SCREEN', 0, 0);
        testUtils.dragToVisualization('CHART', 0, 0);

        testUtils.runOnAppTick(Applab, 2, function () {
          // Text area and text input are detected

          assert(elementUtils.isTextInput($('#text_input1')[0]), "text_input1 is a text input");
          assert(!elementUtils.isContentEditable($('#text_input1')[0]), "text_input1 is not content editable");

          assert(elementUtils.isContentEditable($('#text_area1')[0]), "text_area1 is content editable");
          assert(!elementUtils.isTextInput($('#text_area1')[0]), "text_area1 is not a text input");

          // All other elements are not detected

          assert(!elementUtils.isTextInput($('#button1')[0]), "button1 is not a text input");
          assert(!elementUtils.isContentEditable($('button1')[0]), "button1 is not content editable");

          assert(!elementUtils.isTextInput($('#checkbox1')[0]), "checkbox1 is not a text input");
          assert(!elementUtils.isContentEditable($('checkbox1')[0]), "checkbox1 is not content editable");

          assert(!elementUtils.isTextInput($('#radio_button1')[0]), "radio_button1 is not a text input");
          assert(!elementUtils.isContentEditable($('radio_button1')[0]), "radio_button1 is not content editable");

          assert(!elementUtils.isTextInput($('#image1')[0]), "image1 is not a text input");
          assert(!elementUtils.isContentEditable($('image1')[0]), "image1 is not content editable");

          assert(!elementUtils.isTextInput($('#canvas1')[0]), "canvas1 is not a text input");
          assert(!elementUtils.isContentEditable($('canvas1')[0]), "canvas1 is not content editable");

          assert(!elementUtils.isTextInput($('#chart1')[0]), "chart1 is not a text input");
          assert(!elementUtils.isContentEditable($('chart1')[0]), "chart1 is not content editable");

          assert(!elementUtils.isTextInput($('#dropdown1')[0]), "dropdown1 is not a text input");
          assert(!elementUtils.isContentEditable($('dropdown1')[0]), "dropdown1 is not content editable");

          assert(!elementUtils.isTextInput($('#label1')[0]), "label1 is not a text input");
          assert(!elementUtils.isContentEditable($('label1')[0]), "label1 is not content editable");

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