/* global appOptions */
import React from 'react';
import {showDialog} from '@cdo/apps/code-studio/levels/dialogHelper';
import {LegacyMatchAngiGifDialog} from '@cdo/apps/lib/ui/LegacyDialogContents';

import Match from '@cdo/apps/code-studio/levels/match';
window.Match = Match;

$(function() {
  // This setting (pre_title) is used by only 3 levels in our application.
  if (appOptions.dialog.preTitle) {
    // Note: This dialog depends on the presence of some haml, found in _dialog.html.haml
    window.setTimeout(() => showDialog(<LegacyMatchAngiGifDialog />), 1000);
  }
});
