import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Lab2 from '@cdo/apps/labs/views/lab2';

$(document).ready(function () {
  ReactDOM.render(<Lab2 />, document.getElementById('lab2-container'));
});
