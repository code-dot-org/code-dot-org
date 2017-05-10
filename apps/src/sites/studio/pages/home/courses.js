import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Courses from '@cdo/apps/templates/teacherHomepage/Courses';
import {initCourseExplorer} from '@cdo/apps/courseExplorer/courseExplorer';

$(document).ready(showCourses);

function showCourses() {
  // Initialize the non-React Course/Tool Explorer component code.
  initCourseExplorer();

  const coursesData = document.querySelector('script[data-courses]');
  const configCourses = JSON.parse(coursesData.dataset.courses);

  const englishTeacherData = document.querySelector('script[data-englishteacher]');
  const configEnglishTeacher = JSON.parse(englishTeacherData.dataset.englishteacher);

  ReactDOM.render (
    <Courses
      courses={configCourses}
      englishTeacher={configEnglishTeacher}
    />,
    document.getElementById('courses-container')
  );
}
