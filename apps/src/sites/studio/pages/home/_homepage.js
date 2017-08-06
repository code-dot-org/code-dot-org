import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {isRtlFromDOM} from '@cdo/apps/code-studio/isRtlRedux';
import TeacherHomepage from '@cdo/apps/templates/studioHomepages/TeacherHomepage';
import StudentHomepage from '@cdo/apps/templates/studioHomepages/StudentHomepage';
import UiTips from '@cdo/apps/templates/studioHomepages/UiTips';
import i18n from "@cdo/locale";
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import oauthClassroom from '@cdo/apps/templates/teacherDashboard/oauthClassroomRedux';
import teacherSections, {setValidGrades} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

$(document).ready(showHomepage);

function showHomepage() {
  const isRtl = isRtlFromDOM();
  const script = document.querySelector('script[data-homepage]');
  const homepageData = JSON.parse(script.dataset.homepage);
  const isTeacher = homepageData.isTeacher;
  const showUiTips = homepageData.showuitips;
  const userId = homepageData.userid;
  const showInitialTips = !homepageData.initialtipsdismissed;

  registerReducers({teacherSections, oauthClassroom});
  const store = getStore();
  store.dispatch(setValidGrades(homepageData.valid_grades));

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
                heading: i18n.announcementHeadingCsfAtoF(),
                buttonText: i18n.learnMore(),
                description: i18n.announcementDescriptionCsfAtoF(),
                link: " http://teacherblog.code.org/post/163102110459/codeorg-updates-cs-fundamentals-courses-1-4-to",
                image: "",
                id: "csf_new_courses_A_F"
              }
            ]}
            courses={homepageData.courses}
            sections={homepageData.sections}
            isRtl={isRtl}
          />
        )}
        {!isTeacher && (
          <StudentHomepage
            courses={homepageData.courses}
            studentTopCourse={homepageData.studentTopCourse}
            sections={homepageData.sections}
            canLeave={homepageData.canLeave}
            isRtl={isRtl}
          />
        )}
      </div>
    </Provider>,
    document.getElementById('homepage-container')
  );
}
