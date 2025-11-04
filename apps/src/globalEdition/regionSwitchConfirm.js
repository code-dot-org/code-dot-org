import React from 'react';

import {default as GlobalEditionRegionSwitchConfirm} from '@cdo/apps/templates/globalEdition/RegionSwitchConfirm';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', () => {
  createReactRoot(
    <GlobalEditionRegionSwitchConfirm
      code={getScriptData('code')}
      name={getScriptData('name')}
    />,
    document.getElementById('global-edition-region-switch-confirm-container')
  );
});
