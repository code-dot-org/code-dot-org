import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import CourseOverview from '@cdo/apps/templates/courseOverview/CourseOverview';
import { setViewType, ViewType } from '@cdo/apps/code-studio/viewAsRedux';
import { getStore } from '@cdo/apps/code-studio/redux';
import { setSections, selectSection } from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import clientState from '@cdo/apps/code-studio/clientState';
import { initializeHiddenScripts } from '@cdo/apps/code-studio/hiddenStageRedux';
import { setUserSignedIn } from '@cdo/apps/code-studio/progressRedux';
import { getUserSignedInFromCookieAndDom } from '@cdo/apps/code-studio/initSigninState';
import { setVerified, setVerifiedResources } from '@cdo/apps/code-studio/verifiedTeacherRedux';
import experiments from '@cdo/apps/util/experiments';

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

  store.dispatch(setUserSignedIn(getUserSignedInFromCookieAndDom()));

  if (isTeacher) {
    store.dispatch(setViewType(ViewType.Teacher));
    store.dispatch(setSections(scriptData.sections));

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

  const versions = experiments.isEnabled('courseVersions') ? courseSummary.versions : [];

  // Eventually we want to do this all via redux
  ReactDOM.render(
    <Provider store={store}>
      <CourseOverview
        name={courseSummary.name}
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
        versions={versions}
      />
    </Provider>,
  document.getElementById('course_overview'));
}
