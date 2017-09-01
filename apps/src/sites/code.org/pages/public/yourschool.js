import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import YourSchool from '@cdo/apps/templates/YourSchool';

$(document).ready(showYourSchool);

function showYourSchool() {
  ReactDOM.render (
    <YourSchool/>,
    document.getElementById('your-school')
  );
}
