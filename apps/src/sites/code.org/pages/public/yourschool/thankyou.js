import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import YourSchoolResources from '@cdo/apps/templates/census2017/YourSchoolResources';
import initResponsive from '@cdo/apps/code-studio/responsive';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import responsive from '@cdo/apps/code-studio/responsiveRedux';
import {getStore, registerReducers} from '@cdo/apps/redux';

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
