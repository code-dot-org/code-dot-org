import { createRoot } from "react-dom/client";
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import SetupGuide from '@cdo/apps/maker/ui/SetupGuide';
import {getStore} from '@cdo/apps/redux';

$(function () {
  const root = createRoot(document.getElementById('maker-setup'));

  root.render(<Provider store={getStore()}>
    <SetupGuide />
  </Provider>);
});
