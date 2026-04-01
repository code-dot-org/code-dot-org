import React from 'react';
import {Provider} from 'react-redux';

import NewJitPlConceptForm from '@cdo/apps/levelbuilder/jit-pl-concepts-editor/NewJitPlConceptForm';
import {getStore} from '@cdo/apps/redux';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(() => {
  const store = getStore();

  createReactRoot(
    <Provider store={store}>
      <NewJitPlConceptForm />
    </Provider>,
    document.getElementById('new-jit-pl-concept-form'),
    {
      legacyReactDomRender: true,
    }
  );
});
