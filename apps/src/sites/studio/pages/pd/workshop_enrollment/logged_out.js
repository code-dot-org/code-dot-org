import React from 'react';
import ReactDOM from 'react-dom';

import WorkshopLinkAccountPage from '@cdo/apps/lib/ui/simpleSignUp/workshop/WorkshopLinkAccountPage';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function () {
  const props = getScriptData('props');

  ReactDOM.render(
    <WorkshopLinkAccountPage
      newAccountUrl={props.new_account_url}
      existingAccountUrl={props.existing_account_url}
    />,
    document.getElementById('workshop-enroll-simple-sign-up')
  );
});
