import React from 'react';
import {Provider} from 'react-redux';

import {LessonPractice} from '@cdo/apps/aiTutor/views/lessonPractice/LessonPractice';
import {getStore} from '@cdo/apps/redux';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const lessonPracticeData = getScriptData('lessonPracticeData');
  createReactRoot(
    <Provider store={getStore()}>
      <LessonPractice lessonPracticeData={lessonPracticeData} />
    </Provider>,
    document.getElementById('lesson-practice-container'),
    {
      legacyReactDomRender: true,
    }
  );
});
