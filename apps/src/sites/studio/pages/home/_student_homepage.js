import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import StudentHomepage from '@cdo/apps/templates/teacherHomepage/StudentHomepage';

$(document).ready(showStudentHomepage);

function showStudentHomepage() {
  const coursesData = document.querySelector('script[data-courses]');
  const configCourses = JSON.parse(coursesData.dataset.courses);

  ReactDOM.render (
    <StudentHomepage
      courses={configCourses}
    />,
    document.getElementById('student-homepage-container')
  );
}
