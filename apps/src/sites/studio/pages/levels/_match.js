import React from 'react';

import {showDialog} from '@cdo/apps/code-studio/levels/dialogHelper';
import Match from '@cdo/apps/code-studio/levels/match';
import {LegacyMatchAngiGifDialog} from '@cdo/apps/lib/ui/LegacyDialogContents';
import {reportTeacherReviewingStudentNonLabLevel} from '@cdo/apps/metrics/utils/analyticsUtils';

window.Match = Match;

$(function () {
  // This setting (pre_title) is used by only 3 levels in our application.
  if (appOptions.dialog.preTitle) {
    // Note: This dialog depends on the presence of some haml, found in _dialog.html.haml
    window.setTimeout(() => showDialog(<LegacyMatchAngiGifDialog />), 1000);
  }

  reportTeacherReviewingStudentNonLabLevel();
});
