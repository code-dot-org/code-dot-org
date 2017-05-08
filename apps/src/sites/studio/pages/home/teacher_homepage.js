import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import TeacherHomepage from '@cdo/apps/templates/teacherHomepage/TeacherHomepage';

$(document).ready(showTeacherHomepage);

function showTeacherHomepage() {
  const coursesData = document.querySelector('script[data-courses]');
  const configCourses = JSON.parse(coursesData.dataset.courses);

  const courses = configCourses.map(course => (
      {
        key: course.id,
        courseName: course.name,
        description: course.description,
        image: course.image,
        link: course.link,
        assignedSections: []
      }
  ));

  ReactDOM.render (
    <TeacherHomepage
      announcements={[
        {
          heading: "Go beyond an Hour of Code",
          buttonText: "Go Beyond",
          description: "Go Beyond an Hour of Code and explore computer science concepts with your students every week. Code.org offers curriculum, lesson plans, high quality professional learning programs, and tons of great tools for all grade levels - and it's free. No experience required - find the next step that's right for your classroom.",
          link: "to wherever"
        }
      ]}
      courses={courses}
      sections={[
        {
          name: "Algebra Period 1",
          linkToProgress: "to Progress tab",
          course: "CS in Algebra",
          linkToCourse: "to Course",
          numberOfStudents: 14,
          linkToStudents: "to Manage Students tab",
          sectionCode: "ABCDEF"
        },
        {
          name: "Algebra Period 2",
          linkToProgress: "to Progress tab",
          course: "CS in Algebra",
          linkToCourse: "to Course",
          numberOfStudents: 19,
          linkToStudents: "to Manage Students tab",
          sectionCode: "EEB206"
        },
        {
          name: "Period 3",
          linkToProgress: "to Progress tab",
          course: "Course 4",
          linkToCourse: "to Course",
          numberOfStudents: 22,
          linkToStudents: "to Manage Students tab",
          sectionCode: "HPRWHG"
        },
      ]}
    />,
  document.getElementById('teacher-homepage-container')
  );
}
