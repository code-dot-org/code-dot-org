/**
 * @file JavaScript loaded in all Widget-type levels.
 */
/* global apps, appOptions, dashboard */
'use strict';

window.CodeMirror = require('codemirror');

$(document).ready(function () {
  window.script_path = location.pathname;
  apps.setupApp(appOptions);
  appOptions.showInstructionsWrapper(dashboard.dialog.showInstructionsDialog);
  window.getResult = function () {
    return {
      response: 'ok',
      result: true
    };
  };
  window.options = appOptions.level;

  $('#bubble').click(dashboard.dialog.showInstructionsDialog);
});
