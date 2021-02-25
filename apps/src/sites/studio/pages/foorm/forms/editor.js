import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import getScriptData from '@cdo/apps/util/getScriptData';
import initializeCodeMirror from '@cdo/apps/code-studio/initializeCodeMirror';
import FormEditorManager from '@cdo/apps/code-studio/pd/foorm/editor/form/FormEditorManager';
import foorm, {
  setFormQuestions,
  setHasJSONError
} from '@cdo/apps/code-studio/pd/foorm/editor/foormEditorRedux';
import _ from 'lodash';

import 'survey-react/survey.css';

let codeMirror = null;

$(document).ready(function() {
  registerReducers({foorm});
  const store = getStore();
  ReactDOM.render(
    <Provider store={store}>
      <FormEditorManager
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
    callback: _.debounce(onCodeMirrorChange, 250)
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
    getStore().dispatch(setHasJSONError(true));
  }
}

const updateFormQuestions = formQuestions => {
  getStore().dispatch(setFormQuestions(formQuestions));
  getStore().dispatch(setHasJSONError(false));
};

function resetCodeMirror(json) {
  if (codeMirror) {
    codeMirror.setValue(JSON.stringify(json, null, 2));
    getStore().dispatch(setHasJSONError(false));
  }
}

window.onbeforeunload = evt => {
  let storeState = getStore().getState().foorm;
  if (
    storeState.hasJSONError ||
    !_.isEqual(storeState.lastSavedFormQuestions, storeState.formQuestions)
  ) {
    return 'Are you sure you want to exit? You may have unsaved changes.';
  }
};
