import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import TeacherHomepage from '@cdo/apps/templates/teacherHomepage/TeacherHomepage';
import StudentHomepage from '@cdo/apps/templates/teacherHomepage/StudentHomepage';

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
              heading: "Upcoming Changes to Site Navigation",
              buttonText: "Learn more",
              description: "Coming soon this summer, we’re improving navigation across the Code.org site so that you always have access to your top resources from anywhere on the site. As soon as you log in to your teacher account, every page will have a new navigation bar with links to your Homepage, Courses, Project Gallery, Sections, and Professional Learning.",
              link: "http://teacherblog.code.org/post/160703303174/coming-soon-access-your-top-resources-with-the",
              image: "coming-soon.png"
            }
          ]}
          courses={homepageData.courses}
          sections={homepageData.sections}
          codeOrgUrlPrefix={homepageData.codeOrgUrlPrefix}
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
