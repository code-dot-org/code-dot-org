import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import React from 'react';
import {Provider} from 'react-redux';

import {forceLightTheme} from '@cdo/apps/aiLessons/pageInit';
import TeacherProgressPage from '@cdo/apps/aiLessons/TeacherProgressPage';
import {getStore} from '@cdo/apps/redux';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  forceLightTheme();
  const data = getScriptData('aiLessonsAllProgress');
  createReactRoot(
    <Provider store={getStore()}>
      <ThemeProvider>
        <TeacherProgressPage entries={data.entries || []} />
      </ThemeProvider>
    </Provider>,
    '#ai-lessons-all-progress-container'
  );
});
