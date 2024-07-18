import $ from 'jquery';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';

import {getStore} from '@cdo/apps/code-studio/redux';
import Incubator from '@cdo/apps/templates/studioHomepages/Incubator';

$(document).ready(function () {
  const root = createRoot(document.getElementById('incubator-container'));

  root.render(
    <Provider store={getStore()}>
      <Incubator />
    </Provider>
  );
});
