/**
 * @file JavaScript loaded in all Widget-type levels.
 */
/* global dashboard */
'use strict';

window.CodeMirror = require('codemirror');

$(document).ready(function () {
  $('#bubble').click(dashboard.dialog.showInstructionsDialog);
});
