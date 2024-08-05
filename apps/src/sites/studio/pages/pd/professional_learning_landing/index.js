import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import LandingPage from '@cdo/apps/code-studio/pd/professional_learning_landing/LandingPage';
import {EVENTS} from '@cdo/apps/metrics/utils/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/utils/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import getScriptData from '@cdo/apps/util/getScriptData';

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
        hasEnrolledInWorkshop={landingPageData['has_enrolled_in_workshop']}
        workshopsAsFacilitator={landingPageData['workshops_as_facilitator']}
        workshopsAsOrganizer={landingPageData['workshops_as_organizer']}
        workshopsAsRegionalPartner={
          landingPageData['workshops_for_regional_partner']
        }
        plCoursesStarted={landingPageData['pl_courses_started']}
        userPermissions={landingPageData['user_permissions']}
        joinedStudentSections={landingPageData['joined_student_sections']}
        joinedPlSections={landingPageData['joined_pl_sections']}
        coursesAsFacilitator={landingPageData['courses_as_facilitator']}
      />
    </Provider>,
    document.getElementById('pl-landing-page-container')
  );
});
