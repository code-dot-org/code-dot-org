import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import RegionalPartnerPlaybook from '@cdo/apps/lib/ui/RegionalPartnerPlaybook';
import {getStore, registerReducers} from '@cdo/apps/redux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import responsive from '@cdo/apps/code-studio/responsiveRedux';
import initResponsive from '@cdo/apps/code-studio/responsive';

registerReducers({isRtl, responsive});

document.addEventListener('DOMContentLoaded', () => {
  initResponsive();

  const container = document.getElementById('regional-partner-playbook');
  ReactDOM.render(
    <Provider store={getStore()}>
      <RegionalPartnerPlaybook />
    </Provider>,
    container
  );
});
