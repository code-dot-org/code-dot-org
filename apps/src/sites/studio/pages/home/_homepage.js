import $ from 'jquery';
import queryString from 'query-string';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {initializeHiddenScripts} from '@cdo/apps/code-studio/hiddenLessonRedux';
import {queryParams, updateQueryParam} from '@cdo/apps/code-studio/utils';
import {getStore, registerReducers} from '@cdo/apps/redux';
import locales, {setLocaleCode} from '@cdo/apps/redux/localesRedux';
import mapboxReducer, {setMapboxAccessToken} from '@cdo/apps/redux/mapbox';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import ParentalPermissionBanner from '@cdo/apps/templates/policy_compliance/ParentalPermissionBanner';
import StudentHomepage from '@cdo/apps/templates/studioHomepages/StudentHomepage';
import TeacherHomepage from '@cdo/apps/templates/studioHomepages/TeacherHomepage';
import {
  pageTypes,
  setAuthProviders,
  setPageType,
  beginCreatingSection,
  setShowLockSectionField, // DCDO Flag - show/hide Lock Section field
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import i18n from '@cdo/locale';

$(document).ready(showHomepage);

function showHomepage() {
  const script = document.querySelector('script[data-homepage]');
  const homepageData = JSON.parse(script.dataset.homepage);
  const isTeacher = homepageData.isTeacher;
  const isEnglish = homepageData.isEnglish;
  const announcementOverride = homepageData.announcement;
  const specialAnnouncement = homepageData.specialAnnouncement;
  const studentSpecialAnnouncement = homepageData.studentSpecialAnnouncement;
  const query = queryString.parse(window.location.search);
  registerReducers({locales, mapbox: mapboxReducer, currentUser});
  const store = getStore();
  store.dispatch(setAuthProviders(homepageData.providers));
  store.dispatch(initializeHiddenScripts(homepageData.hiddenScripts));
  store.dispatch(setPageType(pageTypes.homepage));
  store.dispatch(setLocaleCode(homepageData.localeCode));

  // DCDO Flag - show/hide Lock Section field
  store.dispatch(setShowLockSectionField(homepageData.showLockSectionField));

  if (homepageData.mapboxAccessToken) {
    store.dispatch(setMapboxAccessToken(homepageData.mapboxAccessToken));
  }

  // remove courseOfferingId, courseVersionId, and unitId params so that if we
  // navigate back we don't get the create section dialog again
  let courseOfferingId;
  let courseVersionId;
  let unitId;
  let participantType;
  if (query.courseOfferingId) {
    courseOfferingId = parseInt(query.courseOfferingId, 10);
    updateQueryParam('courseOfferingId', undefined, true);
  }
  if (query.courseVersionId) {
    courseVersionId = parseInt(query.courseVersionId, 10);
    updateQueryParam('courseVersionId', undefined, true);
  }
  if (query.unitId) {
    unitId = parseInt(query.unitId, 10);
    updateQueryParam('unitId', undefined, true);
  }
  if (query.participantType) {
    participantType = queryParams('participantType');
    updateQueryParam('participantType', undefined, true);
  }
  if ((courseOfferingId && courseVersionId) || query.openAddSectionDialog) {
    updateQueryParam('openAddSectionDialog', undefined, true);
    store.dispatch(
      beginCreatingSection(
        courseOfferingId,
        courseVersionId,
        unitId,
        participantType
      )
    );
  }

  const announcement = getTeacherAnnouncement(announcementOverride);
  const parentalPermissionBanner = homepageData.parentalPermissionBanner && (
    <ParentalPermissionBanner
      key="parental-permission-banner"
      {...homepageData.parentalPermissionBanner}
    />
  );

  ReactDOM.render(
    <Provider store={store}>
      <div>
        {isTeacher && (
          <TeacherHomepage
            announcement={announcement}
            hocLaunch={homepageData.hocLaunch}
            courses={homepageData.courses}
            plCourses={homepageData.plCourses}
            joinedStudentSections={homepageData.joined_student_sections}
            joinedPlSections={homepageData.joined_pl_sections}
            topCourse={homepageData.topCourse}
            topPlCourse={homepageData.topPlCourse}
            queryStringOpen={query['open']}
            canViewAdvancedTools={homepageData.canViewAdvancedTools}
            ncesSchoolId={homepageData.ncesSchoolId}
            censusQuestion={homepageData.censusQuestion}
            showCensusBanner={homepageData.showCensusBanner}
            showNpsSurvey={homepageData.showNpsSurvey}
            showFinishTeacherApplication={
              homepageData.showFinishTeacherApplication
            }
            showReturnToReopenedTeacherApplication={
              homepageData.showReturnToReopenedTeacherApplication
            }
            afeEligible={homepageData.afeEligible}
            teacherName={homepageData.teacherName}
            teacherId={homepageData.teacherId}
            teacherEmail={homepageData.teacherEmail}
            schoolYear={homepageData.currentSchoolYear}
            specialAnnouncement={specialAnnouncement}
            hasFeedback={homepageData.hasFeedback}
            showIncubatorBanner={homepageData.showIncubatorBanner}
            currentUserId={homepageData.currentUserId}
          />
        )}
        {!isTeacher && (
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
        )}
      </div>
    </Provider>,
    document.getElementById('homepage-container')
  );
}

/**
 * Return the teacher announcement that we should pass into TeacherHomepage.
 * @param {object} override - An optional override announcement.
 * @return {object} An announcement to display.
 */
function getTeacherAnnouncement(override) {
  // Start with default teacher announcement.
  let announcement = {
    heading: i18n.announcementHeadingBackToSchoolRemote(),
    buttonText: i18n.announcementButtonBackToSchool(),
    description: i18n.announcementDescriptionBackToSchoolRemote(),
    link: 'https://support.code.org/hc/en-us/articles/360013399932-Back-to-School-FAQ',
    image: '',
    type: 'bullhorn',
    id: 'back_to_school_2018',
  };

  // Optional override of teacher announcement (typically via DCDO).
  // Note that teacher_announce_type is optional.
  if (
    override &&
    override.teacher_announce_heading &&
    override.teacher_announce_description &&
    override.teacher_announce_url &&
    override.teacher_announce_id
  ) {
    // Use the override.
    announcement = {
      heading: override.teacher_announce_heading,
      buttonText: i18n.learnMore(),
      description: override.teacher_announce_description,
      link: override.teacher_announce_url,
      type: override.teacher_announce_type,
      id: override.teacher_announce_id,
    };
  }

  return announcement;
}
