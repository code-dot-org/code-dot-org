import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';

import NewDataDocForm from '@cdo/apps/lib/levelbuilder/data-docs-editor/NewDataDocForm';
import {getStore} from '@cdo/apps/redux';

$(document).ready(() => {
  const store = getStore();

  const root = createRoot(document.getElementById('form'));

  root.render(
    <Provider store={store}>
      <NewDataDocForm />
    </Provider>
  );
});
