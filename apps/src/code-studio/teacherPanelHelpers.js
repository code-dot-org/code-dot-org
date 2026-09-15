import React from 'react';
import {Provider} from 'react-redux';

import TeacherPanelHandle from '@cdo/apps/aiTeacherDrawer/TeacherPanelHandle';
import InstructorsOnly from '@cdo/apps/code-studio/components/InstructorsOnly';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

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

  createReactRoot(
    <Provider store={store}>
      <InstructorsOnly>
        <TeacherPanel
          unitName={scriptName}
          pageType={pageType}
          scriptId={scriptId}
        />
      </InstructorsOnly>
    </Provider>,
    div,
    {
      legacyReactDomRender: true,
    }
  );
  document.body.appendChild(div);
}

/**
 * Render the teacher panel handle (blue arrow tab) that opens the TA drawer
 * to the Teacher Panel tab. Used in place of renderTeacherPanel when the
 * ta-teacher-panel experiment is active.
 */
export function renderTeacherPanelHandle(store) {
  const div = document.createElement('div');
  createReactRoot(
    <Provider store={store}>
      <TeacherPanelHandle />
    </Provider>,
    div,
    {legacyReactDomRender: true}
  );
  document.body.appendChild(div);
}
