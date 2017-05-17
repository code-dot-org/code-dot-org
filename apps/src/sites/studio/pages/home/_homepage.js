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
              heading: "Go beyond an Hour of Code",
              buttonText: "Go Beyond",
              description: "Go Beyond an Hour of Code and explore computer science concepts with your students every week. Code.org offers curriculum, lesson plans, high quality professional learning programs, and tons of great tools for all grade levels - and it's free. No experience required - find the next step that's right for your classroom.",
              link: "http://teacherblog.code.org/"
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
