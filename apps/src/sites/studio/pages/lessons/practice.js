import React from 'react';
import {Provider} from 'react-redux';

import {getStore} from '@cdo/apps/redux';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';
import {LessonPractice} from '@cdo/apps/aiTutor/views/lessonPractice/LessonPractice';

$(document).ready(() => {
  const lessonPracticeData = getScriptData('lessonPracticeData');
  console.log('lessonPracticeData', lessonPracticeData);
  createReactRoot(
    <Provider store={getStore()}>
      <LessonPractice
        lessonName={lessonPracticeData.lessonName}
        lessonSummary={lessonPracticeData.lessonSummary}
        vocabulary={lessonPracticeData.vocabulary}
      />
    </Provider>,
    document.getElementById('lesson-practice-container')
  );
});
