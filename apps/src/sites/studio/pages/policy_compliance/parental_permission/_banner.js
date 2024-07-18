import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';

import {getStore} from '@cdo/apps/redux';
import ParentalPermissionBanner from '@cdo/apps/templates/policy_compliance/ParentalPermissionBanner';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', () => {
  const root = createRoot(
    document.getElementById('parental-permission-banner-container')
  );

  root.render(
    <Provider store={getStore()}>
      <ParentalPermissionBanner lockoutDate={getScriptData('lockoutDate')} />
    </Provider>
  );
});
