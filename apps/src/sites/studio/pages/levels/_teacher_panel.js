import $ from 'jquery';
import React from 'react';
import {Provider} from 'react-redux';

import InstructorsOnly from '@cdo/apps/code-studio/components/InstructorsOnly';
import {getStudentsForSection} from '@cdo/apps/code-studio/components/progress/teacherPanel/teacherPanelData';
import TeacherContentToggle from '@cdo/apps/code-studio/components/TeacherContentToggle';
import {getHiddenLessons} from '@cdo/apps/code-studio/hiddenLessonRedux';
import {setViewAsUserId} from '@cdo/apps/code-studio/progressRedux';
import {
  renderTeacherPanel,
  renderTeacherPanelHandle,
} from '@cdo/apps/code-studio/teacherPanelHelpers';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {setViewType, ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {getStore} from '@cdo/apps/redux';
import {
  setUserRoleInCourse,
  CourseRoles,
} from '@cdo/apps/templates/currentUserRedux';
import {setStudentsForCurrentSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import experiments from '@cdo/apps/util/experiments';

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

  const viewAsUserId = parseInt(queryParams('user_id'), 10) || null;

  if (teacherPanelData.is_instructor) {
    store.dispatch(setViewType(queryParams('viewAs') || ViewType.Instructor));
    store.dispatch(setUserRoleInCourse(CourseRoles.Instructor));
    // Lab2 levels load the project of viewAsUserId.
    viewAsUserId && store.dispatch(setViewAsUserId(viewAsUserId));
  }

  // If a teacher is peer-reviewing another teacher in a workshop, don't render
  // the teacher panel, as it doesn't make sense in that context.
  // We need to check for presence of appOptions since some pages such as /extras
  // (lesson extras page) do not set appOptions.
  const shouldRenderTeacherPanel = window.appOptions
    ? !window.appOptions.isCodeReviewing
    : true;

  if (shouldRenderTeacherPanel) {
    if (
      teacherPanelData.is_instructor &&
      experiments.isEnabled('ta-teacher-panel')
    ) {
      renderTeacherPanelHandle(store);
      // Names the viewed student before the drawer's panel loads the roster.
      if (viewAsUserId) {
        getStudentsForSection().then(
          section =>
            section &&
            store.dispatch(
              setStudentsForCurrentSection(section.id, section.students)
            )
        );
      }
    } else {
      renderTeacherPanel(
        store,
        teacherPanelData.script_id,
        teacherPanelData.script_name,
        teacherPanelData.page_type
      );
    }
  }
}

function renderTeacherContentToggle(store) {
  const levelContent = $('#level-body');
  const element = $('<div/>')
    .css('height', '100%')
    .insertAfter(levelContent)[0];
  const isBlocklyOrDroplet = !!(window.appOptions && appOptions.app);

  createReactRoot(
    <Provider store={store}>
      <InstructorsOnly>
        <TeacherContentToggle isBlocklyOrDroplet={isBlocklyOrDroplet} />
      </InstructorsOnly>
    </Provider>,
    element
  );
}
