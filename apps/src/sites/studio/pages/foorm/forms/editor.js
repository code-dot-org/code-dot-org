import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import getScriptData from '@cdo/apps/util/getScriptData';
import FormEditorManager from '@cdo/apps/code-studio/pd/foorm/editor/form/FormEditorManager';
import foorm from '@cdo/apps/code-studio/pd/foorm/editor/foormEditorRedux';
import {codeMirrorHelper, confirmNoUnsavedChanges} from './editorHelpers.js';

import 'survey-react/survey.css';

$(document).ready(function() {
  registerReducers({foorm});
  const store = getStore();
  ReactDOM.render(
    <Provider store={store}>
      <FormEditorManager
        populateCodeMirror={codeMirrorHelper.populate}
        resetCodeMirror={codeMirrorHelper.reset}
        {...getScriptData('props')}
      />
    </Provider>,
    document.getElementById('editor-container')
  );
});

window.onbeforeunload = confirmNoUnsavedChanges;
