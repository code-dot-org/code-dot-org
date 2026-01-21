import { createRoot } from "react-dom/client";
import React from 'react';
import ReactDOM from 'react-dom';

import ProfessionalLearningCourseProgress from '@cdo/apps/code-studio/pd/professional_learning/ProfessionalLearningCourseProgress';
import getScriptData from '@cdo/apps/util/getScriptData';

const userCourseEnrollmentData = getScriptData('userCourseEnrollmentData');
const root = createRoot(document.getElementById('user-course-enrollment-container'));

root.render(<ProfessionalLearningCourseProgress
  deeperLearningCourseData={userCourseEnrollmentData}
/>);
