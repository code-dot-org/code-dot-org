import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import TeacherHomepage from '@cdo/apps/templates/teacherHomepage/TeacherHomepage';

$(document).ready(showContent);


function showContent() {

  ReactDOM.render (
    <TeacherHomepage/>
  ,
    document.getElementById('container')
  );
}
