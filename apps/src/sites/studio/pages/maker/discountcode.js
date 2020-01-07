import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import EligibilityChecklist from '@cdo/apps/lib/kits/maker/ui/EligibilityChecklist';
import DiscountAdminOverride from '@cdo/apps/lib/kits/maker/ui/DiscountAdminOverride';
import {Status} from '@cdo/apps/lib/ui/ValidationStep';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const scriptData = getScriptData('discountcode');
  let {
    application,
    is_admin,
    currently_distributing_discount_codes
  } = scriptData;

  ReactDOM.render(
    <div>
      {is_admin && <DiscountAdminOverride />}
      {!is_admin && (
        <EligibilityChecklist
          statusPD={
            application.is_pd_eligible ? Status.SUCCEEDED : Status.FAILED
          }
          statusStudentCount={
            application.is_progress_eligible ? Status.SUCCEEDED : Status.FAILED
          }
          unit6Intention={application.unit_6_intention}
          schoolId={application.school_id}
          schoolName={application.school_name}
          schoolHighNeedsEligible={application.school_high_needs_eligible}
          hasConfirmedSchool={application.has_confirmed_school}
          initialDiscountCode={application.discount_code}
          initialExpiration={application.expiration}
          adminSetStatus={application.admin_set_status}
          currentlyDistributingDiscountCodes={
            currently_distributing_discount_codes
          }
        />
      )}
    </div>,
    document.getElementById('discountcode')
  );
});
