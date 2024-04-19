import $ from 'jquery';
import getScriptData from '@cdo/apps/util/getScriptData';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {queryParams} from '@cdo/apps/code-studio/utils';

const retrieveInfoForCap = getScriptData('retrieveInfoForCap');
const userId = getScriptData('userId');
const inSection = getScriptData('inSection');
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
      });
  }

  form.on('ajax:success', () => {
    retrieveInfoForCap || forceStudentInterstitial
      ? location.reload()
      : modal.modal('hide');
  });

  form.on('submit', () => {
    const stateValue = $('#user_us_state').val();
    if (stateValue && (retrieveInfoForCap || forceStudentInterstitial))
      analyticsReporter.sendEvent(EVENTS.CAP_STATE_FORM_PROVIDED, {
        user_id: userId,
        in_section: inSection,
        us_state: stateValue,
      });
  });
});
