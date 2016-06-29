import $ from 'jquery';

/**
 * @file Main entry point for scripts used only in levelbuilder on when editing
 *       studio-type levels.
 */
'use strict';
var CodeMirror = require('codemirror');

// On page load, specifically for this editor page.
$(document).ready(function () {
  var jQuerySuccessConditionBox = $('#level_success_condition');
  if (jQuerySuccessConditionBox.length) {
    CodeMirror.fromTextArea(jQuerySuccessConditionBox.get(0), {
      mode: 'javascript',
      viewportMargin: Infinity,
      matchBrackets: true
    });
  }

  var jQueryFailureConditionBox = $('#level_failure_condition');
  if (jQueryFailureConditionBox.length) {
    CodeMirror.fromTextArea(jQueryFailureConditionBox.get(0), {
      mode: 'javascript',
      viewportMargin: Infinity,
      matchBrackets: true
    });
  }
});
