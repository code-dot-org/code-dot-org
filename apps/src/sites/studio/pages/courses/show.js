import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import CourseOverview from '@cdo/apps/templates/courseOverview/CourseOverview';
import { setViewType, ViewType } from '@cdo/apps/code-studio/viewAsRedux';
import { getStore } from '@cdo/apps/code-studio/redux';
import { setSections, selectSection } from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import clientState from '@cdo/apps/code-studio/clientState';
import { updateHiddenScript, setInitialized } from '@cdo/apps/code-studio/hiddenStageRedux';

$(document).ready(showCourseOverview);

function showCourseOverview() {
  const script = document.querySelector('script[data-courses-show]');
  const scriptData = JSON.parse(script.dataset.coursesShow);
  const courseSummary = scriptData.course_summary;
  const isTeacher = scriptData.is_teacher;

  const teacherResources = (courseSummary.teacher_resources || []).map(
    ([type, link]) => ({type, link}));
  const store = getStore();

  if (isTeacher) {
    store.dispatch(setViewType(ViewType.Teacher));
    store.dispatch(setSections(scriptData.sections));

    const sectionId = clientState.queryParams('section_id');
    if (sectionId) {
      store.dispatch(selectSection(sectionId));
    }
  }

  // TODO: We ought to be able to use the contents/logic of hiddenStageRedux
  // for hiddenScripts as well. This might just mean renaming hiddenStageRedux
  // to make it more generic, but I might also need to support both hidden stages
  // and hidden scripts on the same page. That work should eventually move the
  // logic below into the duck module.
  let response = scriptData.hidden_scripts;
  if (response) {
    const STUDENT_SECTION_ID = 'STUDENT';
    if (Array.isArray(response)) {
      response = { [STUDENT_SECTION_ID]: response };
    }

    Object.keys(response).forEach(sectionId => {
      const hiddenStageIds = response[sectionId];
      hiddenStageIds.forEach(scriptId => {
        store.dispatch(updateHiddenScript(sectionId, scriptId, true));
      });
    });
    store.dispatch(setInitialized(true));
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
      />
    </Provider>,
  document.getElementById('course_overview'));
}
