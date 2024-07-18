import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';

import foorm, {
  setFetchableEntities,
} from '@cdo/apps/code-studio/pd/foorm/editor/foormEditorRedux';
import FoormLibraryEditorManager from '@cdo/apps/code-studio/pd/foorm/editor/library/FoormLibraryEditorManager';
import {getStore, registerReducers} from '@cdo/apps/redux';
import getScriptData from '@cdo/apps/util/getScriptData';

import {
  populateCodeMirror,
  resetCodeMirror,
  confirmNoUnsavedChanges,
} from '../forms/editorHelpers.js';

import 'survey-react/survey.css';

$(document).ready(function () {
  registerReducers({foorm});
  const store = getStore();

  const scriptData = getScriptData('props');
  const libraryNamesAndVersions = scriptData.libraryNamesAndVersions;
  getStore().dispatch(setFetchableEntities(libraryNamesAndVersions));

  const root = createRoot(document.getElementById('editor-container'));

  root.render(
    <Provider store={store}>
      <FoormLibraryEditorManager
        populateCodeMirror={populateCodeMirror}
        resetCodeMirror={resetCodeMirror}
        categories={scriptData.libraryCategories}
      />
    </Provider>
  );
});

window.onbeforeunload = confirmNoUnsavedChanges;
