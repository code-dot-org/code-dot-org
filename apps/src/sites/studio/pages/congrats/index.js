import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Congrats from '@cdo/apps/templates/certificates/Congrats';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import queryString from 'query-string';
import {tryGetLocalStorage} from '@cdo/apps/utils';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

$(document).ready(function () {
  const store = getStore();
  const script = document.querySelector('script[data-congrats]');
  const congratsData = JSON.parse(script.dataset.congrats);
  const userType = congratsData.current_user
    ? congratsData.current_user.user_type
    : 'signedOut';
  const language = congratsData.language;
  const under13 = congratsData.under_13;
  const nextCourseScriptName = congratsData.next_course_script_name;
  const nextCourseTitle = congratsData.next_course_title;
  const nextCourseDesc = congratsData.next_course_description;
  const randomDonorTwitter = congratsData.random_donor_twitter;
  const randomDonorName = congratsData.random_donor_name;
  // Allows us to conditionally hide the promotional card for the Dance Party
  // Extras tutorial if we have problems during Hour of Code.
  const hideDancePartyFollowUp = congratsData.hide_dance_followup;
  const certificateImageUrl = congratsData.certificate_image_url;
  const isHocTutorial = congratsData.is_hoc_tutorial;

  let certificateId = '';
  let tutorial = '';
  try {
    const params = queryString.parse(window.location.search);
    certificateId = params['i'] && params['i'].replace(/[^a-z0-9_]/g, '');
    const s = params['s'];
    tutorial = s ? atob(s).replace(/[^A-Za-z0-9_\- ]/g, '') : 'hourofcode';
  } catch (e) {}

  const mcShareLink = tryGetLocalStorage('craftHeroShareLink', '');

  userType === 'teacher' &&
    analyticsReporter.sendEvent(EVENTS.TEACHER_HOC_CONGRATS_PAGE_VISITED);

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
        initialCertificateImageUrl={certificateImageUrl}
        isHocTutorial={isHocTutorial}
        nextCourseScriptName={nextCourseScriptName}
        nextCourseTitle={nextCourseTitle}
        nextCourseDesc={nextCourseDesc}
      />
    </Provider>,
    document.getElementById('congrats-container')
  );
});
