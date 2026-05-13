import $ from 'jquery';
import React from 'react';
import {Provider} from 'react-redux';

import PortfolioGallery from '@cdo/apps/portfolio/PortfolioGallery';
import {getStore} from '@cdo/apps/redux';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const {userName} = getScriptData('portfoliopage');
  createReactRoot(
    <Provider store={getStore()}>
      <PortfolioGallery userName={userName} />
    </Provider>,
    document.getElementById('portfolio-container'),
    {
      legacyReactDomRender: true,
    }
  );
});
