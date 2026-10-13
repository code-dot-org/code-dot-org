import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import $ from 'jquery';
import React from 'react';
import {Provider} from 'react-redux';

import MiniAppLabView from '@cdo/apps/miniapplab/views/MiniAppLabView';
import {getStore} from '@cdo/apps/redux';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

import styles from './show.module.scss';

$(document).ready(function () {
  const container = document.getElementById('miniapplab-container');
  container.className = styles.page;
  createReactRoot(
    <Provider store={getStore()}>
      <ThemeProvider>
        <MiniAppLabView />
      </ThemeProvider>
    </Provider>,
    container,
    {legacyReactDomRender: true}
  );
});
