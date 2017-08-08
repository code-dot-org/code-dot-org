import React from 'react';
import ReactDOM from 'react-dom';
import CourseOverview from '@cdo/apps/templates/courseOverview/CourseOverview';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';

$(document).ready(showCourseOverview);

function showCourseOverview() {
  const script = document.querySelector('script[data-courses-show]');
  const scriptData = JSON.parse(script.dataset.coursesShow);
  const courseSummary = scriptData.course_summary;

  const teacherResources = (courseSummary.teacher_resources || []).map(
    ([type, link]) => ({type, link}));

  // Eventually we want to do this all via redux
  ReactDOM.render(
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
    />,
  document.getElementById('course_overview'));
}
