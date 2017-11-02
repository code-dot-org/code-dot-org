import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {isRtlFromDOM} from '@cdo/apps/code-studio/isRtlRedux';
import Congrats from '@cdo/apps/templates/Congrats';

$(document).ready(function () {
  const isRtl = isRtlFromDOM();
  const script = document.querySelector('script[data-congrats]');
  const congratsData = JSON.parse(script.dataset.congrats);

  let completedTutorialType = '';
  switch (congratsData.completedTutorialType) {
    // Minecraft designer or Minecraft adventurer
    case 'minecraft' || 'mc':
        completedTutorialType = 'pre2017Minecraft';
        break;
    // 2017 Minecraft
    // case :
    //     completedTutorialType = '2017Minecraft';
    //     break;
    // 2017 applab
    // case :
    //     completedTutorialType = 'applab';
    //     break;
    default:
      completedTutorialType = 'other';
}

  ReactDOM.render(
    <Congrats
      completedTutorialType={completedTutorialType}
      isRtl={isRtl}
    />,
    document.getElementById('congrats-container')
  );
});
