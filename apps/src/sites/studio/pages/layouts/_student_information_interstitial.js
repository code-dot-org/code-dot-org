import $ from 'jquery';
import getScriptData from '@cdo/apps/util/getScriptData';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {queryParams} from '@cdo/apps/code-studio/utils';

const retrieveInfoForCap = getScriptData('retrieveInfoForCap');
const userId = getScriptData('userId');
const inSection = getScriptData('inSection');
const previousStateValue = getScriptData('currentUsState');
const selectedLanguage = getScriptData('selectedLanguage');
const forceStudentInterstitial = queryParams('forceStudentInterstitial');

$(document).ready(function () {
  const pathName = window.location.pathname;
  const modal = $('#student-information-modal');
  const form = $('#edit_user');

  if (pathName !== '/lti/v1/authenticate') {
    modal.modal('show');
    (retrieveInfoForCap || forceStudentInterstitial) &&
      analyticsReporter.sendEvent(EVENTS.CAP_STATE_FORM_SHOW, {
        user_id: userId,
        in_section: inSection,
        selected_language: selectedLanguage,
      });
  }

  form.on('ajax:success', () => {
    const newStateValue = $('#user_us_state').val();
    if (newStateValue && (retrieveInfoForCap || forceStudentInterstitial))
      analyticsReporter.sendEvent(EVENTS.CAP_STATE_FORM_PROVIDED, {
        user_id: userId,
        in_section: inSection,
        us_state: newStateValue,
        previous_us_state: previousStateValue,
        selected_language: selectedLanguage,
      });

    retrieveInfoForCap || forceStudentInterstitial
      ? location.reload()
      : modal.modal('hide');
  });

  $('#sign-out-btn').on('click', () => {
    (retrieveInfoForCap || forceStudentInterstitial) &&
      analyticsReporter.sendEvent(EVENTS.CAP_STATE_FORM_DISMISSED, {
        user_id: userId,
        in_section: inSection,
        selected_language: selectedLanguage,
      });
  });
});
