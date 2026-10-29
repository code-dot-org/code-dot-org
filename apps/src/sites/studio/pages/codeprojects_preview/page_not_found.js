import React from 'react';

import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import PageNotFound from '@cdo/apps/weblab2/htmlPreview/PageNotFound';

document.addEventListener('DOMContentLoaded', () => {
  createReactRoot(
    <PageNotFound />,
    document.getElementById('page-not-found-container')
  );
});
