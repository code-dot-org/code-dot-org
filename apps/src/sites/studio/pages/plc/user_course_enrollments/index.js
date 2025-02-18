import React from 'react';
import ReactDOM from 'react-dom';

import ProfessionalLearningCourseProgress from '@cdo/apps/code-studio/pd/professional_learning_landing/ProfessionalLearningCourseProgress';
import getScriptData from '@cdo/apps/util/getScriptData';

const userCourseEnrollmentData = getScriptData('userCourseEnrollmentData');
ReactDOM.render(
  <ProfessionalLearningCourseProgress
    deeperLearningCourseData={userCourseEnrollmentData}
  />,
  document.getElementById('user-course-enrollment-container')
);
