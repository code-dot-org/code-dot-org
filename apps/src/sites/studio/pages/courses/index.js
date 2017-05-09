import React from 'react';
import ReactDOM from 'react-dom';

$(document).ready(showCourseOverview);

function showCourseOverview() {
  const courseData = document.querySelector('script[data-coursedata]');
  const configCourse = JSON.parse(courseData.dataset.coursedata);

  ReactDOM.render(<h1>{configCourse.name}</h1>, document.getElementById('course_index'));
}
