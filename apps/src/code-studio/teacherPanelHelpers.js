import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';

import InstructorsOnly from '@cdo/apps/code-studio/components/InstructorsOnly';

import TeacherPanel from './components/progress/teacherPanel/TeacherPanel';

/**
 * Render our teacher panel that shows up on our course overview page.
 */
export function renderTeacherPanel(
  store,
  scriptId,
  scriptName,
  pageType = null
) {
  const div = document.createElement('div');
  div.setAttribute('id', 'teacher-panel-container');

  const root = createRoot(div);

  root.render(
    <Provider store={store}>
      <InstructorsOnly>
        <TeacherPanel
          unitName={scriptName}
          pageType={pageType}
          scriptId={scriptId}
        />
      </InstructorsOnly>
    </Provider>
  );

  document.body.appendChild(div);
}
