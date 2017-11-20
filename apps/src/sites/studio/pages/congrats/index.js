import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {isRtlFromDOM} from '@cdo/apps/code-studio/isRtlRedux';
import Congrats from '@cdo/apps/templates/Congrats';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import queryString from 'query-string';
import {tryGetLocalStorage} from '@cdo/apps/utils';

$(document).ready(function () {
  const store = getStore();
  const isRtl = isRtlFromDOM();
  const script = document.querySelector('script[data-congrats]');
  const congratsData = JSON.parse(script.dataset.congrats);
  const userType = congratsData.current_user ? congratsData.current_user.user_type : "signedOut";
  const isEnglish = congratsData.english;
  const userAge = congratsData.user_age;

  let certificateId = '';
  let tutorial = '';
  try {
    const params = queryString.parse(window.location.search);
    certificateId = params['i'].replace(/[^a-z0-9_]/g, '');
    tutorial = atob(params['s']).replace(/[^A-Za-z0-9_\- ]/g, '');
  } catch (e) {}

  const mcShareLink = tryGetLocalStorage('craftHeroShareLink', '');

  ReactDOM.render(
    <Provider store={store}>
      <Congrats
        certificateId={certificateId}
        tutorial={tutorial}
        isRtl={isRtl}
        userType={userType}
        userAge={userAge}
        isEnglish={isEnglish}
        MCShareLink={mcShareLink}
      />
    </Provider>,
    document.getElementById('congrats-container')
  );
});
