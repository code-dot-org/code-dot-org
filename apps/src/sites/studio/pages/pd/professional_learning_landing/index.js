import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import AiDiffFloatingActionButton from '@cdo/apps/aiDifferentiation/AiDiffFloatingActionButton';
import LandingPage from '@cdo/apps/code-studio/pd/professional_learning_landing/LandingPage';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import experiments from '@cdo/apps/util/experiments';
import getScriptData from '@cdo/apps/util/getScriptData';
import {AiDiffContext} from '@cdo/generated-scripts/sharedConstants';

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
        showDeeperLearning={landingPageData['show_deeper_learning']}
        currentYearApplicationId={
          landingPageData['current_year_application_id']
        }
        hasEnrolledInWorkshop={landingPageData['has_enrolled_in_workshop']}
        plCoursesStarted={landingPageData['pl_courses_started']}
        userPermissions={landingPageData['user_permissions']}
        joinedStudentSections={landingPageData['joined_student_sections']}
        joinedPlSections={landingPageData['joined_pl_sections']}
        coursesAsFacilitator={landingPageData['courses_as_facilitator']}
      />
    </Provider>,
    document.getElementById('pl-landing-page-container')
  );
  displayDifferentiationChat();
});

function displayDifferentiationChat() {
  const aiDiffFabMountPoint = document.getElementById(
    'ai-differentiation-fab-mount-point'
  );

  if (aiDiffFabMountPoint && experiments.isEnabled('ai-differentiation')) {
    ReactDOM.render(
      <Provider store={getStore()}>
        <AiDiffFloatingActionButton context={AiDiffContext.GENERAL} />
      </Provider>,
      aiDiffFabMountPoint
    );
  }
}
