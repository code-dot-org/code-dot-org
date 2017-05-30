import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import TeacherHomepage from '@cdo/apps/templates/studioHomepages/TeacherHomepage';
import StudentHomepage from '@cdo/apps/templates/studioHomepages/StudentHomepage';
import UiTips from '@cdo/apps/templates/studioHomepages/UiTips';
import i18n from "@cdo/locale";

$(document).ready(showHomepage);

function showHomepage() {
  const script = document.querySelector('script[data-homepage]');
  const homepageData = JSON.parse(script.dataset.homepage);
  const isTeacher = !!homepageData.sections;
  const showUiTips = homepageData.showuitips;
  const userId = homepageData.userid;
  const showInitialTips = !homepageData.initialtipsdismissed;

  ReactDOM.render (
    <div>
      {showUiTips && (
        <UiTips
          userId={userId}
          tipId={"homepage_header"}
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
            onConfirm: {action: "url", url: "http://blog.code.org"}
          }}
          tips={
            [
              {type: "initial", position: {top: 80, left: 100}, text: i18n.homepageUiTipKeyLinks()},
              {type: "initial", position: {top: 80, right: 50}, text: i18n.homepageUiTipOtherLinks()},
              {type: "triggered", position: {top: 80, right: 50}, text: i18n.homepageUiTipAlreadyHome(), triggerId: "logo_home_link"}
            ]}
        />
      )}

      {isTeacher && (
        <TeacherHomepage
          announcements={[
            {
              heading: "Upcoming Changes to Site Navigation",
              buttonText: "Learn more",
              description: "Coming soon this summer, we’re improving navigation across the Code.org site so that you always have access to your top resources from anywhere on the site. As soon as you log in to your teacher account, every page will have a new navigation bar with links to your Homepage, Courses, Project Gallery, Sections, and Professional Learning.",
              link: "http://teacherblog.code.org/post/160703303174/coming-soon-access-your-top-resources-with-the",
              image: "navcard-placeholder.png"
            }
          ]}
          courses={homepageData.courses}
          sections={homepageData.sections}
          codeOrgUrlPrefix={homepageData.codeorgurlprefix}
        />
      )}
      {!isTeacher && (
        <StudentHomepage
          courses={homepageData.courses}
        />
      )}
    </div>,
    document.getElementById('homepage-container')
  );
}
