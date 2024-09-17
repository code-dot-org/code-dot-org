import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import initResponsive from '@cdo/apps/code-studio/responsive';
import responsive from '@cdo/apps/code-studio/responsiveRedux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import YourSchoolResources from '@cdo/apps/templates/census2017/YourSchoolResources';

registerReducers({isRtl, responsive});

document.addEventListener('DOMContentLoaded', () => {
  initResponsive();

  const container = document.getElementById('thankyou');
  ReactDOM.render(
    <Provider store={getStore()}>
      <YourSchoolResources />
    </Provider>,
    container
  );
});
