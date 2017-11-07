import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {isRtlFromDOM} from '@cdo/apps/code-studio/isRtlRedux';
import Congrats from '@cdo/apps/templates/Congrats';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';

$(document).ready(function () {
  const store = getStore();
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
    case 'hero':
        completedTutorialType = '2017Minecraft';
        break;
    // 2017 applab HoC tutorial
    case 'applab-intro':
        completedTutorialType = 'applab';
        break;
    default:
      completedTutorialType = 'other';
}

  ReactDOM.render(
    <Provider store={store}>
      <Congrats
        completedTutorialType={completedTutorialType}
        isRtl={isRtl}
      />
    </Provider>,
    document.getElementById('congrats-container')
  );
});
