import React from 'react';
import ReactDOM from 'react-dom';
import InitialSectionCreationInterstitial from '@cdo/apps/templates/sectionSetup/InitialSectionCreationInterstitial';
import {getStore} from '@cdo/apps/redux';
import {Provider} from 'react-redux';

document.addEventListener('DOMContentLoaded', () => {
  const mountPoint = document.createElement('div');
  document.body.appendChild(mountPoint);
  const store = getStore();
  function unmount() {
    ReactDOM.unmountComponentAtNode(mountPoint);
    document.body.removeChild(mountPoint);
  }

  ReactDOM.render(
    <Provider store={store}>
      <InitialSectionCreationInterstitial onClose={unmount} />
    </Provider>,
    mountPoint
  );
});
