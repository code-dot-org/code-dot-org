import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import YourSchool from '@cdo/apps/templates/census2017/YourSchool';
import SchoolInfoManager from '@cdo/apps/schoolInfoManager';
import 'selectize';

window.SchoolInfoManager = SchoolInfoManager;

$(document).ready(showYourSchool);

function showYourSchool() {
  ReactDOM.render (
    <YourSchool
      alertHeading={$('#your-school').data("parameters-alert-heading")}
      alertText={$('#your-school').data("parameters-alert-text")}
      alertUrl={$('#your-school').data("parameters-alert-url")}
    />,
    $('#your-school')[0]
  );
}
