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
  const courses = JSON.parse(coursesData.dataset.courses);
  const isEnglish = JSON.parse(coursesData.dataset.english);
  const isTeacher = JSON.parse(coursesData.dataset.teacher);

  ReactDOM.render (
    <Courses
      courses={courses}
      isEnglish={isEnglish}
      isTeacher={isTeacher}
    />,
    document.getElementById('courses-container')
  );
}
