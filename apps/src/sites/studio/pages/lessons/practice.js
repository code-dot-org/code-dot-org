import React from 'react';
import {Provider} from 'react-redux';

import {LessonPractice} from '@cdo/apps/aiTutor/views/lessonPractice/LessonPractice';
import {getStore} from '@cdo/apps/redux';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const lessonPracticeData = getScriptData('lessonPracticeData');
  console.log('lessonPracticeData', lessonPracticeData);
  createReactRoot(
    <Provider store={getStore()}>
      <LessonPractice
        lessonName={lessonPracticeData.lessonName}
        lessonSummary={lessonPracticeData.lessonSummary}
        vocabulary={lessonPracticeData.vocabulary}
        bonusLevels={lessonPracticeData.bonusLevels}
        sectionId={lessonPracticeData.sectionId}
        userId={lessonPracticeData.userId}
      />
    </Provider>,
    document.getElementById('lesson-practice-container')
  );
});
