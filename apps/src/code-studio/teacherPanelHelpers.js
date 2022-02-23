import {Provider} from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';
import TeacherPanel from './components/progress/teacherPanel/TeacherPanel';
import TeachersOnly from '@cdo/apps/code-studio/components/TeachersOnly';

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

  ReactDOM.render(
    <Provider store={store}>
      <TeachersOnly>
        <TeacherPanel
          unitName={scriptName}
          pageType={pageType}
          scriptId={scriptId}
        />
      </TeachersOnly>
    </Provider>,
    div
  );
  document.body.appendChild(div);
}
