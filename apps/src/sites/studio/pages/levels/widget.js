/**
 * @file JavaScript loaded in all Widget-type levels.
 */
/* global appOptions */
import $ from 'jquery';
import React from 'react';
import {
  showInstructionsDialog,
  showDialog,
  processResults
} from '@cdo/apps/code-studio/levels/dialogHelper';
import { registerGetResult } from '@cdo/apps/code-studio/levels/codeStudioLevels';
import { setupApp } from '@cdo/apps/code-studio/initApp/loadApp';
import { StartOverDialog } from '@cdo/apps/lib/ui/LegacyDialogContents';

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
window.dashboard.widget = {
  setupWidgetLevel: setupWidgetLevel,
  // used by pixelation widget
  showStartOverDialog: callback => showDialog(<StartOverDialog/>, callback),
  // used eby frequency, vigenere, and pixelation widgets
  processResults: processResults
};

// On load (note - widget-specific setup may happen before this!)
$(document).ready(function () {
  $('#bubble').click(showInstructionsDialog);
});
