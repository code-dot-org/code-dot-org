import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import queryString from 'query-string';
import TeacherHomepage from '@cdo/apps/templates/studioHomepages/TeacherHomepage';
import StudentHomepage from '@cdo/apps/templates/studioHomepages/StudentHomepage';
import i18n from '@cdo/locale';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import {
  pageTypes,
  setAuthProviders,
  setPageType,
  setShowLockSectionField // DCDO Flag - show/hide Lock Section field
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import {initializeHiddenScripts} from '@cdo/apps/code-studio/hiddenLessonRedux';
import locales, {setLocaleCode} from '@cdo/apps/redux/localesRedux';
import mapboxReducer, {setMapboxAccessToken} from '@cdo/apps/redux/mapbox';

$(document).ready(showHomepage);

function showHomepage() {
  const script = document.querySelector('script[data-homepage]');
  const homepageData = JSON.parse(script.dataset.homepage);
  const isTeacher = homepageData.isTeacher;
  const isEnglish = homepageData.isEnglish;
  const announcementOverride = homepageData.announcement;
  const specialAnnouncement = homepageData.specialAnnouncement;
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

  const announcement = getTeacherAnnouncement(announcementOverride);

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
            isEnglish={isEnglish}
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
            donorBannerName={homepageData.donorBannerName}
            teacherName={homepageData.teacherName}
            teacherId={homepageData.teacherId}
            teacherEmail={homepageData.teacherEmail}
            schoolYear={homepageData.currentSchoolYear}
            specialAnnouncement={specialAnnouncement}
            hasFeedback={homepageData.hasFeedback}
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
    link:
      'https://support.code.org/hc/en-us/articles/360013399932-Back-to-School-FAQ',
    image: '',
    type: 'bullhorn',
    id: 'back_to_school_2018'
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
      id: override.teacher_announce_id
    };
  }

  return announcement;
}
