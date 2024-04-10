import LandingPage from '@cdo/apps/code-studio/pd/professional_learning_landing/LandingPage';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import getScriptData from '@cdo/apps/util/getScriptData';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

// Execute after page has fully loaded so the Amplitude event only fires on full page load
$(() => {
  const store = getStore();

  analyticsReporter.sendEvent(EVENTS.MY_PL_PAGE_VISITED);

  const landingPageData = getScriptData('landingPageData');

  ReactDOM.render(
    <Provider store={store}>
      <LandingPage
        lastWorkshopSurveyUrl={landingPageData['last_workshop_survey_url']}
        lastWorkshopSurveyCourse={
          landingPageData['last_workshop_survey_course']
        }
        deeperLearningCourseData={landingPageData['summarized_plc_enrollments']}
        currentYearApplicationId={
          landingPageData['current_year_application_id']
        }
        workshopsAsParticipant={landingPageData['workshops_as_participant']}
        plCoursesInstructed={landingPageData['pl_courses_instructed']}
        plCoursesStarted={landingPageData['pl_courses_started']}
        userPermissions={landingPageData['user_permissions']}
      />
    </Provider>,
    document.getElementById('pl-landing-page-container')
  );
});
