import { createRoot } from "react-dom/client";
import React from 'react';
import ReactDOM from 'react-dom';

import {default as GlobalEditionRegionResetButton} from '@cdo/apps/templates/globalEdition/RegionResetButton';

document.addEventListener('DOMContentLoaded', () => {
  const root = createRoot(document.getElementById('global-edition-region-reset-button-container'));
  root.render(<GlobalEditionRegionResetButton />);
});
