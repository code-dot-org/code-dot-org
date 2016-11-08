/**
 * @file JavaScript loaded in all Widget-type levels.
 */
/* global appOptions */
import $ from 'jquery';
import _ from 'lodash';
import { showInstructionsDialog } from '@cdo/apps/code-studio/levels/dialogHelper';
import { registerGetResult } from '@cdo/apps/code-studio/levels/codeStudioLevels';
import {setupApp} from '@cdo/apps/code-studio/initApp/loadApp';

function setupWidgetLevel() {
  window.script_path = location.pathname;
  setupApp(appOptions);

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
