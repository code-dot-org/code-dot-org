import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
// import GradientNavCard from '@cdo/apps/templates/teacherHomepage/GradientNavCard';
import CourseCard from '@cdo/apps/templates/teacherHomepage/CourseCard';
import TeacherHomepage from '@cdo/apps/templates/teacherHomepage/TeacherHomepage';

$(document).ready(showContent);

function showContent() {

  const teacherHomepageData = document.querySelector('script[data-teacherhomepage]');
  const config = JSON.parse(teacherHomepageData.dataset.teacherhomepage);

  const CourseCard1 = {
    courseName: config.course1name,
    description: config.course1description,
    image: "this is where there will be the source for the photo",
    link: config.course1link,
    assignedSections: ["Section 1", "Section 2"]
  };

  const CourseCard2 = {
    courseName: config.course2name,
    description: config.course2description,
    image: "this is where there will be the source for the photo",
    link: config.course2link,
    assignedSections: ["Section 1"]
  };

  ReactDOM.render (
    <TeacherHomepage>
      <CourseCard
        cardData={CourseCard1}
      />
      <CourseCard
        cardData={CourseCard2}
      />
  </TeacherHomepage>,
    document.getElementById('container')
  );
}
