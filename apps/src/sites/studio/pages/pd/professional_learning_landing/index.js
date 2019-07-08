import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';

import('@cdo/apps/code-studio/pd/professional_learning_landing/LandingPage').then(
  ({default: LandingPage}) => {
    const landingPageData = getScriptData('landingPageData');
    ReactDOM.render(
      <LandingPage
        lastWorkshopSurveyUrl={landingPageData['last_workshop_survey_url']}
        lastWorkshopSurveyCourse={
          landingPageData['last_workshop_survey_course']
        }
        professionalLearningCourseData={
          landingPageData['summarized_plc_enrollments']
        }
      />,
      document.getElementById('landing-page-container')
    );
  }
);
