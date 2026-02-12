import React from 'react';
import ReactDOM from 'react-dom';

import AiDiffLessonHook from '@cdo/apps/aiDifferentiation/AiDiffLessonHook';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  displayLessonHook();
});

function displayLessonHook() {
  const lessonHookData = getScriptData('artifact');

  ReactDOM.render(
    <AiDiffLessonHook
      title={lessonHookData['title']}
      updated={new Date(lessonHookData['updated_at'])}
      content={lessonHookData['content']['lesson_hook']}
    />,
    document.getElementById('show-container')
  );
}
