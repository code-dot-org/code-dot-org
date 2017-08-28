import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import CourseOverview from '@cdo/apps/templates/courseOverview/CourseOverview';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';
import { getStore } from '@cdo/apps/code-studio/redux';

$(document).ready(showCourseOverview);

function showCourseOverview() {
  const script = document.querySelector('script[data-courses-show]');
  const scriptData = JSON.parse(script.dataset.coursesShow);
  const courseSummary = scriptData.course_summary;

  const teacherResources = (courseSummary.teacher_resources || []).map(
    ([type, link]) => ({type, link}));
  const store = getStore();

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
        isTeacher={scriptData.is_teacher}
        viewAs={ViewType.Teacher}
        scripts={courseSummary.scripts}
      />
    </Provider>,
  document.getElementById('course_overview'));
}
