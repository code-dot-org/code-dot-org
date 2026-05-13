import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import React from 'react';
import {Provider} from 'react-redux';

import LessonsListPage from '@cdo/apps/aiLessons/LessonsListPage';
import {forceLightTheme} from '@cdo/apps/aiLessons/pageInit';
import {getStore} from '@cdo/apps/redux';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  forceLightTheme();
  const data = getScriptData('aiLessonsIndex');
  createReactRoot(
    <Provider store={getStore()}>
      <ThemeProvider>
        <LessonsListPage lessons={data.lessons || []} />
      </ThemeProvider>
    </Provider>,
    '#ai-lessons-index-container'
  );
});
