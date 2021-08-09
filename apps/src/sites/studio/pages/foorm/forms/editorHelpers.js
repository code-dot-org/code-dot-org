import {getStore} from '@cdo/apps/redux';
import initializeCodeMirror from '@cdo/apps/code-studio/initializeCodeMirror';
import {
  setQuestions,
  setHasJSONError,
  setHasLintError
} from '@cdo/apps/code-studio/pd/foorm/editor/foormEditorRedux';
import _ from 'lodash';

let codeMirror;

// this regex is designed to match strings like '"name": "some_question_name"'
// we want to match keys named "name" and "value" because "value" keys are used for matrix questions
// we capture the value associated with the matched key to validate it with the next regex
const nameKeyRegex = new RegExp(/"(?:name|value)"\:\s*"(.+)",?/gi);

// this regex is used to ensure the strings contain only alphanumeric (case insensitive) and underscore characters
const nameKeyValidator = new RegExp(/^[a-z0-9_]+$/i);

// performs additional key validation
// (non-basic characters can get stripped when being transferred to the server)
export const lintFoormKeys = (text, options, cm) => {
  const annotations = [];

  let hasLintErrors = false;
  let match;
  while ((match = nameKeyRegex.exec(text)) !== null) {
    const nameValue = match[1];
    if (!nameKeyValidator.test(nameValue)) {
      hasLintErrors = true;
      annotations.push({
        message: 'Question names should only contain letters and underscores.',
        severity: 'error',
        from: cm.posFromIndex(match.index),
        to: cm.posFromIndex(match.index + match[0].length)
      });
    }
  }

  getStore().dispatch(setHasLintError(hasLintErrors));

  return annotations;
};

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
    callback: _.debounce(onCodeMirrorChange, 250),
    additionalAnnotations: lintFoormKeys
  });
}

export function resetCodeMirror(json) {
  if (codeMirror) {
    codeMirror.setValue(JSON.stringify(json, null, 2));
    getStore().dispatch(setHasLintError(false));
    getStore().dispatch(setHasJSONError(false));
  }
}

export function confirmNoUnsavedChanges(evt) {
  let storeState = getStore().getState().foorm;
  if (
    storeState.hasJSONError ||
    storeState.hasLintError ||
    !_.isEqual(storeState.lastSavedQuestions, storeState.questions)
  ) {
    return 'Are you sure you want to exit? You may have unsaved changes.';
  }
}
