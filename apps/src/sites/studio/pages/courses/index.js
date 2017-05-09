import React from 'react';
import ReactDOM from 'react-dom';
import CourseOverview from '@cdo/apps/templates/courseOverview/CourseOverview';

$(document).ready(showCourseOverview);

function showCourseOverview() {
  const courseData = document.querySelector('script[data-coursedata]');
  const configCourse = JSON.parse(courseData.dataset.coursedata);

  // Eventually we want to do this all via redux
  ReactDOM.render(
    <div>
      <CourseOverview
        title={configCourse.title}
        descriptionStudent={configCourse.description_student}
        descriptionTeacher={configCourse.description_teacher}
        viewAs="Teacher"
      />
    <pre>{JSON.stringify(configCourse, null, 2)}</pre>
    </div>
  , document.getElementById('course_index'));
}
