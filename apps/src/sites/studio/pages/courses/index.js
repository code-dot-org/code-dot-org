import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import Courses from '@cdo/apps/templates/studioHomepages/Courses';
import {initCourseExplorer} from '@cdo/apps/courseExplorer/courseExplorer';
import {getStore} from '@cdo/apps/code-studio/redux';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(showCourses);

function showCourses() {
  // Initialize the non-React Course/Tool Explorer component code.
  initCourseExplorer();

  const coursesData = getScriptData('courses');
  const specialAnnouncement = getScriptData('specialAnnouncement');
  const isEnglish = coursesData.english;
  const studentsCount = coursesData.studentscount;
  const codeOrgUrlPrefix = coursesData.codeorgurlprefix;
  const signedOut = coursesData.signedout;
  const modernElementaryCoursesAvailable =
    coursesData.modernelementarycoursesavailable;

  ReactDOM.render(
    <Provider store={getStore()}>
      <Courses
        isEnglish={isEnglish}
        studentsCount={studentsCount}
        codeOrgUrlPrefix={codeOrgUrlPrefix}
        isSignedOut={signedOut}
        modernElementaryCoursesAvailable={modernElementaryCoursesAvailable}
        showAiCard={coursesData.showAiCard}
        specialAnnouncement={specialAnnouncement}
      />
    </Provider>,
    document.getElementById('courses-container')
  );
}
