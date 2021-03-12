import {getStore} from '@cdo/apps/redux';
import initializeCodeMirror from '@cdo/apps/code-studio/initializeCodeMirror';
import {
  setQuestions,
  setHasJSONError
} from '@cdo/apps/code-studio/pd/foorm/editor/foormEditorRedux';
import _ from 'lodash';

let codeMirror;

export function populateCodeMirror() {
  const codeMirrorArea = document.getElementsByTagName('textarea')[0];

  const updateQuestions = questions => {
    getStore().dispatch(setQuestions(questions));
    getStore().dispatch(setHasJSONError(false));
  };

  function onCodeMirrorChange(editor) {
    try {
      const questions = JSON.parse(editor.getValue());
      updateQuestions(questions);
    } catch (e) {
      // There is a JSON error.
      getStore().dispatch(setQuestions({}));
      getStore().dispatch(setHasJSONError(true));
    }
  }

  codeMirror = initializeCodeMirror(codeMirrorArea, 'application/json', {
    callback: _.debounce(onCodeMirrorChange, 250)
  });
}

export function resetCodeMirror(json) {
  if (codeMirror) {
    codeMirror.setValue(JSON.stringify(json, null, 2));
    getStore().dispatch(setHasJSONError(false));
  }
}

export function confirmNoUnsavedChanges(evt) {
  let storeState = getStore().getState().foorm;
  if (
    storeState.hasJSONError ||
    !_.isEqual(storeState.lastSavedQuestions, storeState.questions)
  ) {
    return 'Are you sure you want to exit? You may have unsaved changes.';
  }
}
