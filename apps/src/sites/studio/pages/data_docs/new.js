import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import NewDataDocForm from '@cdo/apps/lib/levelbuilder/data-docs-editor/NewDataDocForm';
import {getStore} from '@cdo/apps/redux';

$(document).ready(() => {
  const store = getStore();

  ReactDOM.render(
    <Provider store={store}>
      <NewDataDocForm />
    </Provider>,
    document.getElementById('form')
  );
});
