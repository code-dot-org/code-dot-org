import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import getScriptData from '@cdo/apps/util/getScriptData';
import FoormFormEditorManager from '@cdo/apps/code-studio/pd/foorm/editor/form/FoormFormEditorManager';
import {
  populateCodeMirror,
  resetCodeMirror,
  confirmNoUnsavedChanges
} from './editorHelpers.js';
import foorm, {
  setFetchableEntities
} from '@cdo/apps/code-studio/pd/foorm/editor/foormEditorRedux';

import 'survey-react/survey.css';

$(document).ready(function() {
  registerReducers({foorm});
  const store = getStore();

  const scriptData = getScriptData('props');
  const formNamesAndVersions = scriptData.formNamesAndVersions;
  getStore().dispatch(setFetchableEntities(formNamesAndVersions));

  ReactDOM.render(
    <Provider store={store}>
      <FoormFormEditorManager
        populateCodeMirror={populateCodeMirror}
        resetCodeMirror={resetCodeMirror}
        categories={scriptData.formCategories}
      />
    </Provider>,
    document.getElementById('editor-container')
  );
});

window.onbeforeunload = confirmNoUnsavedChanges;
