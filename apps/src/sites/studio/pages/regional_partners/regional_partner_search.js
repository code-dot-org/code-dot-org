import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import initResponsive from '@cdo/apps/code-studio/responsive';
import responsive from '@cdo/apps/code-studio/responsiveRedux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import RegionalPartnerSearch from '@cdo/apps/templates/RegionalPartnerSearch';

registerReducers({isRtl, responsive});

$(document).ready(initRegionalPartnerSearch);

function showRegionalPartnerSearch() {
  const regionalPartnerSearchElement = $('#regional-partner-search');
  const sourcePageId = 'program-information';

  ReactDOM.render(
    <Provider store={getStore()}>
      <RegionalPartnerSearch sourcePageId={sourcePageId} />
    </Provider>,
    regionalPartnerSearchElement[0]
  );
}

function initRegionalPartnerSearch() {
  initResponsive();
  showRegionalPartnerSearch();
}
