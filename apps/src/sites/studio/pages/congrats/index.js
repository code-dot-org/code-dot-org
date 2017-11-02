import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {isRtlFromDOM} from '@cdo/apps/code-studio/isRtlRedux';
import Congrats from '@cdo/apps/templates/Congrats';

$(document).ready(function () {
  const isRtl = isRtlFromDOM();
  ReactDOM.render(
    <Congrats
      completedTutorialType="other"
      isRtl={isRtl}
    />,
    document.getElementById('congrats-container')
  );
});
