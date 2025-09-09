import React from 'react';
import ReactDOM from 'react-dom';

import {default as GlobalEditionRegionResetButton} from '@cdo/apps/templates/globalEdition/RegionResetButton';

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <GlobalEditionRegionResetButton />,
    document.getElementById('global-edition-region-reset-button-container')
  );
});
