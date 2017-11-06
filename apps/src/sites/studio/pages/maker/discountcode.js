import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import EligibilityChecklist from '@cdo/apps/templates/EligibilityChecklist';
import { Status } from '@cdo/apps/lib/kits/maker/ui/SetupStep';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const scriptData = getScriptData('discountcode');

  let eligibilityStatus = scriptData.eligibility_status;

  // Generating users with the right eligibility status is non-trivial. As a way
  // to get around this and be able to test this feature more easily, allow tester
  // to put data in sessionStorage to override what the server says.
  // We may want to remove this before shipping, though we'll likely want to make
  // the server resilient to this anyways.
  // To set, do something like:
  // sessionStorage.setItem('testOnlyEligibilityStatus', JSON.stringify({is_pd_eligible: true, is_progress_eligible: true}))
  const testOnlyEligibilityStatus = sessionStorage.getItem('testOnlyEligibilityStatus');
  if (testOnlyEligibilityStatus) {
    eligibilityStatus = {
      ...eligibilityStatus,
      ...JSON.parse(testOnlyEligibilityStatus)
    };
  }

  ReactDOM.render(
    <EligibilityChecklist
      statusPD={eligibilityStatus.is_pd_eligible ? Status.SUCCEEDED : Status.FAILED}
      statusStudentCount={eligibilityStatus.is_progress_eligible ? Status.SUCCEEDED : Status.FAILED}
    />
    , document.getElementById('discountcode')
  );
});
