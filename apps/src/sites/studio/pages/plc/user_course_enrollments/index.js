import React from 'react';

import ProfessionalLearningCourseProgress from '@cdo/apps/code-studio/pd/professional_learning/ProfessionalLearningCourseProgress';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

const userCourseEnrollmentData = getScriptData('userCourseEnrollmentData');
createReactRoot(
  <ProfessionalLearningCourseProgress
    deeperLearningCourseData={userCourseEnrollmentData}
  />,
  document.getElementById('user-course-enrollment-container')
);
