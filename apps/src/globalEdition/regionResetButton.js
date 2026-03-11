import React from 'react';

import {default as GlobalEditionRegionResetButton} from '@cdo/apps/templates/globalEdition/RegionResetButton';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

document.addEventListener('DOMContentLoaded', () => {
  createReactRoot(
    <GlobalEditionRegionResetButton />,
    document.getElementById('global-edition-region-reset-button-container')
  );
});
