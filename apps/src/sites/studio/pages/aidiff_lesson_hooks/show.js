import React from 'react';

import AiDiffLessonHook from '@cdo/apps/aiDifferentiation/AiDiffLessonHook';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  displayLessonHook();
});

function displayLessonHook() {
  const lessonHookData = getScriptData('artifact');

  createReactRoot(
    <AiDiffLessonHook
      title={lessonHookData['title']}
      updated={new Date(lessonHookData['updated_at'])}
      content={lessonHookData['content']['lesson_hook']}
    />,
    document.getElementById('show-container'),
    {
      legacyReactDomRender: true,
    }
  );
}
