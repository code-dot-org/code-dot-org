import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import React from 'react';
import {Provider} from 'react-redux';

import '@cdo/apps/aiLessons/pageInit';
import StudentPage from '@cdo/apps/aiLessons/StudentPage';
import {getStore} from '@cdo/apps/redux';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

// Note: deliberately don't call forceLightTheme() on the student page —
// EmbeddedLab applies the active lab's preferred theme on every checkpoint
// swap so the lab renders the way its designers intended.
$(document).ready(() => {
  const data = getScriptData('aiLessonsStudent');
  createReactRoot(
    <Provider store={getStore()}>
      <ThemeProvider>
        <StudentPage lesson={data.lesson} />
      </ThemeProvider>
    </Provider>,
    '#ai-lessons-student-container'
  );
});
