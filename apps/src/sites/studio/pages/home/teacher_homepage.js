import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
// import GradientNavCard from '@cdo/apps/templates/teacherHomepage/GradientNavCard';
import CourseCard from '@cdo/apps/templates/teacherHomepage/CourseCard';

$(document).ready(showContent);

const ExampleCourseCard = {
  courseName: "CSP Unit 2 - Digital Information",
  description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
  image: "this is where there will be the source for the photo",
  link: "link to wherever you want the button to go...",
  assignedSections: ["Section 1",]
};


function showContent() {
  //go get this specific data off the script
  const teacherHomepageData = document.querySelector('script[data-teacherhomepage]');
  console.log(teacherHomepageData);
  const config = JSON.parse(teacherHomepageData.dataset.teacherhomepage);
  console.log(config);
  console.log(config.teacherHomepageData);
  console.log(config.teacherHomepageData[0].script);

  ReactDOM.render (
    <CourseCard
      cardData={ExampleCourseCard}
    />,
    document.getElementById('container')
  );
}
