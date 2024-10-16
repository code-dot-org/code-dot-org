import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import Lab2 from '@cdo/apps/lab2/views/Lab2';

$(document).ready(function () {
  ReactDOM.render(<Lab2 />, document.getElementById('lab2-container'));
});
