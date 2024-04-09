import $ from 'jquery';
import getScriptData from '@cdo/apps/util/getScriptData';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

const retrieveInfoForCap = getScriptData('retrieveInfoForCap');
const userId = getScriptData('userId');
const inSection = getScriptData('inSection');

$(document).ready(function () {
  const pathName = window.location.pathname;

  if (pathName !== '/lti/v1/authenticate') {
    $('#student-information-modal').modal('show');
    retrieveInfoForCap &&
      analyticsReporter.sendEvent(EVENTS.CAP_STATE_FORM_SHOW, {
        user_id: userId,
        in_section: inSection,
      });
  }

  function checkInputs() {
    const ageValue = $('#user_age').val();
    const stateValue = $('#user_us_state').val();
    if (ageValue !== '') {
      $('.age-required').hide();
    } else {
      $('.age-required').show();
    }
    if (stateValue !== '') {
      $('.state-required').hide();
    } else {
      $('.state-required').show();
    }
    $('#edit_user #submit-btn').prop(
      'disabled',
      ageValue === '' || stateValue === ''
    );
  }

  $('#edit_user select').on('change', function (event) {
    checkInputs();
  });

  $('#edit_user').submit(function (event) {
    event.preventDefault($(this).serialize());
    const stateValue = $('#user_us_state').val();
    if (stateValue !== '')
      analyticsReporter.sendEvent(EVENTS.CAP_STATE_FORM_PROVIDED, {
        user_id: userId,
        in_section: inSection,
        us_state: stateValue,
      });
    $.ajax({
      type: 'POST',
      url: $(this).attr('action') + '/set_student_information',
      data: $(this).serialize(),
      dataType: 'json',
      success: function (data) {
        retrieveInfoForCap
          ? location.reload()
          : $('#student-information-modal').modal('hide');
      },
    });
  });

  $('#sign-out-btn').click(function (event) {
    window.location = '#{destroy_user_session_url}';
  });

  checkInputs();
});
