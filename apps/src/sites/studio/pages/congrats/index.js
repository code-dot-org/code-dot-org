import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {isRtlFromDOM} from '@cdo/apps/code-studio/isRtlRedux';
import Congrats from '@cdo/apps/templates/Congrats';
import {Provider} from 'react-redux';
import {combineReducers, createStore} from 'redux';
import queryString from 'query-string';

$(document).ready(function () {
  const store = createStore(combineReducers({isRtl}));
  const script = document.querySelector('script[data-congrats]');
  const congratsData = JSON.parse(script.dataset.congrats);
  const userType = congratsData.current_user ? congratsData.current_user.user_type : "signedOut";
  const isEnglish = congratsData.english;
  const userAge = congratsData.user_age;
  const isRtl = isRtlFromDOM();

  let certificateId = '';
  let tutorial = '';
  try {
    const params = queryString.parse(window.location.search);
    certificateId = params['i'].replace(/[^a-z0-9_]/g, '');
    tutorial = atob(params['s']).replace(/[^A-Za-z0-9_\- ]/g, '');
  } catch (e) {}

  ReactDOM.render(
    <Provider store={store}>
      <Congrats
        certificateId={certificateId}
        tutorial={tutorial}
        userType={userType}
        userAge={userAge}
        isEnglish={isEnglish}
        MCShareLink="minecraft/sharelink"
      />
    </Provider>,
    document.getElementById('congrats-container')
  );
});
