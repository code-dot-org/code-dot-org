import $ from 'jquery';
import queryString from 'query-string';
import React from 'react';
import {Provider} from 'react-redux';

import {initializeHiddenScripts} from '@cdo/apps/code-studio/hiddenLessonRedux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import locales, {setLocaleCode} from '@cdo/apps/redux/localesRedux';
import mapboxReducer, {setMapboxAccessToken} from '@cdo/apps/redux/mapbox';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import ParentalPermissionBanner from '@cdo/apps/templates/policy_compliance/ParentalPermissionBanner';
import StudentHomepage from '@cdo/apps/templates/studioHomepages/StudentHomepage';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(showHomepage);

// This renders the student homepage. Signed-in teachers are redirected to home/teacher-dashboard,
// which handles rendering the teacher homepage and dashboard navigation.
function showHomepage() {
  const script = document.querySelector('script[data-homepage]');
  const homepageData = JSON.parse(script.dataset.homepage);
  const isEnglish = homepageData.isEnglish;
  const studentSpecialAnnouncement = homepageData.studentSpecialAnnouncement;
  registerReducers({locales, mapbox: mapboxReducer, currentUser});
  const store = getStore();
  store.dispatch(initializeHiddenScripts(homepageData.hiddenScripts));
  store.dispatch(setLocaleCode(homepageData.localeCode));

  if (homepageData.mapboxAccessToken) {
    store.dispatch(setMapboxAccessToken(homepageData.mapboxAccessToken));
  }

  const parentalPermissionBanner = homepageData.parentalPermissionBanner && (
    <ParentalPermissionBanner
      key="parental-permission-banner"
      {...homepageData.parentalPermissionBanner}
    />
  );

  createReactRoot(
    <Provider store={store}>
      <div>
        <StudentHomepage
          courses={homepageData.courses}
          topCourse={homepageData.topCourse}
          hasFeedback={homepageData.hasFeedback}
          sections={homepageData.sections}
          canViewAdvancedTools={homepageData.canViewAdvancedTools}
          studentId={homepageData.studentId}
          isEnglish={isEnglish}
          showVerifiedTeacherWarning={
            homepageData.showStudentAsVerifiedTeacherWarning
          }
          specialAnnouncement={studentSpecialAnnouncement}
          topComponents={[parentalPermissionBanner]}
        />
      </div>
    </Provider>,
    document.getElementById('homepage-container')
  );
}
