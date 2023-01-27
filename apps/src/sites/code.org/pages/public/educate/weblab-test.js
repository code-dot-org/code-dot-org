import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import WebLabTest from '@cdo/apps/templates/testPages/WebLabTest.jsx';

$(document).ready(showWebLabTest);

function showWebLabTest() {
  const container = document.getElementById('weblab-test');
  ReactDOM.render(<WebLabTest />, container);
}
