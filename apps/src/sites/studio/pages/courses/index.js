import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Courses from '@cdo/apps/templates/studioHomepages/Courses';
import {initCourseExplorer} from '@cdo/apps/courseExplorer/courseExplorer';
import {isRtlFromDOM} from '@cdo/apps/code-studio/isRtlRedux';

$(document).ready(showCourses);

function showCourses() {
  // Initialize the non-React Course/Tool Explorer component code.
  initCourseExplorer();

  const script = document.querySelector('script[data-courses]');
  const coursesData = JSON.parse(script.dataset.courses);
  const isEnglish = coursesData.english;
  const isTeacher = coursesData.teacher;
  const linesCount = coursesData.linescount;
  const studentsCount = coursesData.studentscount;
  const codeOrgUrlPrefix = coursesData.codeorgurlprefix;
  const signedOut = coursesData.signedout;
  const showInitialTips = !coursesData.initialtipsdismissed;
  const userId = coursesData.userid;
  const isRtl = isRtlFromDOM();

  ReactDOM.render (
    <Courses
      isEnglish={isEnglish}
      isTeacher={isTeacher}
      linesCount={linesCount}
      studentsCount={studentsCount}
      codeOrgUrlPrefix={codeOrgUrlPrefix}
      isSignedOut={signedOut}
      showInitialTips={showInitialTips}
      userId={userId}
      isRtl={isRtl}
    />,
    document.getElementById('courses-container')
  );
}
