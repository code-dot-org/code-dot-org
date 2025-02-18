import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {getStore} from '@cdo/apps/redux';
import InitialSectionCreationInterstitial from '@cdo/apps/templates/sectionSetup/InitialSectionCreationInterstitial';
import {trySetLocalStorage, tryGetLocalStorage} from '@cdo/apps/utils';

const INITIAL_DIALOG_DISMISSED = 'initial_section_creation_dialog_dismissed';

document.addEventListener('DOMContentLoaded', () => {
  // Component should only be displayed on first page load of first log-in
  // Set local storage and check whether component has been seen before.
  if (tryGetLocalStorage(INITIAL_DIALOG_DISMISSED, 'false') === 'true') {
    return;
  }
  trySetLocalStorage(INITIAL_DIALOG_DISMISSED, 'true');
  const mountPoint = document.createElement('div');
  document.body.appendChild(mountPoint);
  const store = getStore();

  ReactDOM.render(
    <Provider store={store}>
      <InitialSectionCreationInterstitial />
    </Provider>,
    mountPoint
  );
});
