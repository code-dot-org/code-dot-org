import React from 'react';
import {Provider} from 'react-redux';

import LessonDeepDiveContainer from '@cdo/apps/aiTutor/views/lessonDeepDive/LessonDeepDiveContainer';
import {getStore} from '@cdo/apps/redux';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
// import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  // const lessonDeepDiveData = getScriptData('lessonDeepDiveData');
  createReactRoot(
    <Provider store={getStore()}>
      <LessonDeepDiveContainer />
    </Provider>,
    document.getElementById('lesson-deep-dive-container')
  );
});
