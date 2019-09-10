import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import queryString from 'query-string';
import TeacherHomepage from '@cdo/apps/templates/studioHomepages/TeacherHomepage';
import StudentHomepage from '@cdo/apps/templates/studioHomepages/StudentHomepage';
import i18n from '@cdo/locale';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import {
  setValidGrades,
  setStageExtrasScriptIds,
  setAuthProviders,
  beginEditingNewSection
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {initializeHiddenScripts} from '@cdo/apps/code-studio/hiddenStageRedux';
import {updateQueryParam} from '@cdo/apps/code-studio/utils';
import LinkCleverAccountModal from '@cdo/apps/code-studio/LinkCleverAccountModal';

$(document).ready(showHomepage);

function showHomepage() {
  const script = document.querySelector('script[data-homepage]');
  const homepageData = JSON.parse(script.dataset.homepage);
  const isTeacher = homepageData.isTeacher;
  const isEnglish = homepageData.isEnglish;
  const announcementOverride = homepageData.announcement;
  const query = queryString.parse(window.location.search);
  const store = getStore();
  store.dispatch(setValidGrades(homepageData.valid_grades));
  store.dispatch(setStageExtrasScriptIds(homepageData.stageExtrasScriptIds));
  store.dispatch(setAuthProviders(homepageData.providers));
  store.dispatch(initializeHiddenScripts(homepageData.hiddenScripts));

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
            schoolAddress1={homepageData.schoolAddress1}
            schoolAddress2={homepageData.schoolAddress2}
            schoolAddress3={homepageData.schoolAddress3}
            schoolCity={homepageData.schoolCity}
            schoolState={homepageData.schoolState}
            schoolZip={homepageData.schoolZip}
            censusQuestion={homepageData.censusQuestion}
            showCensusBanner={homepageData.showCensusBanner}
            donorBannerName={homepageData.donorBannerName}
            teacherName={homepageData.teacherName}
            teacherFirstName={homepageData.teacherFirstName}
            teacherSecondName={homepageData.teacherSecondName}
            teacherId={homepageData.teacherId}
            teacherEmail={homepageData.teacherEmail}
            schoolYear={homepageData.currentSchoolYear}
            locale={homepageData.locale}
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
    heading: i18n.announcementHeadingBackToSchool2018(),
    buttonText: i18n.announcementButtonBackToSchool2018(),
    description: i18n.announcementDescriptionBackToSchool2018(),
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

window.CleverTakeoverManager = function(options) {
  this.options = options;
  const self = this;

  const linkCleverDiv = $('<div>');
  function showLinkCleverModal(cancel, submit, providerToLink) {
    $(document.body).append(linkCleverDiv);

    ReactDOM.render(
      <LinkCleverAccountModal
        isOpen={true}
        handleCancel={cancel}
        handleSubmit={submit}
        forceConnect={options.forceConnect === 'true'}
        providerToLink={providerToLink}
      />,
      linkCleverDiv[0]
    );
  }

  if (self.options.cleverLinkFlag) {
    showLinkCleverModal(
      onCancelModal,
      onConfirmLink,
      self.options.cleverLinkFlag
    );
  }

  function closeLinkCleverModal() {
    ReactDOM.unmountComponentAtNode(linkCleverDiv[0]);
  }

  function onCancelModal() {
    $('#user_user_type').val('student');
    $.get('/users/clever_modal_dismissed');
    closeLinkCleverModal();
  }

  function onConfirmLink() {
    window.location.href =
      '/users/clever_takeover?mergeID=' +
      self.options.userIDToMerge +
      '&token=' +
      self.options.mergeAuthToken;
  }
};
