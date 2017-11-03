import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import EligibilityChecklist from '@cdo/apps/templates/EligibilityChecklist';
import { Status } from '@cdo/apps/lib/kits/maker/ui/SetupStep';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const scriptData = getScriptData('discountcode');

  ReactDOM.render(
    <EligibilityChecklist
      statusPD={scriptData.eligibility_status.statusPD ? Status.SUCCEEDED : Status.FAILED}
      statusStudentCount={scriptData.eligibility_status.statusStudentCount ? Status.SUCCEEDED : Status.FAILED}
    />
    , document.getElementById('discountcode')
  );
});
