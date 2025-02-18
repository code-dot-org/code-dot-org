import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {getStore} from '@cdo/apps/code-studio/redux';
import Incubator from '@cdo/apps/templates/studioHomepages/Incubator';

$(document).ready(function () {
  ReactDOM.render(
    <Provider store={getStore()}>
      <Incubator />
    </Provider>,
    document.getElementById('incubator-container')
  );
});
