import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import SchoolInfoBox from '@cdo/apps/code-studio/districtDropdown/SchoolInfoBox.jsx';

$(document).ready(renderSchoolInfoDropdown);

function renderSchoolInfoDropdown() {
  var schoolInfoElement = document.getElementById('schooldropdown-block');
  ReactDOM.render(
    <SchoolInfoBox />,
    schoolInfoElement
  );
}
