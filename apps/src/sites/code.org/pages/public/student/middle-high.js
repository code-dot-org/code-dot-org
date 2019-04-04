import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import MiddleHighResourceCards from './MiddleHighResourceCards';
import initResponsive from '@cdo/apps/code-studio/responsive';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import responsive from '@cdo/apps/code-studio/responsiveRedux';
import {getStore, registerReducers} from '@cdo/apps/redux';

registerReducers({isRtl, responsive});

document.addEventListener('DOMContentLoaded', () => {
  initResponsive();

  const container = document.getElementById('educate-resources-grid');
  ReactDOM.render(
    <Provider store={getStore()}>
      <MiddleHighResourceCards />
    </Provider>,
    container
  );
});
