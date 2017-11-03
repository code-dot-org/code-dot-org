import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import EligibilityChecklist from '@cdo/apps/templates/EligibilityChecklist';
import { Status } from '@cdo/apps/lib/kits/maker/ui/SetupStep';

$(document).ready(() => {
  const script = document.querySelector('script[data-discountcode]');
  const scriptData = JSON.parse(script.dataset.discountcode);

  ReactDOM.render(
    <EligibilityChecklist
      statusPD={scriptData.eligibility_status.statusPD ? Status.SUCCEEDED : Status.FAILED}
      statusStudentCount={scriptData.eligibility_status.statusStudentCount ? Status.SUCCEEDED : Status.FAILED}
    />
    , document.getElementById('discountcode')
  );
});
