/**
 * @file JavaScript loaded in all Widget-type levels.
 */
/* global apps, appOptions */
import $ from 'jquery';
import _ from 'lodash';
import { showInstructionsDialog } from '@cdo/apps/code-studio/levels/dialogHelper';
import { registerGetResult } from '@cdo/apps/code-studio/levels/codeStudioLevels';

function setupWidgetLevel() {
  window.script_path = location.pathname;
  apps.setupApp(appOptions);

  appOptions.showInstructionsWrapper(showInstructionsDialog);
  registerGetResult();
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
  $('#bubble').click(showInstructionsDialog);
});
