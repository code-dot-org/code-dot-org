import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import RegionalPartnerSearch from '@cdo/apps/templates/RegionalPartnerSearch';
import {getStore, registerReducers} from '@cdo/apps/redux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import responsive from '@cdo/apps/code-studio/responsiveRedux';
import initResponsive from '@cdo/apps/code-studio/responsive';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

registerReducers({isRtl, responsive});

$(document).ready(initRegionalPartnerSearch);

function showRegionalPartnerSearch() {
  const regionalPartnerSearchElement = $('#regional-partner-search');
  const sourcePageId = 'program-information';

  analyticsReporter.sendEvent(EVENTS.RP_LANDING_PAGE_VISITED_EVENT);

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
