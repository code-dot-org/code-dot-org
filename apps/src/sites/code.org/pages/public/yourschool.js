import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import YourSchool from '@cdo/apps/templates/census2017/YourSchool';
import SchoolInfoManager from '@cdo/apps/schoolInfoManager';

window.SchoolInfoManager = SchoolInfoManager;

$(document).ready(showYourSchool);

function showYourSchool() {
  ReactDOM.render (
    <YourSchool/>,
    document.getElementById('your-school')
  );
}
