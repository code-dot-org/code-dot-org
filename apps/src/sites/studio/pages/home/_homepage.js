import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import TeacherHomepage from '@cdo/apps/templates/studioHomepages/TeacherHomepage';
import StudentHomepage from '@cdo/apps/templates/studioHomepages/StudentHomepage';
import i18n from "@cdo/locale";

$(document).ready(showHomepage);

function showHomepage() {
  const script = document.querySelector('script[data-homepage]');
  const homepageData = JSON.parse(script.dataset.homepage);
  const isTeacher = !!homepageData.sections;

  ReactDOM.render (
    <div>
      {isTeacher && (
        <TeacherHomepage
          announcements={[
            {
              heading: i18n.announcementHeading(),
              buttonText: i18n.learnMore(),
              description: i18n.announcementDescription(),
              link: "http://teacherblog.code.org/post/160703303174/coming-soon-access-your-top-resources-with-the",
              image: "redesign-screencast"
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
