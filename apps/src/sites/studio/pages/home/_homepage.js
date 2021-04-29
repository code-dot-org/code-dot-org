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
  beginEditingNewSection,
  pageTypes,
  setAuthProviders,
  setPageType,
  setStageExtrasScriptIds,
  setTextToSpeechScriptIds,
  setPreReaderScriptIds,
  setValidGrades,
  setShowLockSectionField // DCDO Flag - show/hide Lock Section field
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import currentUser, {
  setCurrentUserId
} from '@cdo/apps/templates/currentUserRedux';
import {initializeHiddenScripts} from '@cdo/apps/code-studio/hiddenStageRedux';
import {updateQueryParam} from '@cdo/apps/code-studio/utils';
import locales, {
  setLocaleCode,
  setLocaleEnglishName
} from '@cdo/apps/redux/localesRedux';
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
  store.dispatch(setValidGrades(homepageData.valid_grades));
  store.dispatch(setStageExtrasScriptIds(homepageData.lessonExtrasScriptIds));
  store.dispatch(setTextToSpeechScriptIds(homepageData.textToSpeechScriptIds));
  store.dispatch(setPreReaderScriptIds(homepageData.preReaderScriptIds));
  store.dispatch(setAuthProviders(homepageData.providers));
  store.dispatch(initializeHiddenScripts(homepageData.hiddenScripts));
  store.dispatch(setPageType(pageTypes.homepage));
  store.dispatch(setLocaleCode(homepageData.localeCode));
  store.dispatch(setLocaleEnglishName(homepageData.locale));
  store.dispatch(setCurrentUserId(homepageData.currentUserId));

  // DCDO Flag - show/hide Lock Section field
  store.dispatch(setShowLockSectionField(homepageData.showLockSectionField));

  if (homepageData.mapboxAccessToken) {
    store.dispatch(setMapboxAccessToken(homepageData.mapboxAccessToken));
  }

  let courseId;
  let scriptId;
  if (query.courseId) {
    courseId = parseInt(query.courseId, 10);
    // remove courseId/scriptId params so that if we navigate back we don't get
    // this dialog again
    updateQueryParam('courseId', undefined, true);
  }
  if (query.scriptId) {
    scriptId = parseInt(query.scriptId, 10);
    updateQueryParam('scriptId', undefined, true);
  }
  if (courseId || scriptId) {
    store.dispatch(beginEditingNewSection(courseId, scriptId));
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
            joinedSections={homepageData.joined_sections}
            topCourse={homepageData.topCourse}
            queryStringOpen={query['open']}
            canViewAdvancedTools={homepageData.canViewAdvancedTools}
            isEnglish={isEnglish}
            ncesSchoolId={homepageData.ncesSchoolId}
            censusQuestion={homepageData.censusQuestion}
            showCensusBanner={homepageData.showCensusBanner}
            showNpsSurvey={homepageData.showNpsSurvey}
            donorBannerName={homepageData.donorBannerName}
            teacherName={homepageData.teacherName}
            teacherId={homepageData.teacherId}
            teacherEmail={homepageData.teacherEmail}
            schoolYear={homepageData.currentSchoolYear}
            specialAnnouncement={specialAnnouncement}
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
