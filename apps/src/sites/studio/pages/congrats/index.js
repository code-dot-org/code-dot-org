import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Notification from '@cdo/apps/templates/Notification';

$(document).ready(function () {
  ReactDOM.render(
    <Notification
      type="bullhorn"
      notice="There's a new congrats page!"
      details="If you complete a Code.org Hour of Code tutorial, you'll end up here."
      dismissible={false}
      isRtl={false}
    />,
    document.getElementById('congrats-container')
  );
});
