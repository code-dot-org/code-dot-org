import {javascript} from '@codemirror/lang-javascript';
import {EditorState} from '@codemirror/state';
import {EditorView} from '@codemirror/view';

import {editorConfig} from '@cdo/apps/codemirror/editorConfig';

const levelbuilderEditorTheme = EditorView.theme({
  '&': {
    border: '1px solid #eee',
  },
});

/**
 * CodeMirror6 initializer, currently used by Game Lab levelbuilder editor.
 * Migration of full feature list from initializeCodeMirror (CM5) is in progress.
 * @param {!string|!Element} target - element or id of element to replace.
 */
function initializeCodeMirror6(target) {
  const node = target.nodeType ? target : document.getElementById(target);
  const editorContainer = document.createElement('div');
  node.style.display = 'none';
  node.insertAdjacentElement('afterend', editorContainer);

  return new EditorView({
    state: EditorState.create({
      doc: node.value || '',
      extensions: [
        ...editorConfig,
        javascript(),
        levelbuilderEditorTheme,
        EditorView.lineWrapping,
        EditorView.updateListener.of(update => {
          if (!update.docChanged) {
            return;
          }
          node.value = update.state.doc.toString();
        }),
      ],
    }),
    parent: editorContainer,
  });
}

export default initializeCodeMirror6;
