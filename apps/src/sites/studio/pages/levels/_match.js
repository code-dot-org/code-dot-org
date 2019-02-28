/* global appOptions */
import React from 'react';
import {registerGetResult} from '@cdo/apps/code-studio/levels/codeStudioLevels';
import {showDialog} from '@cdo/apps/code-studio/levels/dialogHelper';
import {
  MatchAngiGifDialog,
  MatchErrorDialog
} from '@cdo/apps/lib/ui/LegacyDialogContents';

import {initMatch} from '@cdo/apps/code-studio/levels/match';

$(function() {
  // This setting (pre_title) is used by only 3 levels in our application.
  if (appOptions.dialog.preTitle) {
    // Note: This dialog depends on the presence of some haml, found in _dialog.html.haml
    window.setTimeout(() => showDialog(<MatchAngiGifDialog />), 1000);
  }

  initMatch(true);
});

registerGetResult(() => {
  let wrongAnswer = false;

  const elements = $('#slots li');

  const response = [];

  for (let index = 0; index < elements.length; index++) {
    const originalIndex = elements[index].getAttribute('originalIndex');
    response.push(originalIndex);
    if (originalIndex === null) {
      // nothing dragged in this slot yet
      wrongAnswer = true;

      $('#xmark_' + index).hide();
    } else if (originalIndex !== String(index)) {
      // wrong answer
      wrongAnswer = true;

      $('#xmark_' + index).show();
    } else {
      // correct answer
      $('#xmark_' + index).hide();
    }
  }
  return {
    response: response,
    result: !wrongAnswer,
    errorDialog: wrongAnswer ? <MatchErrorDialog /> : null
  };
});
