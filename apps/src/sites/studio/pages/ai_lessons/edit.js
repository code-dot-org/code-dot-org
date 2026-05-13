import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import React from 'react';
import {Provider} from 'react-redux';

import AuthorPage from '@cdo/apps/aiLessons/AuthorPage';
import {forceLightTheme} from '@cdo/apps/aiLessons/pageInit';
import {getStore} from '@cdo/apps/redux';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  forceLightTheme();
  const data = getScriptData('aiLessonsAuthor');
  createReactRoot(
    <Provider store={getStore()}>
      <ThemeProvider>
        <AuthorPage
          mode={data.mode}
          lessonId={data.lessonId}
          initialLesson={data.initialLesson}
        />
      </ThemeProvider>
    </Provider>,
    '#ai-lessons-author-container'
  );
});
