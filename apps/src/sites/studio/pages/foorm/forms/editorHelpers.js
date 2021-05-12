import {getStore} from '@cdo/apps/redux';
import CodeMirror from 'codemirror';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/javascript-lint';
import initializeCodeMirror from '@cdo/apps/code-studio/initializeCodeMirror';
import {
  setQuestions,
  setHasJSONError
} from '@cdo/apps/code-studio/pd/foorm/editor/foormEditorRedux';
import _ from 'lodash';

let codeMirror;

const nameKeyRegex = new RegExp(/"(?:name|value)"\:\s*"(.+)",?/gi);
const nameKeyValidator = new RegExp(/^[a-z0-9_]+$/i);

// performs additional key validation
// (non-basic characters can get stripped when being transferred to the server)
export const lintFoormKeys = (text, options, cm) => {
  const annotations = [];
  const nameEntries = Array.from(text.matchAll(nameKeyRegex));
  nameEntries.forEach(match => {
    const nameValue = match[1];
    if (!nameKeyValidator.test(nameValue)) {
      annotations.push({
        message: 'Question keys should only contain letters and underscores.',
        severity: 'error',
        from: cm.posFromIndex(match.index),
        to: cm.posFromIndex(match.index + match[0].length)
      });
    }
  });

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
    getAnnotations: (text, options, cm) => {
      const cmValidation = cm.getHelper(CodeMirror.Pos(0, 0), 'lint')(
        text,
        {},
        cm
      );
      const foormValidation = lintFoormKeys(text, options, cm);
      return [...cmValidation, ...foormValidation];
    }
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
