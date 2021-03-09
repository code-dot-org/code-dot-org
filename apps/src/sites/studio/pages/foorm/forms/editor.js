import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import getScriptData from '@cdo/apps/util/getScriptData';
import FormEditorManager from '@cdo/apps/code-studio/pd/foorm/editor/form/FormEditorManager';
import {codeMirrorHelper, confirmNoUnsavedChanges} from './editorHelpers.js';
import foorm, {
  setAvailableEntities
} from '@cdo/apps/code-studio/pd/foorm/editor/foormEditorRedux';
import _ from 'lodash';

import 'survey-react/survey.css';

$(document).ready(function() {
  registerReducers({foorm});
  const store = getStore();

  const scriptData = getScriptData('props');
  const namesAndVersions = scriptData.namesAndVersions;
  getStore().dispatch(setAvailableEntities(namesAndVersions));

  ReactDOM.render(
    <Provider store={store}>
      <FormEditorManager
        populateCodeMirror={codeMirrorHelper.populate}
        resetCodeMirror={codeMirrorHelper.reset}
        categories={scriptData.categories}
      />
    </Provider>,
    document.getElementById('editor-container')
  );
});

window.onbeforeunload = confirmNoUnsavedChanges;
