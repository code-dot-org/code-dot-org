import React from 'react';
import {Provider} from 'react-redux';

import SetupGuide from '@cdo/apps/maker/ui/SetupGuide';
import {getStore} from '@cdo/apps/redux';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(function () {
  createReactRoot(
    <Provider store={getStore()}>
      <SetupGuide />
    </Provider>,
    document.getElementById('maker-setup')
  );
});
