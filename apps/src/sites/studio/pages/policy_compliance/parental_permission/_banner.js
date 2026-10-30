import React from 'react';
import {Provider} from 'react-redux';

import {getStore} from '@cdo/apps/redux';
import ParentalPermissionBanner from '@cdo/apps/templates/policy_compliance/ParentalPermissionBanner';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', () => {
  createReactRoot(
    <Provider store={getStore()}>
      <ParentalPermissionBanner lockoutDate={getScriptData('lockoutDate')} />
    </Provider>,
    document.getElementById('parental-permission-banner-container')
  );
});
