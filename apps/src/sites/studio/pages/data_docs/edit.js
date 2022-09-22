import React from 'react';
import ReactDOM from 'react-dom';
import {getStore} from '@cdo/apps/redux';
import {Provider} from 'react-redux';

$(document).ready(() => {
  const store = getStore();
  ReactDOM.render(
    <Provider store={store}>
      <p>Data doc form editor</p>
    </Provider>,
    document.getElementById('view-data-doc')
  );
});
