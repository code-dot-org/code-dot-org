import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import EligibilityChecklist from '@cdo/apps/lib/kits/maker/ui/EligibilityChecklist';
import { Status } from '@cdo/apps/lib/ui/ValidationStep';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  let scriptData = getScriptData('discountcode');

  // Generating users with the right eligibility status is non-trivial. As a way
  // to get around this and be able to test this feature more easily, allow tester
  // to put data in sessionStorage to override what the server says.
  // We may want to remove this before shipping, though we'll likely want to make
  // the server resilient to this anyways.
  // To set, do something like:
  // sessionStorage.setItem('testOnlyScriptData', JSON.stringify({is_pd_eligible: true, is_progress_eligible: true}))
  const testOnlyScriptData = sessionStorage.getItem('testOnlyScriptData');
  if (testOnlyScriptData) {
    scriptData = {
      ...scriptData,
      ...JSON.parse(testOnlyScriptData)
    };
  }

  ReactDOM.render(
    <div>
      <EligibilityChecklist
        statusPD={scriptData.is_pd_eligible ? Status.SUCCEEDED : Status.FAILED}
        statusStudentCount={scriptData.is_progress_eligible ? Status.SUCCEEDED : Status.FAILED}
        unit6Intention={scriptData.unit_6_intention}
        schoolId={scriptData.school_id}
        schoolName={scriptData.school_name}
        hasConfirmedSchool={scriptData.has_confirmed_school}
        getsFullDiscount={scriptData.gets_full_discount}
        initialDiscountCode={scriptData.discount_code}
      />
    </div>
    , document.getElementById('discountcode')
  );
});
