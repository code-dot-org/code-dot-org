/**
 * @file JavaScript loaded in all Widget-type levels.
 */
/* global apps, appOptions, dashboard */
'use strict';

import $ from 'jquery';
var _ = require('lodash');

function setupWidgetLevel() {
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
}

// Add globals
window.CodeMirror = require('codemirror');
window.dashboard = window.dashboard || {};
_.extend(window.dashboard, {
  setupWidgetLevel: setupWidgetLevel
});

// On load (note - widget-specific setup may happen before this!)
$(document).ready(function () {
  $('#bubble').click(dashboard.dialog.showInstructionsDialog);
});
