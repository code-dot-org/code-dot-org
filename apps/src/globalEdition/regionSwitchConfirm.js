import React from 'react';
import ReactDOM from 'react-dom';

import {default as GlobalEditionRegionSwitchConfirm} from '@cdo/apps/templates/globalEdition/RegionSwitchConfirm';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <GlobalEditionRegionSwitchConfirm
      country={getScriptData('country')}
      region={getScriptData('region')}
    />,
    document.getElementById('global-edition-region-switch-confirm-container')
  );
});
