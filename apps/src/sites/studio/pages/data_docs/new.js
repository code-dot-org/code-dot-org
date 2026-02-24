import React from 'react';
import {Provider} from 'react-redux';

import NewDataDocForm from '@cdo/apps/levelbuilder/data-docs-editor/NewDataDocForm';
import {getStore} from '@cdo/apps/redux';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(() => {
  const store = getStore();

  createReactRoot(
    <Provider store={store}>
      <NewDataDocForm />
    </Provider>,
    document.getElementById('form')
  );
});
