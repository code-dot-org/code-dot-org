import {javascript} from '@codemirror/lang-javascript';
import {json} from '@codemirror/lang-json';
import {EditorState} from '@codemirror/state';
import {EditorView} from '@codemirror/view';

import {editorConfig} from '@cdo/apps/codemirror/editorConfig';

const levelbuilderEditorTheme = EditorView.theme({
  '&': {
    border: '1px solid #eee',
  },
});

function getLanguageExtension(mode) {
  if (mode === 'json') {
    return json();
  }
  if (mode === 'javascript') {
    return javascript();
  }
  return null;
}

/**
 * CodeMirror6 initializer, currently used by animation editor in levelbuilder.
 * Migration of full feature list from initializeCodeMirror (CM5) is in progress.
 * @param {!string|!Element} target - element or id of element to replace.
 * @param {!string} [mode] - editor syntax mode
 * @param {Object} [options] - optional arguments
 * @param {function} [options.callback] - onChange callback for editor
 */
function initializeCodeMirror6(target, mode = 'javascript', options = {}) {
  const node = target.nodeType ? target : document.getElementById(target);
  const {callback} = options;
  const editorContainer = document.createElement('div');
  node.style.display = 'none';
  node.insertAdjacentElement('afterend', editorContainer);

  let editor;

  const adapter = {
    getValue() {
      return editor.state.doc.toString();
    },
  };

  const extensions = [
    ...editorConfig,
    levelbuilderEditorTheme,
    EditorView.lineWrapping,
    EditorView.updateListener.of(update => {
      if (!update.docChanged) {
        return;
      }
      node.value = update.state.doc.toString();
      if (callback) {
        callback(adapter, update);
      }
    }),
  ];

  const languageExtension = getLanguageExtension(mode);
  if (languageExtension) {
    extensions.push(languageExtension);
  }

  editor = new EditorView({
    state: EditorState.create({
      doc: node.value || '',
      extensions,
    }),
    parent: editorContainer,
  });

  return adapter;
}

export default initializeCodeMirror6;
