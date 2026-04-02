import React from 'react';
import {Provider} from 'react-redux';

import {LessonDeepDive} from '@cdo/apps/aiTutor/views/lessonDeepDive/LessonDeepDive';
import {getStore} from '@cdo/apps/redux';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const lessonDeepDiveData = getScriptData('lessonDeepDiveData');
  createReactRoot(
    <Provider store={getStore()}>
      <LessonDeepDive lessonDeepDiveData={lessonDeepDiveData} />
    </Provider>,
    document.getElementById('lesson-deep-dive-container')
  );
});
