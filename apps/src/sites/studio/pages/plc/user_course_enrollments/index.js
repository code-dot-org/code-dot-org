import React from 'react';
import {createRoot} from 'react-dom/client';

import ProfessionalLearningCourseProgress from '@cdo/apps/code-studio/pd/professional_learning_landing/ProfessionalLearningCourseProgress';
import getScriptData from '@cdo/apps/util/getScriptData';

const userCourseEnrollmentData = getScriptData('userCourseEnrollmentData');
const root = createRoot(
  document.getElementById('user-course-enrollment-container')
);

root.render(
  <ProfessionalLearningCourseProgress
    deeperLearningCourseData={userCourseEnrollmentData}
  />
);
