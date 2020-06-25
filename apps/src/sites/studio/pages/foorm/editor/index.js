import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import getScriptData from '@cdo/apps/util/getScriptData';
import initializeCodeMirror from '@cdo/apps/code-studio/initializeCodeMirror';
import FoormEditorManager from '@cdo/apps/code-studio/pd/foorm/FoormEditorManager';
import foorm, {
  setFormQuestions,
  setHasError
} from '@cdo/apps/code-studio/pd/foorm/foormEditorRedux';

import 'survey-react/survey.css';

let codeMirror = null;

$(document).ready(function() {
  registerReducers({foorm});
  const store = getStore();
  ReactDOM.render(
    <Provider store={store}>
      <FoormEditorManager
        updateFormQuestions={updateFormQuestions}
        populateCodeMirror={populateCodeMirror}
        resetCodeMirror={resetCodeMirror}
        {...getScriptData('props')}
      />
    </Provider>,
    document.getElementById('editor-container')
  );
});

// We want to wait to fill in the code mirror until we have selected
// a configuration to populate it with.
function populateCodeMirror() {
  const codeMirrorArea = document.getElementsByTagName('textarea')[0];
  codeMirror = initializeCodeMirror(codeMirrorArea, 'application/json', {
    callback: onCodeMirrorChange
  });
}

// Functions for keeping the code mirror content in the redux store.
function onCodeMirrorChange(editor) {
  try {
    const formQuestions = JSON.parse(editor.getValue());
    updateFormQuestions(formQuestions);
  } catch (e) {
    // There is a JSON error.
    getStore().dispatch(setFormQuestions({}));
    getStore().dispatch(setHasError(true));
  }
}

const updateFormQuestions = formQuestions => {
  getStore().dispatch(setFormQuestions(formQuestions));
  getStore().dispatch(setHasError(false));
};

function resetCodeMirror(json) {
  if (codeMirror) {
    codeMirror.setValue(JSON.stringify(json, null, 2));
    getStore().dispatch(setHasError(false));
  }
}
