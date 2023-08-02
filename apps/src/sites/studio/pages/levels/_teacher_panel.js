import $ from 'jquery';
import {getStore} from '@cdo/apps/redux';
import React from 'react';
import {Provider} from 'react-redux';
import ReactDOM from 'react-dom';
import TeacherContentToggle from '@cdo/apps/code-studio/components/TeacherContentToggle';
import {getHiddenLessons} from '@cdo/apps/code-studio/hiddenLessonRedux';
import {renderTeacherPanel} from '@cdo/apps/code-studio/teacherPanelHelpers';
import InstructorsOnly from '@cdo/apps/code-studio/components/InstructorsOnly';
import {setViewType, ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {
  setUserRoleInCourse,
  CourseRoles,
} from '@cdo/apps/templates/currentUserRedux';
import {queryParams} from '@cdo/apps/code-studio/utils';

$(document).ready(initPage);

// This function is called for all users (teachers and students) because for cached pages
// the client determines whether the user is a teacher and may not have data in redux
// yet when teacher_panel initPage is called.
function initPage() {
  const script = document.querySelector('script[data-teacherpanel]');
  const teacherPanelData = JSON.parse(script.dataset.teacherpanel);

  const store = getStore();

  store.dispatch(getHiddenLessons(teacherPanelData.script_name, false));

  // Lesson Extras fail to load with this
  if (!teacherPanelData.lesson_extra) {
    renderTeacherContentToggle(store);
  }

  if (teacherPanelData.is_instructor) {
    store.dispatch(setViewType(queryParams('viewAs') || ViewType.Instructor));
    store.dispatch(setUserRoleInCourse(CourseRoles.Instructor));
  }

  // If a teacher is peer-reviewing another teacher in a workshop, don't render
  // the teacher panel, as it doesn't make sense in that context.
  // We need to check for presence of appOptions since some pages such as /extras
  // (lesson extras page) do not set appOptions.
  const shouldRenderTeacherPanel = window.appOptions
    ? !window.appOptions.isCodeReviewing
    : true;

  if (shouldRenderTeacherPanel) {
    renderTeacherPanel(
      store,
      teacherPanelData.script_id,
      teacherPanelData.script_name,
      teacherPanelData.page_type
    );
  }
}

function renderTeacherContentToggle(store) {
  const levelContent = $('#level-body');
  const element = $('<div/>')
    .css('height', '100%')
    .insertAfter(levelContent)[0];
  const isBlocklyOrDroplet = !!(window.appOptions && appOptions.app);

  ReactDOM.render(
    <Provider store={store}>
      <InstructorsOnly>
        <TeacherContentToggle isBlocklyOrDroplet={isBlocklyOrDroplet} />
      </InstructorsOnly>
    </Provider>,
    element
  );
}
