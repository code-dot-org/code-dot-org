import React from 'react';
import {createRoot} from 'react-dom/client';

import WorkshopLinkAccountPage from '@cdo/apps/lib/ui/simpleSignUp/workshop/WorkshopLinkAccountPage';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function () {
  const props = getScriptData('props');

  const root = createRoot(
    document.getElementById('workshop-enroll-simple-sign-up')
  );

  root.render(
    <WorkshopLinkAccountPage
      newAccountUrl={props.new_account_url}
      existingAccountUrl={props.existing_account_url}
    />
  );
});
