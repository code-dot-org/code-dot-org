import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import React from 'react';
import {Provider} from 'react-redux';

import AiLessonsApp from '@cdo/apps/aiLessons/AiLessonsApp';
import {forceTheme} from '@cdo/apps/aiLessons/pageInit';
import {RouterProvider} from '@cdo/apps/aiLessons/router';
import {getStore} from '@cdo/apps/redux';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(() => {
  forceTheme();
  createReactRoot(
    <Provider store={getStore()}>
      <ThemeProvider>
        <RouterProvider>
          <AiLessonsApp />
        </RouterProvider>
      </ThemeProvider>
    </Provider>,
    '#ai-lessons-app-container'
  );
});
