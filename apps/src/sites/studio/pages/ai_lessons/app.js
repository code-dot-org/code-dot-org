import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import React from 'react';
import {Provider} from 'react-redux';

import AiLessonsApp from '@cdo/apps/aiLessons/AiLessonsApp';
import {loadDemoSettings} from '@cdo/apps/aiLessons/demoSettings';
import {forceTheme} from '@cdo/apps/aiLessons/pageInit';
import {RouterProvider} from '@cdo/apps/aiLessons/router';
import {getStore} from '@cdo/apps/redux';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(() => {
  // Document-level theme before React mounts; AiLessonsApp re-applies it
  // through the ThemeProvider once mounted.
  forceTheme(loadDemoSettings().theme);
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
