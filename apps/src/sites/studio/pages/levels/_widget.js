/**
 * @file JavaScript loaded in all Widget-type levels.
 */

import $ from 'jquery';
import React from 'react';

import {setupApp} from '@cdo/apps/code-studio/initApp/loadApp';
import {registerGetResult} from '@cdo/apps/code-studio/levels/codeStudioLevels';
import {
  showDialog,
  processResults,
} from '@cdo/apps/code-studio/levels/dialogHelper';
import {
  LegacyStartOverDialog,
  LegacyInstructionsDialog,
} from '@cdo/apps/legacySharedComponents/LegacyDialogContents';
import {reportTeacherReviewingStudentNonLabLevel} from '@cdo/apps/lib/util/analyticsUtils';
import i18n from '@cdo/locale';

export function showInstructionsDialog() {
  showDialog(
    <LegacyInstructionsDialog
      title={i18n.puzzleTitle({
        stage_total: appOptions.level.lesson_total,
        puzzle_number: appOptions.level.puzzle_number,
      })}
      markdown={appOptions.level.longInstructions}
    />
  );
  $('details').details();
}

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
  showStartOverDialog: callback =>
    showDialog(<LegacyStartOverDialog />, callback),
  // used by frequency, vigenere, and pixelation widgets
  processResults: processResults,
};

// On load (note - widget-specific setup may happen before this!)
$(document).ready(function () {
  $('#bubble').click(showInstructionsDialog);

  reportTeacherReviewingStudentNonLabLevel();
});
