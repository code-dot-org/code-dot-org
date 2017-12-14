import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import queryString from 'query-string';
import {isRtlFromDOM} from '@cdo/apps/code-studio/isRtlRedux';
import TeacherHomepage from '@cdo/apps/templates/studioHomepages/TeacherHomepage';
import StudentHomepage from '@cdo/apps/templates/studioHomepages/StudentHomepage';
import UiTips from '@cdo/apps/templates/studioHomepages/UiTips';
import i18n from "@cdo/locale";
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import {
  setValidGrades,
  setOAuthProvider,
  beginEditingNewSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {updateQueryParam} from '@cdo/apps/code-studio/utils';
import LinkCleverAccountModal from '@cdo/apps/code-studio/LinkCleverAccountModal';

$(document).ready(showHomepage);

function showHomepage() {
  const isRtl = isRtlFromDOM();
  const script = document.querySelector('script[data-homepage]');
  const homepageData = JSON.parse(script.dataset.homepage);
  const isTeacher = homepageData.isTeacher;
  const announcementOverride = homepageData.announcement;
  const showUiTips = homepageData.showuitips;
  const userId = homepageData.userid;
  const showInitialTips = !homepageData.initialtipsdismissed;
  const query = queryString.parse(window.location.search);
  const isEnglish = homepageData.isenglish;

  const store = getStore();
  store.dispatch(setValidGrades(homepageData.valid_grades));
  store.dispatch(setOAuthProvider(homepageData.provider));

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

  // Default teacher announcement.
  let announcementHeading = i18n.announcementHeadingFacilitatorApp();
  let announcementDescription = i18n.announcementDescriptionFacilitatorApp();
  let announcementLink = "https://code.org/facilitator";
  let announcementId = "facilitator_app";
  let announcementType = "";

  // Optional override of teacher announcement.
  if (
    announcementOverride &&
    announcementOverride.teacher_announce_heading &&
    announcementOverride.teacher_announce_description &&
    announcementOverride.teacher_announce_url &&
    announcementOverride.teacher_announce_id) {

    // Use the override.
    announcementHeading = announcementOverride.teacher_announce_heading;
    announcementDescription = announcementOverride.teacher_announce_description;
    announcementLink = announcementOverride.teacher_announce_url;
    announcementId = announcementOverride.teacher_announce_id;
    announcementType = announcementOverride.teacher_announce_type;
  }

  ReactDOM.render (
    <Provider store={store}>
      <div>
        {(isTeacher && showUiTips) && (
          <UiTips
            userId={userId}
            tipId="homepage_header"
            showInitialTips={showInitialTips}
            beforeDialog={{
              title: i18n.homepageUiTipsBeforeDialogTitle(),
              body: i18n.homepageUiTipsBeforeDialogBody(),
              cancel: i18n.homepageUiTipsBeforeDialogCancel(),
              confirm: i18n.homepageUiTipsBeforeDialogConfirm()
            }}
            afterDialog={{
              title: i18n.homepageUiTipsAfterDialogTitle(),
              body: i18n.homepageUiTipsAfterDialogBody(),
              cancel: i18n.homepageUiTipsAfterDialogCancel(),
              confirm: i18n.homepageUiTipsAfterDialogConfirm(),
              onConfirm: {action: "url", url: "http://teacherblog.code.org/post/160703303174/coming-soon-access-your-top-resources-with-the"}
            }}
            tips={
              [
                {
                  type: "initial",
                  position: {top: 80, left: 100},
                  text: i18n.homepageUiTipKeyLinks(),
                  arrowDirection: "up"
                },
                {
                  type: "initial",
                  position: {top: 80, right: 15},
                  text: i18n.homepageUiTipOtherLinks(),
                  arrowDirection: "up_corner"
                },
                {
                  type: "triggered",
                  position: {top: 80, right: 15},
                  text: i18n.homepageUiTipAlreadyHome(),
                  triggerId: "logo_home_link",
                  arrowDirection: "up_corner"}
              ]}
          />
        )}

        {(!isTeacher && showUiTips) && (
          <UiTips
            tips={
              [
                {
                  type: "triggered",
                  position: {top: 80, right: 15},
                  text: i18n.homepageUiTipAlreadyHome(),
                  triggerId: "logo_home_link",
                  arrowDirection: "up_corner"
                }
              ]}
          />
        )}

        {isTeacher && (
          <TeacherHomepage
            announcements={[
              {
                heading: announcementHeading,
                buttonText: i18n.learnMore(),
                description: announcementDescription,
                link: announcementLink,
                image: "",
                type: announcementType,
                id: announcementId
              }
            ]}
            courses={homepageData.courses}
            joinedSections={homepageData.joined_sections}
            topCourse={homepageData.topCourse}
            isRtl={isRtl}
            queryStringOpen={query['open']}
            canViewAdvancedTools={homepageData.canViewAdvancedTools}
            isEnglish={isEnglish}
          />
        )}
        {!isTeacher && (
          <StudentHomepage
            courses={homepageData.courses}
            topCourse={homepageData.topCourse}
            sections={homepageData.sections}
            canLeave={homepageData.canLeave}
            isRtl={isRtl}
            canViewAdvancedTools={homepageData.canViewAdvancedTools}
          />
        )}
      </div>
    </Provider>,
    document.getElementById('homepage-container')
  );
}

window.CleverTakeoverManager = function (options) {
  this.options = options;
  const self = this;

  const linkCleverDiv = $('<div>');
  function showLinkCleverModal(cancel, submit) {
    $(document.body).append(linkCleverDiv);

    ReactDOM.render(
      <LinkCleverAccountModal
        isOpen={true}
        handleCancel={cancel}
        handleSubmit={submit}
      />,
      linkCleverDiv[0]
    );
  }

  if (self.options.cleverLinkFlag) {
    showLinkCleverModal(onCancelModal, onConfirmLink);
  }

  function closeLinkCleverModal() {
    ReactDOM.unmountComponentAtNode(linkCleverDiv[0]);
  }

  function onCancelModal() {
    $("#user_user_type").val("student");
    $.get("/users/clever_modal_dismissed");
    closeLinkCleverModal();
  }

  function onConfirmLink() {
    window.location.href = "/users/clever_takeover?mergeID=" + self.options.userIDToMerge + "&token=" + self.options.mergeAuthToken;
  }
};
