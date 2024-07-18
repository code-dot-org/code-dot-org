import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';

import foorm, {
  setFetchableEntities,
} from '@cdo/apps/code-studio/pd/foorm/editor/foormEditorRedux';
import FoormFormEditorManager from '@cdo/apps/code-studio/pd/foorm/editor/form/FoormFormEditorManager';
import {getStore, registerReducers} from '@cdo/apps/redux';
import getScriptData from '@cdo/apps/util/getScriptData';

import {
  populateCodeMirror,
  resetCodeMirror,
  confirmNoUnsavedChanges,
} from './editorHelpers.js';

import 'survey-react/survey.css';

$(document).ready(function () {
  registerReducers({foorm});
  const store = getStore();

  const scriptData = getScriptData('props');
  const formNamesAndVersions = scriptData.formNamesAndVersions;
  getStore().dispatch(setFetchableEntities(formNamesAndVersions));

  const root = createRoot(document.getElementById('editor-container'));

  root.render(
    <Provider store={store}>
      <FoormFormEditorManager
        populateCodeMirror={populateCodeMirror}
        resetCodeMirror={resetCodeMirror}
        categories={scriptData.formCategories}
      />
    </Provider>
  );
});

window.onbeforeunload = confirmNoUnsavedChanges;
