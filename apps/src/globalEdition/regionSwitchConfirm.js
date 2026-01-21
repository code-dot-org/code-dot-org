import { createRoot } from "react-dom/client";
import React from 'react';
import ReactDOM from 'react-dom';

import {default as GlobalEditionRegionSwitchConfirm} from '@cdo/apps/templates/globalEdition/RegionSwitchConfirm';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', () => {
  const root = createRoot(document.getElementById('global-edition-region-switch-confirm-container'));

  root.render(<GlobalEditionRegionSwitchConfirm
    code={getScriptData('code')}
    name={getScriptData('name')}
  />);
});
