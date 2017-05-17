import React from 'react';
import ReactDOM from 'react-dom';
import CourseOverview from '@cdo/apps/templates/courseOverview/CourseOverview';

$(document).ready(showCourseOverview);

function showCourseOverview() {
  const scriptData = document.querySelector('script[data-course-summary]');
  const courseSummary = JSON.parse(scriptData.dataset.courseSummary);

  // Eventually we want to do this all via redux
  ReactDOM.render(
    <CourseOverview
      title={courseSummary.title}
      descriptionStudent={courseSummary.description_student}
      descriptionTeacher={courseSummary.description_teacher}
      viewAs="Teacher"
      scripts={courseSummary.scripts}
    />,
  document.getElementById('course_overview'));
}
