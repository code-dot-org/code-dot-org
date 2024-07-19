import $ from 'jquery';
import queryString from 'query-string';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import Congrats from '@cdo/apps/templates/certificates/Congrats';
import {tryGetLocalStorage} from '@cdo/apps/utils';

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
  const certificateData = congratsData.certificate_data;
  const curriculumUrl = congratsData.curriculum_url;
  const isHocTutorial = congratsData.is_hoc_tutorial;
  const isPlCourse = congratsData.is_pl_course;
  const isK5PlCourse = congratsData.is_k5_pl_course;
  const courseName = congratsData.course_name || 'hourofcode';

  let certificateId = '';
  try {
    const params = queryString.parse(window.location.search);
    certificateId = params['i'] && params['i'].replace(/[^a-z0-9_]/g, '');
  } catch (e) {}

  const mcShareLink = tryGetLocalStorage('craftHeroShareLink', '');

  userType === 'teacher' &&
    analyticsReporter.sendEvent(EVENTS.TEACHER_VISITED_CONGRATS_PAGE, {
      isHocTutorial,
      isPlCourse,
      isK5PlCourse,
      courseNames: certificateData.map(data => data.courseName),
    });

  ReactDOM.render(
    <Provider store={store}>
      <Congrats
        certificateId={certificateId}
        tutorial={courseName}
        userType={userType}
        under13={under13}
        language={language}
        MCShareLink={mcShareLink}
        randomDonorTwitter={randomDonorTwitter}
        randomDonorName={randomDonorName}
        hideDancePartyFollowUp={hideDancePartyFollowUp}
        certificateData={certificateData}
        isHocTutorial={isHocTutorial}
        isPlCourse={isPlCourse}
        isK5PlCourse={isK5PlCourse}
        nextCourseScriptName={nextCourseScriptName}
        nextCourseTitle={nextCourseTitle}
        nextCourseDesc={nextCourseDesc}
        curriculumUrl={curriculumUrl}
      />
    </Provider>,
    document.getElementById('congrats-container')
  );
});
