import React from 'react';
import ReactDOM from 'react-dom';

import PageNotFound from '@cdo/apps/weblab2/htmlPreview/PageNotFound';

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <PageNotFound />,
    document.getElementById('page-not-found-container')
  );
});
