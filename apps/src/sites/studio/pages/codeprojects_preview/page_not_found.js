import PageNotFound from '@codebridge/FilePreview/PageNotFound';
import React from 'react';

import {createReactRoot} from '@cdo/apps/util/createReactRoot';

document.addEventListener('DOMContentLoaded', () => {
  createReactRoot(
    <PageNotFound />,
    document.getElementById('page-not-found-container')
  );
});
