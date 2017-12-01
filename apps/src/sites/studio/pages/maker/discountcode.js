import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import EligibilityChecklist from '@cdo/apps/lib/kits/maker/ui/EligibilityChecklist';
import DiscountAdminOverride from '@cdo/apps/lib/kits/maker/ui/DiscountAdminOverride';
import { Status } from '@cdo/apps/lib/ui/ValidationStep';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const scriptData = getScriptData('discountcode');
  let { application, is_admin } = scriptData;

  // Generating users with the right eligibility status is non-trivial. As a way
  // to get around this and be able to test this feature more easily, allow tester
  // to put data in sessionStorage to override what the server says.
  // We may want to remove this before shipping, though we'll likely want to make
  // the server resilient to this anyways.
  // To set, do something like:
  // sessionStorage.setItem('testOnlyScriptData', JSON.stringify({is_pd_eligible: true, is_progress_eligible: true}))
  const testOnlyScriptData = sessionStorage.getItem('testOnlyScriptData');
  if (testOnlyScriptData) {
    application = {
      ...application,
      ...JSON.parse(testOnlyScriptData)
    };
  }

  ReactDOM.render(
    <div>
      {is_admin &&
        <DiscountAdminOverride
          statusPD={Status.FAILED}
          statusStudentCount={Status.FAILED}
        />
      }
      {!is_admin &&
        <EligibilityChecklist
          statusPD={application.is_pd_eligible ? Status.SUCCEEDED : Status.FAILED}
          statusStudentCount={application.is_progress_eligible ? Status.SUCCEEDED : Status.FAILED}
          unit6Intention={application.unit_6_intention}
          schoolId={application.school_id}
          schoolName={application.school_name}
          hasConfirmedSchool={application.has_confirmed_school}
          getsFullDiscount={application.gets_full_discount}
          initialDiscountCode={application.discount_code}
        />
      }
    </div>
    , document.getElementById('discountcode')
  );
});
