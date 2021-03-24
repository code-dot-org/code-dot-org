import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

$(document).ready(initPage);

function initPage() {
  ReactDOM.render(<p>Coming Soon</p>, document.getElementById('roll_up'));
}
