import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import EligibilityChecklist2019 from '@cdo/apps/lib/kits/maker/ui/EligibilityChecklist2019';
import DiscountAdminOverride from '@cdo/apps/lib/kits/maker/ui/DiscountAdminOverride';
import { Status } from '@cdo/apps/lib/ui/ValidationStep';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const scriptData = getScriptData('discountcode');
  let { application, is_admin } = scriptData;

  ReactDOM.render(
    <div>
      {is_admin &&
        <DiscountAdminOverride/>
      }
      {!is_admin &&
        <EligibilityChecklist2019
          statusPD={application.is_pd_eligible ? Status.SUCCEEDED : Status.FAILED}
          statusStudentCount={application.is_progress_eligible ? Status.SUCCEEDED : Status.FAILED}
          unit6Intention={application.unit_6_intention}
          schoolId={application.school_id}
          schoolName={application.school_name}
          hasConfirmedSchool={application.has_confirmed_school}
          getsFullDiscount={application.gets_full_discount}
          initialDiscountCode={application.discount_code}
          initialExpiration={application.expiration}
          adminSetStatus={application.admin_set_status}
          currentlyDistributingDiscountCodes
        />
      }
      {/* TODO: Associate currentDistributingDiscountCode with a flag or user permission */}
    </div>
    , document.getElementById('discountcode')
  );
});
