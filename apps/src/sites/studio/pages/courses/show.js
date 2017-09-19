import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import CourseOverview from '@cdo/apps/templates/courseOverview/CourseOverview';
import { setViewType, ViewType } from '@cdo/apps/code-studio/viewAsRedux';
import { getStore } from '@cdo/apps/code-studio/redux';
import { setSections, selectSection } from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import clientState from '@cdo/apps/code-studio/clientState';
import { initializeHiddenScripts } from '@cdo/apps/code-studio/hiddenStageRedux';
import { setUserSignedIn, SignInState } from '@cdo/apps/code-studio/progressRedux';
import { setVerified, setVerifiedResources } from '@cdo/apps/code-studio/verifiedTeacherRedux';

$(document).ready(showCourseOverview);

function showCourseOverview() {
  const script = document.querySelector('script[data-courses-show]');
  const scriptData = JSON.parse(script.dataset.coursesShow);
  const courseSummary = scriptData.course_summary;
  const isTeacher = scriptData.is_teacher;

  const teacherResources = (courseSummary.teacher_resources || []).map(
    ([type, link]) => ({type, link}));
  const store = getStore();

  if (courseSummary.has_verified_resources) {
    store.dispatch(setVerifiedResources());
  }

  if (isTeacher) {
    store.dispatch(setViewType(ViewType.Teacher));
    store.dispatch(setSections(scriptData.sections));
    store.dispatch(setUserSignedIn(SignInState.SignedIn));

    if (scriptData.is_verified_teacher) {
      store.dispatch(setVerified());
    }

    const sectionId = clientState.queryParams('section_id');
    if (sectionId) {
      store.dispatch(selectSection(sectionId));
    }
  }

  if (scriptData.hidden_scripts) {
    store.dispatch(initializeHiddenScripts(scriptData.hidden_scripts));
  }

  // Eventually we want to do this all via redux
  ReactDOM.render(
    <Provider store={store}>
      <CourseOverview
        title={courseSummary.title}
        id={courseSummary.id}
        descriptionStudent={courseSummary.description_student}
        descriptionTeacher={courseSummary.description_teacher}
        sectionsInfo={scriptData.sections}
        teacherResources={teacherResources}
        isTeacher={isTeacher}
        viewAs={ViewType.Teacher}
        scripts={courseSummary.scripts}
        isVerifiedTeacher={!!scriptData.is_verified_teacher}
        hasVerifiedResources={!!courseSummary.has_verified_resources}
      />
    </Provider>,
  document.getElementById('course_overview'));
}
