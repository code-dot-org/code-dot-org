import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Courses from '@cdo/apps/templates/teacherHomepage/Courses';
import {initCourseExplorer} from '@cdo/apps/courseExplorer/courseExplorer';

$(document).ready(showCourses);

function showCourses() {
  // Initialize the non-React Course/Tool Explorer component code.
  initCourseExplorer();

  const script = document.querySelector('script[data-courses]');
  const coursesData = JSON.parse(script.dataset.courses);
  const courses = coursesData.courses;
  const isEnglish = coursesData.english;
  const isTeacher = coursesData.teacher;
  const linesCount = coursesData.linescount;
  const studentsCount = coursesData.studentscount;
  const codeOrgUrlPrefix = coursesData.codeorgurlprefix;

  ReactDOM.render (
    <Courses
      courses={courses}
      isEnglish={isEnglish}
      isTeacher={isTeacher}
      linesCount={linesCount}
      studentsCount={studentsCount}
      codeOrgUrlPrefix={codeOrgUrlPrefix}
    />,
    document.getElementById('courses-container')
  );
}
