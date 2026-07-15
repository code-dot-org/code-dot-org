import $ from 'jquery';
import React from 'react';
import {Provider} from 'react-redux';

import {getStore} from '@cdo/apps/redux';
import ScrapbookGallery from '@cdo/apps/scrapbook/ScrapbookGallery';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const {userName} = getScriptData('scrapbookpage');
  createReactRoot(
    <Provider store={getStore()}>
      <ScrapbookGallery userName={userName} />
    </Provider>,
    document.getElementById('scrapbook-container'),
    {
      legacyReactDomRender: true,
    }
  );
});
