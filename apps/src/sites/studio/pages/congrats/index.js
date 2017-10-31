import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Congrats from '@cdo/apps/templates/Congrats';

$(document).ready(function () {
  ReactDOM.render(
    <Congrats
      completedTutorialType="other"
    />,
    document.getElementById('congrats-container')
  );
});
