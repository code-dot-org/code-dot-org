import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';

import SetupGuide from '@cdo/apps/lib/kits/maker/ui/SetupGuide';
import {getStore} from '@cdo/apps/redux';

$(function () {
  const root = createRoot(document.getElementById('maker-setup'));

  root.render(
    <Provider store={getStore()}>
      <SetupGuide />
    </Provider>
  );
});
