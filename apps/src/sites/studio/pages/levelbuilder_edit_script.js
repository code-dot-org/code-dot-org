/** @file JavaScript run only on the /s/:script_name/edit page. */
/* globals scriptData, i18nData */

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from '@cdo/apps/redux';
import reducer from './components/editorRedux';
import ScriptEditor from './components/ScriptEditor';

const store = createStore(reducer, scriptData.stages.filter(stage => stage.id));

ReactDOM.render(
  <Provider store={store}>
    <ScriptEditor scriptData={scriptData} i18nData={i18nData} />
  </Provider>,
  document.querySelector('.edit_container')
);
