import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import getScriptData from '@cdo/apps/util/getScriptData';
import {
  populateCodeMirror,
  resetCodeMirror,
  confirmNoUnsavedChanges
} from '../forms/editorHelpers.js';
import FoormLibraryEditorManager from '@cdo/apps/code-studio/pd/foorm/FoormLibraryEditorManager';
import foorm, {
  setAvailableEntities
} from '@cdo/apps/code-studio/pd/foorm/editor/foormEditorRedux';

import 'survey-react/survey.css';

$(document).ready(function() {
  registerReducers({foorm});
  const store = getStore();

  const scriptData = getScriptData('props');
  const libraryNamesAndVersions = scriptData.libraryNamesAndVersions;
  getStore().dispatch(setAvailableEntities(libraryNamesAndVersions));

  ReactDOM.render(
    <Provider store={store}>
      <FoormLibraryEditorManager
        populateCodeMirror={populateCodeMirror}
        resetCodeMirror={resetCodeMirror}
        categories={scriptData.libraryCategories}
      />
    </Provider>,
    document.getElementById('editor-container')
  );
});

window.onbeforeunload = confirmNoUnsavedChanges;
