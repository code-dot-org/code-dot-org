import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import getScriptData from '@cdo/apps/util/getScriptData';
import initializeCodeMirror from '@cdo/apps/code-studio/initializeCodeMirror';
import FoormLibraryEditorManager from '@cdo/apps/code-studio/pd/foorm/FoormLibraryEditorManager';
import foorm, {
  setLibraryQuestion,
  setHasError
} from '@cdo/apps/code-studio/pd/foorm/library_editor/foormLibraryEditorRedux';
import _ from 'lodash';

import 'survey-react/survey.css';

let codeMirror = null;

$(document).ready(function() {
  registerReducers({foorm});
  const store = getStore();
  ReactDOM.render(
    <Provider store={store}>
      <FoormLibraryEditorManager
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
    const libraryQuestion = JSON.parse(editor.getValue());
    updateLibraryQuestion(libraryQuestion);
  } catch (e) {
    // There is a JSON error.
    getStore().dispatch(setLibraryQuestion({}));
    getStore().dispatch(setHasError(true));
  }
}

const updateLibraryQuestion = libraryQuestion => {
  getStore().dispatch(setLibraryQuestion(libraryQuestion));
  getStore().dispatch(setHasError(false));
};

function resetCodeMirror(json) {
  if (codeMirror) {
    codeMirror.setValue(JSON.stringify(json, null, 2));
    getStore().dispatch(setHasError(false));
  }
}

window.onbeforeunload = evt => {
  let storeState = getStore().getState().foorm;
  if (
    storeState.hasError ||
    !_.isEqual(storeState.lastSavedFormQuestions, storeState.formQuestions)
  ) {
    return 'Are you sure you want to exit? You may have unsaved changes.';
  }
};
