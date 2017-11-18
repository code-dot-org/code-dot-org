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
  const userType = congratsData.current_user ? congratsData.current_user.user_type : "signedOut";
  const isEnglish = congratsData.english;

  ReactDOM.render(
    <Provider store={store}>
      <Congrats
        completedTutorialType="2017Minecraft"
        isRtl={isRtl}
        userType={userType}
        isEnglish={isEnglish}
        MCShareLink="minecraft/sharelink"
      />
    </Provider>,
    document.getElementById('congrats-container')
  );
});
