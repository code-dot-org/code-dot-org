import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import TeacherHomepage from '@cdo/apps/templates/teacherHomepage/TeacherHomepage';

$(document).ready(showTeacherHomepage);

function showTeacherHomepage() {
  const coursesData = document.querySelector('script[data-courses]');
  const configCourses = JSON.parse(coursesData.dataset.courses);

  const sectionsData = document.querySelector('script[data-sections]');
  const configSections = JSON.parse(sectionsData.dataset.sections);

  const script = document.querySelector('script[data-urlprefix]');
  const urlPrefix = script.dataset.urlprefix;

  ReactDOM.render (
    <TeacherHomepage
      announcements={[
        {
          heading: "Go beyond an Hour of Code",
          buttonText: "Go Beyond",
          description: "Go Beyond an Hour of Code and explore computer science concepts with your students every week. Code.org offers curriculum, lesson plans, high quality professional learning programs, and tons of great tools for all grade levels - and it's free. No experience required - find the next step that's right for your classroom.",
          link: "http://teacherblog.code.org/"
        }
      ]}
      courses={configCourses}
      sections={configSections}
      urlPrefix={urlPrefix}
    />,
    document.getElementById('teacher-homepage-container')
  );
}
