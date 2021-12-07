/* global appOptions */
import React from 'react';
import {showDialog} from '@cdo/apps/code-studio/levels/dialogHelper';
import {LegacyMatchAngiGifDialog} from '@cdo/apps/lib/ui/LegacyDialogContents';
import {getStore} from '@cdo/apps/code-studio/redux';
import {setViewType, ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import getScriptData from '@cdo/apps/util/getScriptData';

import Match from '@cdo/apps/code-studio/levels/match';
window.Match = Match;

$(function() {
  const data = getScriptData('match');
  // This setting (pre_title) is used by only 3 levels in our application.
  if (appOptions.dialog.preTitle) {
    // Note: This dialog depends on the presence of some haml, found in _dialog.html.haml
    window.setTimeout(() => showDialog(<LegacyMatchAngiGifDialog />), 1000);
  }

  const store = getStore();

  if (data.is_instructor) {
    store.dispatch(setViewType(ViewType.Instructor));
  }
});
