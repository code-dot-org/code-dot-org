import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import TeacherHomepage from '@cdo/apps/templates/teacherHomepage/TeacherHomepage';

$(document).ready(showContent);


function showContent() {

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
      courses={[
        {
          courseName: "Play Lab",
          description: "Create a story or make a game with Play Lab!",
          link: "https://code.org/playlab",
          image:"photo source",
          assignedSections: []
        },
        {
          courseName: "CSP Unit 2 - Digital Information",
          description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
          link: "https://curriculum.code.org/csp/unit2/",
          image:"photo source",
          assignedSections: []
        },
      ]}
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
    document.getElementById('container')
  );
}
