import LandingPage from '@cdo/apps/code-studio/pd/professional_learning_landing/landingPage';
import React from 'react';
import ReactDOM from 'react-dom';

import getScriptData from '@cdo/apps/util/getScriptData';

const landingPageData = getScriptData('landingPageData');

console.log(landingPageData);

ReactDOM.render(
  <LandingPage
    coursesTaught={landingPageData['courses_teaching']}
    coursesCompleted={landingPageData['courses_completed']}
    lastWorkshopSurveyUrl={landingPageData['last_workshop_survey_link']}
  />,
  document.getElementById('landing-page-container')
);
