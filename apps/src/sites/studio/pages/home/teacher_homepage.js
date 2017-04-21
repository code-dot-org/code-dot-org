import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import TeacherHomepage from '@cdo/apps/templates/teacherHomepage/TeacherHomepage';
import Notification from '@cdo/apps/templates/Notification';
// import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';
// import CourseCard from '@cdo/apps/templates/CourseCard';

$(document).ready(showContent);


function showContent() {

  ReactDOM.render (
    <TeacherHomepage>
      <Notification
        type="information"
        notice="Teacher Homepage has been redesigned"
        details="Check out how snazzy it looks and how easy it is to find everything you need."
        dismissible={true}
      />

    </TeacherHomepage>,
    document.getElementById('container')
  );
}
