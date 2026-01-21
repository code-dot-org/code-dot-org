import { createRoot } from "react-dom/client";
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import NewDataDocForm from '@cdo/apps/levelbuilder/data-docs-editor/NewDataDocForm';
import {getStore} from '@cdo/apps/redux';

$(document).ready(() => {
  const store = getStore();

  const root = createRoot(document.getElementById('form'));

  root.render(<Provider store={store}>
    <NewDataDocForm />
  </Provider>);
});
