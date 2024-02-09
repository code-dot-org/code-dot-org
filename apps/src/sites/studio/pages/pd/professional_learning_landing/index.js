import LandingPage from '@cdo/apps/code-studio/pd/professional_learning_landing/LandingPage';
import React from 'react';
import ReactDOM from 'react-dom';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import getScriptData from '@cdo/apps/util/getScriptData';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

// Execute after page has fully loaded so the Amplitude event only fires on full page load
$(() => {
  analyticsReporter.sendEvent(EVENTS.MY_PL_PAGE_VISITED);

  const landingPageData = getScriptData('landingPageData');

  ReactDOM.render(
    <LandingPage
      lastWorkshopSurveyUrl={landingPageData['last_workshop_survey_url']}
      lastWorkshopSurveyCourse={landingPageData['last_workshop_survey_course']}
      deeperLearningCourseData={landingPageData['summarized_plc_enrollments']}
    />,
    document.getElementById('pl-landing-page-container')
  );
});
