import React from 'react';
import ReactDOM from 'react-dom';

import Header from '@cdo/apps/layout/Header';

// Note: We're not waiting for document.ready; we expect this script to be inlined into
// the DOM immediately after the necessary #page-small-footer markup.
ReactDOM.render(
  <Header />,
  document.getElementById('cdo-header')
);
