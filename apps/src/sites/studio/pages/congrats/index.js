import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Congrats from '@cdo/apps/templates/certificates/Congrats';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import queryString from 'query-string';
import {tryGetLocalStorage} from '@cdo/apps/utils';
import experiments from '@cdo/apps/util/experiments';

$(document).ready(function() {
  const store = getStore();
  const script = document.querySelector('script[data-congrats]');
  const congratsData = JSON.parse(script.dataset.congrats);
  const userType = congratsData.current_user
    ? congratsData.current_user.user_type
    : 'signedOut';
  const language = congratsData.language;
  const under13 = congratsData.under_13;
  const randomDonorTwitter = congratsData.random_donor_twitter;
  const randomDonorName = congratsData.random_donor_name;
  // Allows us to conditionally hide the promotional card for the Dance Party
  // Extras tutorial if we have problems during Hour of Code.
  const hideDancePartyFollowUp = congratsData.hide_dance_followup;

  let certificateId = '';
  let tutorial = '';
  try {
    const params = queryString.parse(window.location.search);
    certificateId = params['i'] && params['i'].replace(/[^a-z0-9_]/g, '');
    tutorial = atob(params['s']).replace(/[^A-Za-z0-9_\- ]/g, '');
  } catch (e) {}

  const mcShareLink = tryGetLocalStorage('craftHeroShareLink', '');
  const showStudioCertificate = experiments.isEnabled(
    experiments.STUDIO_CERTIFICATE
  );
  ReactDOM.render(
    <Provider store={store}>
      <Congrats
        certificateId={certificateId}
        tutorial={tutorial}
        userType={userType}
        under13={under13}
        language={language}
        MCShareLink={mcShareLink}
        randomDonorTwitter={randomDonorTwitter}
        randomDonorName={randomDonorName}
        hideDancePartyFollowUp={hideDancePartyFollowUp}
        showStudioCertificate={showStudioCertificate}
      />
    </Provider>,
    document.getElementById('congrats-container')
  );
});
